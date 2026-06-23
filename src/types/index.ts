export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  type: 'rental' | 'sale' | 'both';
  price_rental_daily: number;
  price_sale: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  seats: number;
  image_url: string | null;
  description: string | null;
  features: string[];
  available: boolean;
  created_at: string;
}

export interface Rental {
  id: string;
  car_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  car?: Car;
}

export interface Sale {
  id: string;
  car_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  offered_price: number;
  message: string | null;
  status: 'pending' | 'negotiating' | 'accepted' | 'rejected';
  created_at: string;
  car?: Car;
}

export interface Repair {
  id: string;
  car_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  car_brand: string | null;
  car_model: string | null;
  car_year: number | null;
  issue_description: string;
  urgency: 'low' | 'medium' | 'high';
  estimated_cost: number;
  status: 'pending' | 'diagnosed' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  car?: Car;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export type Page = 'home' | 'catalog' | 'car-detail' | 'rentals' | 'sales' | 'repairs' | 'ai-agents';
