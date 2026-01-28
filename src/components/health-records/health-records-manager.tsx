import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Plus, 
  FileText, 
  Calendar,
  AlertCircle,
  Download,
  Cloud,
  CloudOff,
  FileDown,
  RefreshCw
} from 'lucide-react';
import { healthRecordsDB, type HealthRecord, type Visit } from '@/lib/health-records-db';
import { healthRecordsSync, type SyncResult } from '@/lib/health-records-sync';
import { pdfExportService } from '@/lib/pdf-export';
import AddRecordForm from './add-record-form';

const HealthRecordsManager = () => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    totalRecords: number;
    syncedRecords: number;
    pendingRecords: number;
    totalVisits: number;
    syncedVisits: number;
  } | null>(null);

  useEffect(() => {
    loadRecords();
    loadSyncStatus();
  }, []);

  const loadRecords = async () => {
    try {
      const allRecords = await healthRecordsDB.getAllRecords();
      setRecords(allRecords);
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSyncStatus = async () => {
    try {
      const status = await healthRecordsSync.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  };

  const loadVisits = async (patientId: string) => {
    try {
      const patientVisits = await healthRecordsDB.getVisits(patientId);
      setVisits(patientVisits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Failed to load visits:', error);
    }
  };

  const selectRecord = (record: HealthRecord) => {
    setSelectedRecord(record);
    loadVisits(record.patientId);
  };

  const exportData = () => {
    const data = { records, visits };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'health-records-backup.json';
    a.click();
  };

  const syncToSupabase = async () => {
    setIsSyncing(true);
    try {
      const result: SyncResult = await healthRecordsSync.syncAllRecords();
      
      if (result.success) {
        alert(`Sync completed successfully!\nSynced ${result.syncedRecords} records and ${result.syncedVisits} visits.`);
        await loadRecords();
        await loadSyncStatus();
      } else {
        alert(`Sync completed with errors:\n${result.errors.join('\n')}`);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Sync failed. Please check your internet connection and try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const downloadFromSupabase = async () => {
    setIsDownloading(true);
    try {
      const result = await healthRecordsSync.downloadFromSupabase();
      
      if (result.success) {
        alert(`Download completed successfully!\nDownloaded ${result.downloadedRecords} records and ${result.downloadedVisits} visits.`);
        await loadRecords();
        await loadSyncStatus();
      } else {
        alert(`Download completed with errors:\n${result.errors.join('\n')}`);
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please check your internet connection and try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const exportToPDF = async () => {
    if (!selectedRecord) {
      alert('Please select a patient record to export to PDF.');
      return;
    }

    setIsExportingPDF(true);
    try {
      await pdfExportService.exportHealthRecord(selectedRecord, visits, {
        includeVisits: true,
        includeEmergencyInfo: true
      });
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const exportAllToPDF = async () => {
    if (records.length === 0) {
      alert('No records to export.');
      return;
    }

    setIsExportingPDF(true);
    try {
      const visitsMap = new Map<string, Visit[]>();
      
      // Load visits for all records
      for (const record of records) {
        const recordVisits = await healthRecordsDB.getVisits(record.patientId);
        visitsMap.set(record.patientId, recordVisits);
      }

      await pdfExportService.exportMultipleRecords(records, visitsMap, {
        includeVisits: true,
        includeEmergencyInfo: true
      });
    } catch (error) {
      console.error('Bulk PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold">Digital Health Records</h1>
          <Badge variant="outline" className="text-green-600 border-green-600">
            Offline Ready
          </Badge>
          {syncStatus && (
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              {syncStatus.syncedRecords}/{syncStatus.totalRecords} Synced
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={syncToSupabase} 
            variant="outline" 
            size="sm"
            disabled={isSyncing || !navigator.onLine}
          >
            {isSyncing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : navigator.onLine ? (
              <Cloud className="w-4 h-4 mr-2" />
            ) : (
              <CloudOff className="w-4 h-4 mr-2" />
            )}
            {isSyncing ? 'Syncing...' : 'Sync to Cloud'}
          </Button>
          <Button 
            onClick={downloadFromSupabase} 
            disabled={isDownloading}
            variant="outline" 
            size="sm"
          >
            {isDownloading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isDownloading ? 'Downloading...' : 'Download from Cloud'}
          </Button>
          <Button 
            onClick={exportToPDF} 
            variant="outline" 
            size="sm"
            disabled={!selectedRecord || isExportingPDF}
          >
            <FileDown className="w-4 h-4 mr-2" />
            {isExportingPDF ? 'Exporting...' : 'Export PDF'}
          </Button>
          <Button 
            onClick={exportAllToPDF} 
            variant="outline" 
            size="sm"
            disabled={records.length === 0 || isExportingPDF}
          >
            <FileDown className="w-4 h-4 mr-2" />
            {isExportingPDF ? 'Exporting...' : 'Export All PDF'}
          </Button>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button size="sm" onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Record
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Patients ({records.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {records.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No records found</p>
            ) : (
              records.map((record) => (
                <div
                  key={record.id}
                  onClick={() => selectRecord(record)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedRecord?.id === record.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{record.patientName}</p>
                      <p className="text-sm text-gray-500">
                        {record.age} years • {record.gender}
                      </p>
                    </div>
                    <Badge 
                      variant={record.syncStatus === 'synced' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {record.syncStatus}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {selectedRecord ? (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="visits">Visits</TabsTrigger>
                <TabsTrigger value="emergency">Emergency</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedRecord.patientName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Age</label>
                        <p>{selectedRecord.age} years</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Blood Group</label>
                        <p>{selectedRecord.bloodGroup || 'Not specified'}</p>
                      </div>
                    </div>

                    {selectedRecord.address && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Address</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm">
                            {selectedRecord.address.street && (
                              <span>{selectedRecord.address.street}<br /></span>
                            )}
                            {selectedRecord.address.city && selectedRecord.address.state && (
                              <span>{selectedRecord.address.city}, {selectedRecord.address.state}<br /></span>
                            )}
                            {selectedRecord.address.postalCode && (
                              <span>{selectedRecord.address.postalCode}<br /></span>
                            )}
                            {selectedRecord.address.country && selectedRecord.address.country !== 'India' && (
                              <span>{selectedRecord.address.country}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-gray-600">Allergies</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedRecord.allergies.length > 0 ? (
                          selectedRecord.allergies.map((allergy, index) => (
                            <Badge key={index} variant="destructive">
                              {allergy}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-gray-500">None reported</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Current Medications</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedRecord.medications.length > 0 ? (
                          selectedRecord.medications.map((med, index) => (
                            <Badge key={index} variant="outline">
                              {med}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-gray-500">None</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="visits">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Medical Visits ({visits.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {visits.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No visits recorded</p>
                    ) : (
                      <div className="space-y-4">
                        {visits.map((visit) => (
                          <div key={visit.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium">
                                {new Date(visit.date).toLocaleDateString()}
                              </p>
                              <Badge variant="outline">{visit.diagnosis}</Badge>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="font-medium">Symptoms: </span>
                                {visit.symptoms.join(', ')}
                              </div>
                              {visit.prescription.length > 0 && (
                                <div>
                                  <span className="font-medium">Prescription: </span>
                                  {visit.prescription.join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="emergency">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-5 h-5" />
                      Emergency Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h3 className="font-semibold text-red-800 mb-2">Emergency Contact</h3>
                      <div className="space-y-1">
                        <p><span className="font-medium">Name:</span> {selectedRecord.emergencyContact.name}</p>
                        <p><span className="font-medium">Phone:</span> {selectedRecord.emergencyContact.phone}</p>
                        <p><span className="font-medium">Relation:</span> {selectedRecord.emergencyContact.relation}</p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-800 mb-2">Critical Information</h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Blood Group:</span> {selectedRecord.bloodGroup || 'Unknown'}</p>
                        <div>
                          <span className="font-medium">Allergies:</span>
                          {selectedRecord.allergies.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedRecord.allergies.map((allergy, index) => (
                                <Badge key={index} variant="destructive" className="text-xs">
                                  {allergy}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="ml-2 text-gray-600">None known</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a patient to view their health record</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {showAddForm && (
        <AddRecordForm 
          onClose={() => setShowAddForm(false)}
          onSave={() => {
            loadRecords();
            setShowAddForm(false);
          }}
        />
      )}
    </div>
  );
};

export default HealthRecordsManager;