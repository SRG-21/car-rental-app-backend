# Car Rental Backend API Documentation

**Base URL:** `http://localhost:3000` (Development) | `https://your-domain.com` (Production)

**API Version:** 1.0.0

---

## Table of Contents

1. [Authentication](#authentication)
2. [Health Check](#health-check)
3. [Auth Endpoints](#auth-endpoints)
4. [Cars Endpoints](#cars-endpoints)
5. [Search Endpoints](#search-endpoints)
6. [Bookings Endpoints](#bookings-endpoints)
7. [Notifications Endpoints](#notifications-endpoints)
8. [Error Responses](#error-responses)

---

## Authentication

Protected endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Tokens are obtained via the `/auth/login` or `/auth/signup` endpoints.

### Token Lifecycle

| Token Type | Expiry | Usage |
|------------|--------|-------|
| Access Token | 15 minutes | API requests |
| Refresh Token | 7 days | Obtain new access token |

---

## Health Check

### GET /health

Check the health status of all microservices.

**Authentication:** Not required

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2026-02-07T13:36:58.520Z",
  "services": {
    "auth": { "status": "ok", "responseTime": 42 },
    "car": { "status": "ok", "responseTime": 15 },
    "search": { "status": "ok", "responseTime": 9 },
    "booking": { "status": "ok", "responseTime": 40 },
    "notification": { "status": "ok", "responseTime": 28 }
  }
}
```

### GET /health/:service

Check the health status of a specific service.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| service | string | Service name: `auth`, `car`, `search`, `booking`, `notification` |

---

## Auth Endpoints

### POST /auth/signup

Create a new user account.

**Authentication:** Not required

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "John Doe"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email format |
| password | string | Yes | Min 8 chars, 1 uppercase, 1 number |
| name | string | No | 1-100 characters |

**Response (201 Created):**

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "55270101de9965ddb2a6ecb1219fb5d1c49dbd809f6b...",
    "user": {
      "id": "b724a34d-829a-4f0e-9dc3-f35273e16aff",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2026-02-07T13:38:11.273Z"
    }
  }
}
```

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 409 | VALIDATION_ERROR | Email already registered |

---

### POST /auth/login

Authenticate an existing user.

**Authentication:** Not required

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

| Field | Type | Required |
|-------|------|----------|
| email | string | Yes |
| password | string | Yes |

**Response (200 OK):**

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "89b62e14a7374e2bf18445e2880e7b1ede69d19bb0ffa...",
    "user": {
      "id": "b724a34d-829a-4f0e-9dc3-f35273e16aff",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2026-02-07T13:38:11.273Z"
    }
  }
}
```

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 401 | AUTH_ERROR | Invalid credentials |

---

### POST /auth/refresh

Refresh an expired access token.

**Authentication:** Not required

**Request Body:**

```json
{
  "refreshToken": "89b62e14a7374e2bf18445e2880e7b1ede69d19bb0ffa..."
}
```

**Response (200 OK):**

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "new-refresh-token..."
  }
}
```

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 401 | AUTH_ERROR | Invalid or expired refresh token |

---

### POST /auth/logout

Invalidate the current refresh token.

**Authentication:** Not required

**Request Body:**

```json
{
  "refreshToken": "89b62e14a7374e2bf18445e2880e7b1ede69d19bb0ffa..."
}
```

**Response (200 OK):**

```json
{
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

### GET /auth/me

Get the current authenticated user's profile.

**Authentication:** Required 🔒

**Response (200 OK):**

```json
{
  "data": {
    "id": "b724a34d-829a-4f0e-9dc3-f35273e16aff",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-02-07T13:38:11.273Z"
  }
}
```

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 401 | AUTH_ERROR | No token provided or invalid token |

---

## Cars Endpoints

### GET /cars/:id

Get details of a specific car.

**Authentication:** Not required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string (UUID) | Car ID |

**Response (200 OK):**

```json
{
  "data": {
    "id": "968d6670-1327-401a-9ef1-e8f51e99f304",
    "name": "Tesla Model 3",
    "brand": "Tesla",
    "model": "Model 3",
    "year": 2023,
    "fuelType": "ELECTRIC",
    "transmission": "AUTOMATIC",
    "seats": 5,
    "pricePerDay": 120,
    "images": ["https://example.com/image1.jpg"],
    "features": ["Autopilot", "Premium Audio", "Glass Roof"],
    "location": {
      "lat": 37.71348081,
      "lng": -122.46106055,
      "address": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "country": "USA",
      "zipCode": "94102"
    },
    "isActive": true
  }
}
```

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 404 | NOT_FOUND | Car not found |

---

### POST /cars

Create a new car listing (Admin only).

**Authentication:** Required 🔒

**Request Body:**

```json
{
  "name": "Tesla Model 3",
  "brand": "Tesla",
  "model": "Model 3",
  "year": 2023,
  "fuelType": "ELECTRIC",
  "transmission": "AUTOMATIC",
  "seats": 5,
  "pricePerDay": 120,
  "images": ["https://example.com/image1.jpg"],
  "features": ["Autopilot", "Premium Audio"],
  "location": {
    "lat": 37.7749,
    "lng": -122.4194,
    "address": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "country": "USA",
    "zipCode": "94102"
  }
}
```

**Response (201 Created):** Returns the created car object.

---

### PUT /cars/:id

Update a car listing (Admin only).

**Authentication:** Required 🔒

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string (UUID) | Car ID |

**Request Body:** Same as POST /cars (all fields optional)

**Response (200 OK):** Returns the updated car object.

---

### DELETE /cars/:id

Delete a car listing (Admin only).

**Authentication:** Required 🔒

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string (UUID) | Car ID |

**Response (204 No Content)**

---

## Search Endpoints

### GET /search

Search for available cars with geo-spatial filtering.

**Authentication:** Not required

**Rate Limit:** 60 requests per minute

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| latitude | number | Yes | - | Latitude (-90 to 90) |
| longitude | number | Yes | - | Longitude (-180 to 180) |
| radius | number | No | 10 | Search radius in kilometers |
| query | string | No | - | Text search (car name, brand, features) |
| fuelType | string | No | - | Filter: `PETROL`, `DIESEL`, `ELECTRIC`, `HYBRID` |
| transmission | string | No | - | Filter: `MANUAL`, `AUTOMATIC` |
| seats | number | No | - | Minimum seats |
| pickupTime | string (ISO 8601) | No | - | Check availability from this time |
| dropoffTime | string (ISO 8601) | No | - | Check availability until this time |
| page | number | No | 1 | Page number |
| limit | number | No | 20 | Results per page |

**Example Request:**

```
GET /search?latitude=37.77&longitude=-122.41&radius=10&fuelType=ELECTRIC&page=1&limit=10
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "cars": [
      {
        "id": "968d6670-1327-401a-9ef1-e8f51e99f304",
        "make": "Tesla",
        "model": "Model 3",
        "year": 2023,
        "fuelType": "ELECTRIC",
        "transmission": "AUTOMATIC",
        "seats": 5,
        "pricePerDay": 120,
        "imageUrl": "https://example.com/image1.jpg",
        "location": {
          "lat": 37.71348081,
          "lng": -122.46106055,
          "address": "",
          "city": "",
          "state": "",
          "country": "",
          "zipCode": ""
        },
        "isAvailable": true,
        "distance": 7.72
      }
    ],
    "total": 20,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

---

## Bookings Endpoints

### POST /bookings

Create a new booking.

**Authentication:** Required 🔒

**Rate Limit:** 10 requests per minute

**Request Body:**

```json
{
  "carId": "968d6670-1327-401a-9ef1-e8f51e99f304",
  "pickupTime": "2026-02-10T10:00:00.000Z",
  "dropoffTime": "2026-02-12T10:00:00.000Z"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| carId | string (UUID) | Yes | Valid UUID |
| pickupTime | string (ISO 8601) | Yes | Must be in the future |
| dropoffTime | string (ISO 8601) | Yes | Must be after pickupTime |

**Response (201 Created):**

```json
{
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "userId": "b724a34d-829a-4f0e-9dc3-f35273e16aff",
    "carId": "968d6670-1327-401a-9ef1-e8f51e99f304",
    "pickupTime": "2026-02-10T10:00:00.000Z",
    "dropoffTime": "2026-02-12T10:00:00.000Z",
    "totalPrice": 240,
    "status": "confirmed",
    "createdAt": "2026-02-07T14:00:00.000Z",
    "updatedAt": "2026-02-07T14:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 404 | NOT_FOUND | Car not found |
| 409 | CONFLICT | Car not available for selected dates |

---

### GET /bookings

Get all bookings for the authenticated user.

**Authentication:** Required 🔒

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by status: `confirmed`, `cancelled`, `completed` |
| page | number | No | Page number |
| limit | number | No | Results per page |

**Response (200 OK):**

```json
{
  "data": {
    "bookings": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "userId": "b724a34d-829a-4f0e-9dc3-f35273e16aff",
        "carId": "968d6670-1327-401a-9ef1-e8f51e99f304",
        "pickupTime": "2026-02-10T10:00:00.000Z",
        "dropoffTime": "2026-02-12T10:00:00.000Z",
        "totalPrice": 240,
        "status": "confirmed",
        "createdAt": "2026-02-07T14:00:00.000Z",
        "updatedAt": "2026-02-07T14:00:00.000Z",
        "car": {
          "id": "968d6670-1327-401a-9ef1-e8f51e99f304",
          "name": "Tesla Model 3",
          "images": ["https://example.com/image1.jpg"]
        }
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### GET /bookings/:id

Get details of a specific booking.

**Authentication:** Required 🔒

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string (UUID) | Booking ID |

**Response (200 OK):** Returns the booking object (same structure as POST response).

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 403 | AUTH_ERROR | Not authorized to view this booking |
| 404 | NOT_FOUND | Booking not found |

---

### PATCH /bookings/:id

Update a booking (e.g., cancel).

**Authentication:** Required 🔒

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string (UUID) | Booking ID |

**Request Body:**

```json
{
  "status": "cancelled"
}
```

| Field | Type | Allowed Values |
|-------|------|----------------|
| status | string | `cancelled` |

**Response (200 OK):** Returns the updated booking object.

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 400 | VALIDATION_ERROR | Cannot cancel completed booking |
| 403 | AUTH_ERROR | Not authorized to update this booking |
| 404 | NOT_FOUND | Booking not found |

---

## Notifications Endpoints

### POST /notifications/subscribe

Subscribe to push notifications.

**Authentication:** Required 🔒

**Request Body:**

```json
{
  "token": "fcm-device-token",
  "platform": "web"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | Yes | Push notification token (FCM/APNs) |
| platform | string | Yes | `web`, `ios`, `android` |

**Response (200 OK):**

```json
{
  "data": {
    "message": "Successfully subscribed to notifications"
  }
}
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": [],
    "timestamp": "2026-02-07T14:00:00.000Z",
    "path": "/api/endpoint",
    "requestId": "unique-request-id"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid request data |
| AUTH_ERROR | 401 | Authentication failed |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource conflict (e.g., duplicate email) |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

### Validation Error Details

When `code` is `VALIDATION_ERROR`, the `details` array contains field-specific errors:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      {
        "path": ["password"],
        "message": "Password must contain at least one uppercase letter"
      },
      {
        "path": ["email"],
        "message": "Invalid email format"
      }
    ]
  }
}
```

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/auth/me` | 60 requests/minute |
| `/search` | 60 requests/minute |
| `/bookings` (POST) | 10 requests/minute |
| Other endpoints | 100 requests/minute |

When rate limited, the API returns:

```json
{
  "statusCode": 429,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded, retry in 60 seconds"
}
```

---

## CORS

The API supports CORS from all origins with the following methods:
- GET, POST, PUT, DELETE, PATCH, OPTIONS

Allowed headers:
- Content-Type
- Authorization

---

## TypeScript Types

For frontend TypeScript projects, you can use these types:

```typescript
// Auth Types
interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Car Types
type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';
type TransmissionType = 'MANUAL' | 'AUTOMATIC';

interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface Car {
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
  distance?: number;
}

interface SearchResponse {
  cars: Car[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Booking Types
type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

interface Booking {
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
```
