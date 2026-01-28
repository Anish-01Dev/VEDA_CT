import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { healthRecordsDB, type HealthRecord } from '@/lib/health-records-db';

interface AddRecordFormProps {
  onClose: () => void;
  onSave: () => void;
}

const AddRecordForm = ({ onClose, onSave }: AddRecordFormProps) => {
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
    bloodGroup: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India'
    },
    allergies: [''],
    medications: [''],
    medicalHistory: [''],
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const addArrayField = (field: 'allergies' | 'medications' | 'medicalHistory') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayField = (field: 'allergies' | 'medications' | 'medicalHistory', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayField = (field: 'allergies' | 'medications' | 'medicalHistory', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const record: HealthRecord = {
        id: `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        patientId: `PAT-${Date.now()}`,
        patientName: formData.patientName,
        age: parseInt(formData.age),
        gender: formData.gender,
        bloodGroup: formData.bloodGroup || undefined,
        address: formData.address.street || formData.address.city || formData.address.state || formData.address.postalCode || formData.address.country !== 'India' 
          ? formData.address 
          : undefined,
        allergies: formData.allergies.filter(a => a.trim()),
        medications: formData.medications.filter(m => m.trim()),
        medicalHistory: formData.medicalHistory.filter(h => h.trim()),
        emergencyContact: formData.emergencyContact,
        lastUpdated: new Date(),
        syncStatus: 'pending'
      };

      await healthRecordsDB.saveHealthRecord(record);
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save record:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add New Health Record</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientName">Patient Name *</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value: 'male' | 'female' | 'other') => 
                  setFormData(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Input
                  id="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                  placeholder="e.g., A+, B-, O+"
                />
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Address</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, street: e.target.value }
                    }))}
                    placeholder="Enter street address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, city: e.target.value }
                      }))}
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, state: e.target.value }
                      }))}
                      placeholder="Enter state"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.address.postalCode}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, postalCode: e.target.value }
                      }))}
                      placeholder="Enter postal code"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.address.country}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, country: e.target.value }
                      }))}
                      placeholder="Enter country"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label>Allergies</Label>
              {formData.allergies.map((allergy, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    value={allergy}
                    onChange={(e) => updateArrayField('allergies', index, e.target.value)}
                    placeholder="Enter allergy"
                  />
                  {formData.allergies.length > 1 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => removeArrayField('allergies', index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addArrayField('allergies')} className="mt-2">
                <Plus className="w-4 h-4 mr-2" />
                Add Allergy
              </Button>
            </div>

            <div>
              <Label>Current Medications</Label>
              {formData.medications.map((medication, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    value={medication}
                    onChange={(e) => updateArrayField('medications', index, e.target.value)}
                    placeholder="Enter medication"
                  />
                  {formData.medications.length > 1 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => removeArrayField('medications', index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addArrayField('medications')} className="mt-2">
                <Plus className="w-4 h-4 mr-2" />
                Add Medication
              </Button>
            </div>

            <div>
              <Label>Medical History</Label>
              {formData.medicalHistory.map((history, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    value={history}
                    onChange={(e) => updateArrayField('medicalHistory', index, e.target.value)}
                    placeholder="Enter medical condition"
                  />
                  {formData.medicalHistory.length > 1 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => removeArrayField('medicalHistory', index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addArrayField('medicalHistory')} className="mt-2">
                <Plus className="w-4 h-4 mr-2" />
                Add Condition
              </Button>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Emergency Contact *</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyName">Name</Label>
                  <Input
                    id="emergencyName"
                    value={formData.emergencyContact.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                    }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                    }))}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="emergencyRelation">Relation</Label>
                <Input
                  id="emergencyRelation"
                  value={formData.emergencyContact.relation}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    emergencyContact: { ...prev.emergencyContact, relation: e.target.value }
                  }))}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Record'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddRecordForm;