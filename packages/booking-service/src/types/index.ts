export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

export interface CreateBookingRequest {
  carId: string;
  pickupTime: string;
  dropoffTime: string;
}

export interface CheckAvailabilityRequest {
  carIds: string[];
  pickupTime: string;
  dropoffTime: string;
}

export interface Booking {
  id: string;
  userId: string;
  carId: string;
  pickupTime: string;
  dropoffTime: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BookingWithCar extends Booking {
  car: {
    id: string;
    name: string;
    images: string[];
  };
}
