export type FuelType = 'electric' | 'petrol' | 'diesel' | 'hybrid';
export type TransmissionType = 'manual' | 'automatic';

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
}

export interface CreateCarRequest {
  name: string;
  brand: string;
  model: string;
  year: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  seats: number;
  pricePerDay: number;
  images: string[];
  features: string[];
  location: Location;
}

export interface UpdateCarRequest {
  name?: string;
  brand?: string;
  model?: string;
  year?: number;
  fuelType?: FuelType;
  transmission?: TransmissionType;
  seats?: number;
  pricePerDay?: number;
  images?: string[];
  features?: string[];
  location?: Location;
  isActive?: boolean;
}

export interface CarResponse {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  seats: number;
  pricePerDay: number;
  images: string[];
  features: string[];
  location: Location;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
