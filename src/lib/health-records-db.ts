import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface HealthRecord {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  allergies: string[];
  medications: string[];
  medicalHistory: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  lastUpdated: Date;
  syncStatus: 'synced' | 'pending' | 'offline';
}

interface Visit {
  id: string;
  patientId: string;
  date: Date;
  symptoms: string[];
  diagnosis: string;
  prescription: string[];
  doctorNotes: string;
  vitals: {
    temperature?: number;
    bloodPressure?: string;
    heartRate?: number;
    weight?: number;
  };
  syncStatus?: 'synced' | 'pending' | 'offline';
}

interface HealthRecordsDB extends DBSchema {
  healthRecords: {
    key: string;
    value: HealthRecord;
    indexes: { 'by-patient': string };
  };
  visits: {
    key: string;
    value: Visit;
    indexes: { 'by-patient': string; 'by-date': Date };
  };
}

class HealthRecordsDatabase {
  private db: IDBPDatabase<HealthRecordsDB> | null = null;

  async init() {
    try {
      this.db = await openDB<HealthRecordsDB>('health-records', 1, {
        upgrade(db) {
          const recordsStore = db.createObjectStore('healthRecords', { keyPath: 'id' });
          recordsStore.createIndex('by-patient', 'patientId');

          const visitsStore = db.createObjectStore('visits', { keyPath: 'id' });
          visitsStore.createIndex('by-patient', 'patientId');
          visitsStore.createIndex('by-date', 'date');
        },
      });
    } catch (error) {
      console.warn('IndexedDB not available, using memory storage');
    }
  }

  async saveHealthRecord(record: HealthRecord) {
    try {
      if (!this.db) await this.init();
      if (this.db) {
        return this.db.put('healthRecords', { ...record, lastUpdated: new Date() });
      }
    } catch (error) {
      console.warn('Failed to save record:', error);
    }
  }

  async getAllRecords(): Promise<HealthRecord[]> {
    try {
      if (!this.db) await this.init();
      if (this.db) {
        return this.db.getAll('healthRecords');
      }
    } catch (error) {
      console.warn('Failed to get records:', error);
    }
    return [];
  }

  async getVisits(patientId: string): Promise<Visit[]> {
    try {
      if (!this.db) await this.init();
      if (this.db) {
        return this.db.getAllFromIndex('visits', 'by-patient', patientId);
      }
    } catch (error) {
      console.warn('Failed to get visits:', error);
    }
    return [];
  }

  async saveVisit(visit: Visit) {
    try {
      if (!this.db) await this.init();
      if (this.db) {
        return this.db.put('visits', visit);
      }
    } catch (error) {
      console.warn('Failed to save visit:', error);
    }
  }
}

export const healthRecordsDB = new HealthRecordsDatabase();
export type { HealthRecord, Visit };