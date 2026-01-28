import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isOpen: boolean;
  openingHours: string;
  lastUpdated: Date;
}

interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  strength: string;
}

interface MedicineStock {
  id: string;
  pharmacyId: string;
  medicineId: string;
  quantity: number;
  price: number;
  expiryDate: Date;
  isAvailable: boolean;
  lastUpdated: Date;
}

interface PharmacyDB extends DBSchema {
  pharmacies: {
    key: string;
    value: Pharmacy;
  };
  medicines: {
    key: string;
    value: Medicine;
    indexes: { 'by-name': string };
  };
  medicineStock: {
    key: string;
    value: MedicineStock;
    indexes: { 'by-pharmacy': string; 'by-medicine': string };
  };
}

class PharmacyDatabase {
  private db: IDBPDatabase<PharmacyDB> | null = null;

  async init() {
    try {
      this.db = await openDB<PharmacyDB>('pharmacy-db', 1, {
        upgrade(db) {
          db.createObjectStore('pharmacies', { keyPath: 'id' });
          
          const medicinesStore = db.createObjectStore('medicines', { keyPath: 'id' });
          medicinesStore.createIndex('by-name', 'name');
          
          const stockStore = db.createObjectStore('medicineStock', { keyPath: 'id' });
          stockStore.createIndex('by-pharmacy', 'pharmacyId');
          stockStore.createIndex('by-medicine', 'medicineId');
        },
      });
    } catch (error) {
      console.warn('IndexedDB not available for pharmacy data');
    }
  }

  async addPharmacy(pharmacy: Pharmacy) {
    try {
      if (!this.db) await this.init();
      if (this.db) {
        return this.db.put('pharmacies', pharmacy);
      }
    } catch (error) {
      console.warn('Failed to add pharmacy:', error);
    }
  }

  async getAllPharmacies(): Promise<Pharmacy[]> {
    try {
      if (!this.db) await this.init();
      if (this.db) {
        return this.db.getAll('pharmacies');
      }
    } catch (error) {
      console.warn('Failed to get pharmacies:', error);
    }
    return [];
  }

  async addMedicine(medicine: Medicine) {
    try {
      if (!this.db) await this.init();
      if (this.db) {
        return this.db.put('medicines', medicine);
      }
    } catch (error) {
      console.warn('Failed to add medicine:', error);
    }
  }

  async searchMedicines(query: string): Promise<Medicine[]> {
    try {
      if (!this.db) await this.init();
      if (this.db) {
        const allMedicines = await this.db.getAll('medicines');
        return allMedicines.filter(med => 
          med.name.toLowerCase().includes(query.toLowerCase()) ||
          med.genericName.toLowerCase().includes(query.toLowerCase())
        );
      }
    } catch (error) {
      console.warn('Failed to search medicines:', error);
    }
    return [];
  }

  async updateStock(stock: MedicineStock) {
    try {
      if (!this.db) await this.init();
      if (this.db) {
        return this.db.put('medicineStock', { ...stock, lastUpdated: new Date() });
      }
    } catch (error) {
      console.warn('Failed to update stock:', error);
    }
  }

  async getMedicineAvailability(medicineId: string): Promise<MedicineStock[]> {
    try {
      if (!this.db) await this.init();
      if (this.db) {
        return this.db.getAllFromIndex('medicineStock', 'by-medicine', medicineId);
      }
    } catch (error) {
      console.warn('Failed to get availability:', error);
    }
    return [];
  }

  async getPharmacyStock(pharmacyId: string): Promise<MedicineStock[]> {
    try {
      if (!this.db) await this.init();
      if (this.db) {
        return this.db.getAllFromIndex('medicineStock', 'by-pharmacy', pharmacyId);
      }
    } catch (error) {
      console.warn('Failed to get stock:', error);
    }
    return [];
  }
}

export const pharmacyDB = new PharmacyDatabase();
export type { Pharmacy, Medicine, MedicineStock };