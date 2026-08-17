export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'customer' | 'admin' | 'superadmin';
  created_at?: string;
  updated_at?: string;
}

export interface Address {
  id?: string;
  user_id?: string;
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  is_default?: boolean;
}
