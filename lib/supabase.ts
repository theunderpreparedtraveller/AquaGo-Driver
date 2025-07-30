import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle_number: string;
  status: 'online' | 'offline' | 'busy';
  current_location?: {
    latitude: number;
    longitude: number;
  };
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  water_type: string;
  quantity: number;
  amount: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'delivered' | 'cancelled';
  driver_id?: string;
  created_at: string;
  updated_at: string;
} 