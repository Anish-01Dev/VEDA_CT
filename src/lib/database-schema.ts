import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

let db: Database | null = null;
let SQL: SqlJsStatic | null = null;

export interface DatabaseSchema {
  symptoms: SymptomRecord[];
  prescriptions: PrescriptionRecord[];
  mental_health: MentalHealthRecord[];
  sleep_data: SleepRecord[];
  period_data: PeriodRecord[];
  vaccine_data: VaccineRecord[];
  health_habits: HealthHabitRecord[];
  ai_sessions: AISessionRecord[];
  emergency_contacts: EmergencyContactRecord[];
  clinic_data: ClinicRecord[];
}

export interface SymptomRecord {
  id: number;
  timestamp: string;
  symptoms: string;
  analysis: string;
  confidence: number;
  severity: 'mild' | 'moderate' | 'severe' | 'emergency';
  language: string;
  user_notes?: string;
}

export interface PrescriptionRecord {
  id: number;
  timestamp: string;
  prescription_text: string;
  medicines: string; // JSON string
  doctor_name?: string;
  date?: string;
  confidence: number;
  language: string;
  image_path?: string;
}

export interface MentalHealthRecord {
  id: number;
  timestamp: string;
  mood_score: number;
  anxiety_level: number;
  depression_score: number;
  session_notes: string;
  ai_response: string;
  language: string;
}

export interface SleepRecord {
  id: number;
  timestamp: string;
  sleep_hours: number;
  sleep_quality: number;
  sleep_issues: string;
  ai_analysis: string;
  recommendations: string;
  language: string;
}

export interface PeriodRecord {
  id: number;
  timestamp: string;
  cycle_day: number;
  flow_intensity: 'light' | 'medium' | 'heavy';
  symptoms: string; // JSON string
  pcos_risk_score: number;
  ai_insights: string;
  language: string;
}

export interface VaccineRecord {
  id: number;
  child_name: string;
  birth_date: string;
  vaccine_name: string;
  due_date: string;
  given_date?: string;
  status: 'due' | 'given' | 'overdue';
  notes?: string;
}

export interface HealthHabitRecord {
  id: number;
  timestamp: string;
  habit_type: 'exercise' | 'diet' | 'sleep' | 'mental' | 'medication';
  description: string;
  completed: boolean;
  ai_suggestion: string;
  language: string;
}

export interface AISessionRecord {
  id: number;
  timestamp: string;
  session_type: 'symptom' | 'prescription' | 'mental_health' | 'general';
  user_input: string;
  ai_response: string;
  confidence: number;
  language: string;
  offline_mode: boolean;
}

export interface EmergencyContactRecord {
  id: number;
  name: string;
  phone: string;
  relationship: string;
  is_primary: boolean;
}

export interface ClinicRecord {
  id: number;
  name: string;
  type: 'hospital' | 'clinic' | 'pharmacy' | 'jan_aushadhi';
  address: string;
  phone?: string;
  hours: string;
  latitude: number;
  longitude: number;
  rating: number;
  specialties?: string; // JSON string
}

class DatabaseManager {
  private static instance: DatabaseManager;
  private db: Database | null = null;
  private SQL: SqlJsStatic | null = null;

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async initialize(): Promise<Database> {
    // Temporarily disable database to prevent SQL.js errors
    console.warn('Database temporarily disabled to prevent SQL.js errors');
    return {} as Database;
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    // Symptoms table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS symptoms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        symptoms TEXT NOT NULL,
        analysis TEXT NOT NULL,
        confidence INTEGER NOT NULL,
        severity TEXT CHECK(severity IN ('mild', 'moderate', 'severe', 'emergency')) NOT NULL,
        language TEXT DEFAULT 'en',
        user_notes TEXT
      );
    `);

    // Prescriptions table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        prescription_text TEXT NOT NULL,
        medicines TEXT NOT NULL,
        doctor_name TEXT,
        date TEXT,
        confidence INTEGER NOT NULL,
        language TEXT DEFAULT 'en',
        image_path TEXT
      );
    `);

    // Mental health table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS mental_health (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        mood_score INTEGER NOT NULL,
        anxiety_level INTEGER NOT NULL,
        depression_score INTEGER NOT NULL,
        session_notes TEXT NOT NULL,
        ai_response TEXT NOT NULL,
        language TEXT DEFAULT 'en'
      );
    `);

    // Sleep data table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS sleep_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        sleep_hours REAL NOT NULL,
        sleep_quality INTEGER NOT NULL,
        sleep_issues TEXT,
        ai_analysis TEXT NOT NULL,
        recommendations TEXT NOT NULL,
        language TEXT DEFAULT 'en'
      );
    `);

    // Period tracker table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS period_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        cycle_day INTEGER NOT NULL,
        flow_intensity TEXT CHECK(flow_intensity IN ('light', 'medium', 'heavy')) NOT NULL,
        symptoms TEXT NOT NULL,
        pcos_risk_score INTEGER NOT NULL,
        ai_insights TEXT NOT NULL,
        language TEXT DEFAULT 'en'
      );
    `);

    // Vaccine tracker table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS vaccine_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        child_name TEXT NOT NULL,
        birth_date TEXT NOT NULL,
        vaccine_name TEXT NOT NULL,
        due_date TEXT NOT NULL,
        given_date TEXT,
        status TEXT CHECK(status IN ('due', 'given', 'overdue')) NOT NULL,
        notes TEXT
      );
    `);

    // Health habits table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS health_habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        habit_type TEXT CHECK(habit_type IN ('exercise', 'diet', 'sleep', 'mental', 'medication')) NOT NULL,
        description TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        ai_suggestion TEXT NOT NULL,
        language TEXT DEFAULT 'en'
      );
    `);

    // AI sessions table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS ai_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        session_type TEXT CHECK(session_type IN ('symptom', 'prescription', 'mental_health', 'general')) NOT NULL,
        user_input TEXT NOT NULL,
        ai_response TEXT NOT NULL,
        confidence INTEGER NOT NULL,
        language TEXT DEFAULT 'en',
        offline_mode BOOLEAN DEFAULT FALSE
      );
    `);

    // Emergency contacts table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS emergency_contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        relationship TEXT NOT NULL,
        is_primary BOOLEAN DEFAULT FALSE
      );
    `);

    // Clinics table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS clinics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT CHECK(type IN ('hospital', 'clinic', 'pharmacy', 'jan_aushadhi')) NOT NULL,
        address TEXT NOT NULL,
        phone TEXT,
        hours TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        rating REAL DEFAULT 0,
        specialties TEXT
      );
    `);

    // Insert default emergency contacts
    this.db.run(`
      INSERT OR IGNORE INTO emergency_contacts (name, phone, relationship, is_primary) VALUES
      ('Ambulance', '108', 'Emergency Service', 1),
      ('Police', '100', 'Emergency Service', 0),
      ('Fire Department', '101', 'Emergency Service', 0),
      ('Women Helpline', '1091', 'Emergency Service', 0);
    `);

    console.log('✅ Database schema created successfully');
  }

  // Symptom Analysis Methods
  async addSymptomRecord(record: Omit<SymptomRecord, 'id'>): Promise<number> {
    try {
      await this.initialize();
      if (!this.db || typeof this.db.prepare !== 'function') {
        console.warn('Database not available, skipping record storage');
        return 0;
      }
      
      const stmt = this.db.prepare(`
        INSERT INTO symptoms (timestamp, symptoms, analysis, confidence, severity, language, user_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run([record.timestamp, record.symptoms, record.analysis, record.confidence, record.severity, record.language, record.user_notes]);
      stmt.free();
      return this.db.exec('SELECT last_insert_rowid()')[0].values[0][0] as number;
    } catch (error) {
      console.warn('Failed to add symptom record:', error);
      return 0;
    }
  }

  async getSymptomHistory(limit: number = 10): Promise<SymptomRecord[]> {
    try {
      await this.initialize();
      if (!this.db || typeof this.db.exec !== 'function') {
        console.warn('Database not available, returning empty symptom history');
        return [];
      }
      
      const result = this.db.exec(`
        SELECT * FROM symptoms 
        ORDER BY timestamp DESC 
        LIMIT ?
      `, [limit]);
      
      if (result.length === 0) return [];
      
      return result[0].values.map(row => ({
        id: row[0] as number,
        timestamp: row[1] as string,
        symptoms: row[2] as string,
        analysis: row[3] as string,
        confidence: row[4] as number,
        severity: row[5] as 'mild' | 'moderate' | 'severe' | 'emergency',
        language: row[6] as string,
        user_notes: row[7] as string
      }));
    } catch (error) {
      console.warn('Failed to get symptom history:', error);
      return [];
    }
  }

  // Prescription Methods
  async addPrescriptionRecord(record: Omit<PrescriptionRecord, 'id'>): Promise<number> {
    try {
      await this.initialize();
      if (!this.db || typeof this.db.prepare !== 'function') {
        console.warn('Database not available, skipping prescription record storage');
        return 0;
      }
      
      const stmt = this.db.prepare(`
        INSERT INTO prescriptions (timestamp, prescription_text, medicines, doctor_name, date, confidence, language, image_path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run([record.timestamp, record.prescription_text, record.medicines, record.doctor_name, record.date, record.confidence, record.language, record.image_path]);
      stmt.free();
      return this.db.exec('SELECT last_insert_rowid()')[0].values[0][0] as number;
    } catch (error) {
      console.warn('Failed to add prescription record:', error);
      return 0;
    }
  }

  async getPrescriptionHistory(limit: number = 10): Promise<PrescriptionRecord[]> {
    try {
      await this.initialize();
      if (!this.db || typeof this.db.exec !== 'function') {
        console.warn('Database not available, returning empty prescription history');
        return [];
      }
      
      const result = this.db.exec(`
        SELECT * FROM prescriptions 
        ORDER BY timestamp DESC 
        LIMIT ?
      `, [limit]);
      
      if (result.length === 0) return [];
      
      return result[0].values.map(row => ({
        id: row[0] as number,
        timestamp: row[1] as string,
        prescription_text: row[2] as string,
        medicines: row[3] as string,
        doctor_name: row[4] as string,
        date: row[5] as string,
        confidence: row[6] as number,
        language: row[7] as string,
        image_path: row[8] as string
      }));
    } catch (error) {
      console.warn('Failed to get prescription history:', error);
      return [];
    }
  }

  // Mental Health Methods
  async addMentalHealthRecord(record: Omit<MentalHealthRecord, 'id'>): Promise<number> {
    try {
      await this.initialize();
      if (!this.db) {
        console.warn('Database not available, skipping record storage');
        return 0;
      }
      
      const stmt = this.db.prepare(`
        INSERT INTO mental_health (timestamp, mood_score, anxiety_level, depression_score, session_notes, ai_response, language)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run([record.timestamp, record.mood_score, record.anxiety_level, record.depression_score, record.session_notes, record.ai_response, record.language]);
      stmt.free();
      return this.db.exec('SELECT last_insert_rowid()')[0].values[0][0] as number;
    } catch (error) {
      console.error('Failed to add mental health record:', error);
      // Return 0 to indicate no record was created
      return 0;
    }
  }

  async getMentalHealthHistory(limit: number = 10): Promise<MentalHealthRecord[]> {
    try {
      await this.initialize();
      if (!this.db || typeof this.db.exec !== 'function') {
        console.warn('Database not available, returning empty mental health history');
        return [];
      }
      
      const result = this.db.exec(`
        SELECT * FROM mental_health 
        ORDER BY timestamp DESC 
        LIMIT ?
      `, [limit]);
      
      if (result.length === 0) return [];
      
      return result[0].values.map(row => ({
        id: row[0] as number,
        timestamp: row[1] as string,
        mood_score: row[2] as number,
        anxiety_level: row[3] as number,
        depression_score: row[4] as number,
        session_notes: row[5] as string,
        ai_response: row[6] as string,
        language: row[7] as string
      }));
    } catch (error) {
      console.warn('Failed to get mental health history:', error);
      return [];
    }
  }

  // AI Sessions Methods
  async addAISession(record: Omit<AISessionRecord, 'id'>): Promise<number> {
    try {
      await this.initialize();
      if (!this.db || typeof this.db.prepare !== 'function') {
        console.warn('Database not available, skipping AI session storage');
        return 0;
      }
      
      const stmt = this.db.prepare(`
        INSERT INTO ai_sessions (timestamp, session_type, user_input, ai_response, confidence, language, offline_mode)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run([record.timestamp, record.session_type, record.user_input, record.ai_response, record.confidence, record.language, record.offline_mode]);
      stmt.free();
      return this.db.exec('SELECT last_insert_rowid()')[0].values[0][0] as number;
    } catch (error) {
      console.warn('Failed to add AI session:', error);
      return 0;
    }
  }

  async getAISessionHistory(limit: number = 20): Promise<AISessionRecord[]> {
    try {
      await this.initialize();
      if (!this.db || typeof this.db.exec !== 'function') {
        console.warn('Database not available, returning empty AI session history');
        return [];
      }
      
      const result = this.db.exec(`
        SELECT * FROM ai_sessions 
        ORDER BY timestamp DESC 
        LIMIT ?
      `, [limit]);
      
      if (result.length === 0) return [];
      
      return result[0].values.map(row => ({
        id: row[0] as number,
        timestamp: row[1] as string,
        session_type: row[2] as 'symptom' | 'prescription' | 'mental_health' | 'general',
        user_input: row[3] as string,
        ai_response: row[4] as string,
        confidence: row[5] as number,
        language: row[6] as string,
        offline_mode: Boolean(row[7])
      }));
    } catch (error) {
      console.warn('Failed to get AI session history:', error);
      return [];
    }
  }

  // Emergency Contacts Methods
  async getEmergencyContacts(): Promise<EmergencyContactRecord[]> {
    try {
      await this.initialize();
      if (!this.db || typeof this.db.exec !== 'function') {
        console.warn('Database not available, returning default emergency contacts');
        return [
          { id: 1, name: 'Ambulance', phone: '108', relationship: 'Emergency Service', is_primary: true },
          { id: 2, name: 'Police', phone: '100', relationship: 'Emergency Service', is_primary: false },
          { id: 3, name: 'Fire Department', phone: '101', relationship: 'Emergency Service', is_primary: false },
          { id: 4, name: 'Women Helpline', phone: '1091', relationship: 'Emergency Service', is_primary: false }
        ];
      }
      
      const result = this.db.exec(`
        SELECT * FROM emergency_contacts 
        ORDER BY is_primary DESC, name ASC
      `);
      
      if (result.length === 0) return [];
      
      return result[0].values.map(row => ({
        id: row[0] as number,
        name: row[1] as string,
        phone: row[2] as string,
        relationship: row[3] as string,
        is_primary: Boolean(row[4])
      }));
    } catch (error) {
      console.warn('Failed to get emergency contacts:', error);
      return [
        { id: 1, name: 'Ambulance', phone: '108', relationship: 'Emergency Service', is_primary: true },
        { id: 2, name: 'Police', phone: '100', relationship: 'Emergency Service', is_primary: false },
        { id: 3, name: 'Fire Department', phone: '101', relationship: 'Emergency Service', is_primary: false },
        { id: 4, name: 'Women Helpline', phone: '1091', relationship: 'Emergency Service', is_primary: false }
      ];
    }
  }

  async addEmergencyContact(contact: Omit<EmergencyContactRecord, 'id'>): Promise<number> {
    try {
      await this.initialize();
      if (!this.db || typeof this.db.prepare !== 'function') {
        console.warn('Database not available, skipping emergency contact storage');
        return 0;
      }
      
      const stmt = this.db.prepare(`
        INSERT INTO emergency_contacts (name, phone, relationship, is_primary)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run([contact.name, contact.phone, contact.relationship, contact.is_primary]);
      stmt.free();
      return this.db.exec('SELECT last_insert_rowid()')[0].values[0][0] as number;
    } catch (error) {
      console.warn('Failed to add emergency contact:', error);
      return 0;
    }
  }

  // Data Export/Import
  async exportData(): Promise<string> {
    await this.initialize();
    const data: DatabaseSchema = {
      symptoms: await this.getSymptomHistory(1000),
      prescriptions: await this.getPrescriptionHistory(1000),
      mental_health: await this.getMentalHealthHistory(1000),
      sleep_data: [],
      period_data: [],
      vaccine_data: [],
      health_habits: [],
      ai_sessions: await this.getAISessionHistory(1000),
      emergency_contacts: await this.getEmergencyContacts(),
      clinic_data: []
    };
    return JSON.stringify(data, null, 2);
  }

  async importData(data: string): Promise<void> {
    await this.initialize();
    const parsedData: DatabaseSchema = JSON.parse(data);
    
    // Clear existing data
    this.db!.run('DELETE FROM symptoms');
    this.db!.run('DELETE FROM prescriptions');
    this.db!.run('DELETE FROM mental_health');
    this.db!.run('DELETE FROM ai_sessions');
    this.db!.run('DELETE FROM emergency_contacts');
    
    // Import new data
    for (const symptom of parsedData.symptoms) {
      await this.addSymptomRecord(symptom);
    }
    
    for (const prescription of parsedData.prescriptions) {
      await this.addPrescriptionRecord(prescription);
    }
    
    for (const mentalHealth of parsedData.mental_health) {
      await this.addMentalHealthRecord(mentalHealth);
    }
    
    for (const session of parsedData.ai_sessions) {
      await this.addAISession(session);
    }
    
    for (const contact of parsedData.emergency_contacts) {
      await this.addEmergencyContact(contact);
    }
  }

  // Database maintenance
  async backup(): Promise<void> {
    const data = await this.exportData();
    localStorage.setItem('pixal_health_backup', data);
    console.log('✅ Database backup created');
  }

  async restore(): Promise<void> {
    const backup = localStorage.getItem('pixal_health_backup');
    if (backup) {
      await this.importData(backup);
      console.log('✅ Database restored from backup');
    }
  }

  async clearAllData(): Promise<void> {
    await this.initialize();
    this.db!.run('DELETE FROM symptoms');
    this.db!.run('DELETE FROM prescriptions');
    this.db!.run('DELETE FROM mental_health');
    this.db!.run('DELETE FROM sleep_data');
    this.db!.run('DELETE FROM period_data');
    this.db!.run('DELETE FROM vaccine_data');
    this.db!.run('DELETE FROM health_habits');
    this.db!.run('DELETE FROM ai_sessions');
    this.db!.run('DELETE FROM emergency_contacts WHERE is_primary = 0');
    this.db!.run('DELETE FROM clinics');
    console.log('✅ All data cleared');
  }
}

export const dbManager = DatabaseManager.getInstance();
export default dbManager; 