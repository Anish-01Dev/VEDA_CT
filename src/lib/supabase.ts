import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      health_records: {
        Row: {
          id: string;
          patient_id: string;
          patient_name: string;
          age: number;
          gender: 'male' | 'female' | 'other';
          blood_group: string | null;
          address: {
            street: string;
            city: string;
            state: string;
            postal_code: string;
            country: string;
          } | null;
          allergies: string[];
          medications: string[];
          medical_history: string[];
          emergency_contact: {
            name: string;
            phone: string;
            relation: string;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          patient_name: string;
          age: number;
          gender: 'male' | 'female' | 'other';
          blood_group?: string | null;
          address?: {
            street: string;
            city: string;
            state: string;
            postal_code: string;
            country: string;
          } | null;
          allergies?: string[];
          medications?: string[];
          medical_history?: string[];
          emergency_contact: {
            name: string;
            phone: string;
            relation: string;
          };
        };
        Update: {
          patient_name?: string;
          age?: number;
          gender?: 'male' | 'female' | 'other';
          blood_group?: string | null;
          address?: {
            street: string;
            city: string;
            state: string;
            postal_code: string;
            country: string;
          } | null;
          allergies?: string[];
          medications?: string[];
          medical_history?: string[];
          emergency_contact?: {
            name: string;
            phone: string;
            relation: string;
          };
        };
      };
      visits: {
        Row: {
          id: string;
          patient_id: string;
          visit_date: string;
          symptoms: string[];
          diagnosis: string;
          prescription: string[];
          doctor_notes: string | null;
          vitals: {
            temperature?: number;
            blood_pressure?: string;
            heart_rate?: number;
            weight?: number;
          } | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          visit_date: string;
          symptoms: string[];
          diagnosis: string;
          prescription?: string[];
          doctor_notes?: string | null;
          vitals?: {
            temperature?: number;
            blood_pressure?: string;
            heart_rate?: number;
            weight?: number;
          } | null;
        };
        Update: {
          symptoms?: string[];
          diagnosis?: string;
          prescription?: string[];
          doctor_notes?: string | null;
          vitals?: {
            temperature?: number;
            blood_pressure?: string;
            heart_rate?: number;
            weight?: number;
          } | null;
        };
      };
      pharmacies: {
        Row: {
          id: string;
          name: string;
          address: string;
          phone: string;
          latitude: number;
          longitude: number;
          is_open: boolean;
          opening_hours: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          phone: string;
          latitude: number;
          longitude: number;
          is_open?: boolean;
          opening_hours: string;
        };
        Update: {
          name?: string;
          address?: string;
          phone?: string;
          latitude?: number;
          longitude?: number;
          is_open?: boolean;
          opening_hours?: string;
        };
      };
      medicines: {
        Row: {
          id: string;
          name: string;
          generic_name: string;
          category: string;
          manufacturer: string;
          strength: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          generic_name: string;
          category: string;
          manufacturer: string;
          strength: string;
        };
        Update: {
          name?: string;
          generic_name?: string;
          category?: string;
          manufacturer?: string;
          strength?: string;
        };
      };
      medicine_stock: {
        Row: {
          id: string;
          pharmacy_id: string;
          medicine_id: string;
          quantity: number;
          price: number;
          expiry_date: string;
          is_available: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pharmacy_id: string;
          medicine_id: string;
          quantity: number;
          price: number;
          expiry_date: string;
          is_available?: boolean;
        };
        Update: {
          quantity?: number;
          price?: number;
          expiry_date?: string;
          is_available?: boolean;
        };
      };
    };
  };
};