export enum FuelType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
}

export enum TransmissionType {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
}

export interface SearchCarsRequest {
  latitude: number;
  longitude: number;
  radius?: number;
  pickupTime?: Date;
  dropoffTime?: Date;
  fuelType?: FuelType;
  transmission?: TransmissionType;
  seats?: number;
  query?: string;
  page?: number;
  limit?: number;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface CarResponse {
  id: string;
  make: string;
  model: string;
  year: number;
  pricePerDay: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  seats: number;
  location: Location;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface CarSearchResult extends CarResponse {
  distance?: number;
}

export interface SearchCarsResponse {
  cars: CarSearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
