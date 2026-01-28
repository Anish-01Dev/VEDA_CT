import { supabase } from './supabase';
import { healthRecordsDB, type HealthRecord, type Visit } from './health-records-db';

export interface SyncResult {
  success: boolean;
  syncedRecords: number;
  syncedVisits: number;
  errors: string[];
}

class HealthRecordsSyncService {
  private isOnline = navigator.onLine;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingRecords();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Sync all pending health records to Supabase
   */
  async syncAllRecords(): Promise<SyncResult> {
    if (!this.isOnline) {
      return {
        success: false,
        syncedRecords: 0,
        syncedVisits: 0,
        errors: ['No internet connection available']
      };
    }

    // Check if Supabase is properly configured
    if (!this.isSupabaseConfigured()) {
      return {
        success: false,
        syncedRecords: 0,
        syncedVisits: 0,
        errors: ['Supabase not configured. Please check your environment variables.']
      };
    }

    const result: SyncResult = {
      success: true,
      syncedRecords: 0,
      syncedVisits: 0,
      errors: []
    };

    try {
      // Get all local records
      const localRecords = await healthRecordsDB.getAllRecords();
      const pendingRecords = localRecords.filter(record => record.syncStatus === 'pending');

      // Sync each pending record
      for (const record of pendingRecords) {
        try {
          await this.syncHealthRecord(record);
          result.syncedRecords++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          result.errors.push(`Failed to sync record ${record.patientName}: ${errorMessage}`);
        }
      }

      // Sync visits for synced records
      const syncedRecords = localRecords.filter(record => record.syncStatus === 'synced');
      for (const record of syncedRecords) {
        try {
          const visits = await healthRecordsDB.getVisits(record.patientId);
          const pendingVisits = visits.filter(visit => !visit.id.includes('synced'));
          
          for (const visit of pendingVisits) {
            await this.syncVisit(visit, record.patientId);
            result.syncedVisits++;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          result.errors.push(`Failed to sync visits for ${record.patientName}: ${errorMessage}`);
        }
      }

      result.success = result.errors.length === 0;
    } catch (error) {
      result.success = false;
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Sync failed: ${errorMessage}`);
    }

    return result;
  }

  /**
   * Check if Supabase is properly configured
   */
  private isSupabaseConfigured(): boolean {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    return !!(url && key && 
      url !== 'https://placeholder.supabase.co' && 
      key !== 'placeholder-key');
  }

  /**
   * Sync a single health record to Supabase
   */
  private async syncHealthRecord(record: HealthRecord): Promise<void> {
    const supabaseRecord = {
      patient_id: record.patientId,
      patient_name: record.patientName,
      age: record.age,
      gender: record.gender,
      blood_group: record.bloodGroup || null,
      address: record.address ? {
        street: record.address.street,
        city: record.address.city,
        state: record.address.state,
        postal_code: record.address.postalCode,
        country: record.address.country
      } : null,
      allergies: record.allergies,
      medications: record.medications,
      medical_history: record.medicalHistory,
      emergency_contact: record.emergencyContact,
      created_at: record.lastUpdated.toISOString(),
      updated_at: new Date().toISOString()
    };

    // Check if record already exists
    const { data: existingRecord, error: selectError } = await supabase
      .from('health_records')
      .select('id')
      .eq('patient_id', record.patientId)
      .maybeSingle();

    if (selectError) {
      throw new Error(`Failed to check existing record: ${selectError.message}`);
    }

    if (existingRecord) {
      // Update existing record
      const { error } = await supabase
        .from('health_records')
        .update(supabaseRecord)
        .eq('patient_id', record.patientId);

      if (error) {
        throw new Error(`Failed to update record: ${error.message}`);
      }
    } else {
      // Insert new record
      const { error } = await supabase
        .from('health_records')
        .insert(supabaseRecord);

      if (error) {
        throw new Error(`Failed to insert record: ${error.message}`);
      }
    }

    // Update local record sync status
    const updatedRecord = { ...record, syncStatus: 'synced' as const };
    await healthRecordsDB.saveHealthRecord(updatedRecord);
  }

  /**
   * Sync a visit record to Supabase
   */
  private async syncVisit(visit: Visit, patientId: string): Promise<void> {
    const supabaseVisit = {
      patient_id: patientId,
      visit_date: visit.date.toISOString(),
      symptoms: visit.symptoms,
      diagnosis: visit.diagnosis,
      prescription: visit.prescription,
      doctor_notes: visit.doctorNotes,
      vitals: visit.vitals,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('visits')
      .insert(supabaseVisit);

    if (error) {
      throw new Error(`Failed to sync visit: ${error.message}`);
    }

    // Mark visit as synced by updating its ID
    const syncedVisit = { ...visit, id: `${visit.id}-synced` };
    await healthRecordsDB.saveVisit(syncedVisit);
  }

  /**
   * Auto-sync pending records when online
   */
  private async syncPendingRecords(): Promise<void> {
    if (!this.isOnline) return;

    try {
      const result = await this.syncAllRecords();
      if (result.success) {
        console.log(`Synced ${result.syncedRecords} records and ${result.syncedVisits} visits`);
      }
    } catch (error) {
      console.error('Auto-sync failed:', error);
    }
  }

  /**
   * Get sync status summary
   */
  async getSyncStatus(): Promise<{
    totalRecords: number;
    syncedRecords: number;
    pendingRecords: number;
    totalVisits: number;
    syncedVisits: number;
  }> {
    const records = await healthRecordsDB.getAllRecords();
    const syncedRecords = records.filter(r => r.syncStatus === 'synced');
    const pendingRecords = records.filter(r => r.syncStatus === 'pending');

    let totalVisits = 0;
    let syncedVisits = 0;

    for (const record of records) {
      const visits = await healthRecordsDB.getVisits(record.patientId);
      totalVisits += visits.length;
      syncedVisits += visits.filter(v => v.id.includes('synced')).length;
    }

    return {
      totalRecords: records.length,
      syncedRecords: syncedRecords.length,
      pendingRecords: pendingRecords.length,
      totalVisits,
      syncedVisits
    };
  }

  /**
   * Download all records from Supabase to local IndexedDB
   */
  async downloadFromSupabase(): Promise<{
    success: boolean;
    downloadedRecords: number;
    downloadedVisits: number;
    errors: string[];
  }> {
    if (!this.isSupabaseConfigured()) {
      return {
        success: false,
        downloadedRecords: 0,
        downloadedVisits: 0,
        errors: ['Supabase not configured. Please check your environment variables.']
      };
    }

    const errors: string[] = [];
    let downloadedRecords = 0;
    let downloadedVisits = 0;

    try {
      // Download health records
      const { data: supabaseRecords, error: recordsError } = await supabase
        .from('health_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (recordsError) {
        errors.push(`Failed to fetch records: ${recordsError.message}`);
      } else if (supabaseRecords) {
        for (const supabaseRecord of supabaseRecords) {
          try {
            // Convert Supabase format to local format
            const localRecord: HealthRecord = {
              id: supabaseRecord.id,
              patientId: supabaseRecord.patient_id,
              patientName: supabaseRecord.patient_name,
              age: supabaseRecord.age,
              gender: supabaseRecord.gender,
              bloodGroup: supabaseRecord.blood_group || undefined,
              address: supabaseRecord.address ? {
                street: supabaseRecord.address.street,
                city: supabaseRecord.address.city,
                state: supabaseRecord.address.state,
                postalCode: supabaseRecord.address.postal_code,
                country: supabaseRecord.address.country
              } : undefined,
              allergies: supabaseRecord.allergies || [],
              medications: supabaseRecord.medications || [],
              medicalHistory: supabaseRecord.medical_history || [],
              emergencyContact: supabaseRecord.emergency_contact,
              lastUpdated: new Date(supabaseRecord.updated_at),
              syncStatus: 'synced'
            };

            // Save to local IndexedDB
            await healthRecordsDB.saveHealthRecord(localRecord);
            downloadedRecords++;
          } catch (error) {
            errors.push(`Failed to save record ${supabaseRecord.patient_id}: ${error}`);
          }
        }
      }

      // Download visits
      const { data: supabaseVisits, error: visitsError } = await supabase
        .from('visits')
        .select('*')
        .order('visit_date', { ascending: false });

      if (visitsError) {
        errors.push(`Failed to fetch visits: ${visitsError.message}`);
      } else if (supabaseVisits) {
        for (const supabaseVisit of supabaseVisits) {
          try {
            // Convert Supabase format to local format
            const localVisit: Visit = {
              id: supabaseVisit.id,
              patientId: supabaseVisit.patient_id,
              date: new Date(supabaseVisit.visit_date),
              diagnosis: supabaseVisit.diagnosis,
              symptoms: supabaseVisit.symptoms || [],
              prescription: supabaseVisit.prescription || [],
              doctorNotes: supabaseVisit.doctor_notes || '',
              vitals: supabaseVisit.vitals || {},
              syncStatus: 'synced' as const
            };

            // Save to local IndexedDB
            await healthRecordsDB.saveVisit(localVisit);
            downloadedVisits++;
          } catch (error) {
            errors.push(`Failed to save visit ${supabaseVisit.id}: ${error}`);
          }
        }
      }

      return {
        success: errors.length === 0,
        downloadedRecords,
        downloadedVisits,
        errors
      };

    } catch (error) {
      return {
        success: false,
        downloadedRecords: 0,
        downloadedVisits: 0,
        errors: [`Download failed: ${error}`]
      };
    }
  }
}

export const healthRecordsSync = new HealthRecordsSyncService();
