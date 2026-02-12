# Car Rental Backend - Complete API Reference

**Base URL:** `http://localhost:3000`

**Content-Type:** `application/json`

---

## Quick Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | ❌ | Health check |
| POST | `/auth/signup` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login user |
| POST | `/auth/refresh` | ❌ | Refresh token |
| POST | `/auth/logout` | ❌ | Logout user |
| GET | `/auth/me` | ✅ | Get current user |
| GET | `/cars/:id` | ❌ | Get car details |
| POST | `/cars` | ✅ | Create car (Admin) |
| PUT | `/cars/:id` | ✅ | Update car (Admin) |
| DELETE | `/cars/:id` | ✅ | Delete car (Admin) |
| GET | `/search` | ❌ | Search cars |
| POST | `/bookings` | ✅ | Create booking |
| GET | `/bookings` | ✅ | Get user bookings |
| GET | `/bookings/:id` | ✅ | Get booking details |
| PATCH | `/bookings/:id` | ✅ | Cancel booking |
| POST | `/notifications/subscribe` | ✅ | Subscribe to notifications |

---

## Common Headers

### Request Headers

```
Content-Type: application/json
Authorization: Bearer <access_token>  // For protected endpoints
```

### Response Headers

```
Content-Type: application/json
X-Request-ID: <unique-request-id>
```

---

# 🔐 Authentication Endpoints

## POST /auth/signup

Register a new user account.

### Request

```http
POST /auth/signup HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

### Request Body Schema

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `email` | string | ✅ Yes | Valid email format | User's email address |
| `password` | string | ✅ Yes | Min 8 chars, 1 uppercase, 1 number | User's password |
| `name` | string | ❌ No | 1-100 characters | User's display name |

### Password Requirements (for UI validation)

- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 number (0-9)

### Success Response

**Status:** `201 Created`

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiNzI0YTM0ZC04MjlhLTRmMGUtOWRjMy1mMzUyNzNlMTZhZmYiLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwiaWF0IjoxNzA3MzEyMjkxLCJleHAiOjE3MDczMTMxOTF9.xxx",
    "refreshToken": "55270101de9965ddb2a6ecb1219fb5d1c49dbd809f6b1764f2712dc389237d78",
    "user": {
      "id": "b724a34d-829a-4f0e-9dc3-f35273e16aff",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "createdAt": "2026-02-07T13:38:11.273Z"
    }
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data.accessToken` | string | JWT access token (expires in 15 minutes) |
| `data.refreshToken` | string | Refresh token (expires in 7 days) |
| `data.user.id` | string (UUID) | Unique user identifier |
| `data.user.email` | string | User's email address |
| `data.user.name` | string \| null | User's display name |
| `data.user.createdAt` | string (ISO 8601) | Account creation timestamp |

### Error Responses

**400 Bad Request - Validation Error**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      {
        "code": "invalid_string",
        "message": "Invalid email format",
        "path": ["email"]
      },
      {
        "code": "too_small",
        "message": "Password must be at least 8 characters",
        "path": ["password"]
      },
      {
        "code": "invalid_string",
        "message": "Password must contain at least one uppercase letter",
        "path": ["password"]
      },
      {
        "code": "invalid_string",
        "message": "Password must contain at least one number",
        "path": ["password"]
      }
    ],
    "timestamp": "2026-02-07T13:38:11.273Z",
    "path": "/auth/signup",
    "requestId": "abc123"
  }
}
```

**409 Conflict - Email Already Exists**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email already registered",
    "timestamp": "2026-02-07T13:38:11.273Z",
    "path": "/auth/signup",
    "requestId": "abc123"
  }
}
```

### Frontend Usage Example

```typescript
// React/Next.js example
const signup = async (email: string, password: string, name?: string) => {
  const response = await fetch('/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  const { data } = await response.json();
  
  // Store tokens
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  
  return data.user;
};
```

---

## POST /auth/login

Authenticate an existing user.

### Request

```http
POST /auth/login HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

### Request Body Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✅ Yes | User's email address |
| `password` | string | ✅ Yes | User's password |

### Success Response

**Status:** `200 OK`

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "89b62e14a7374e2bf18445e2880e7b1ede69d19bb0ffa269af92ba94d38e3b30",
    "user": {
      "id": "b724a34d-829a-4f0e-9dc3-f35273e16aff",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "createdAt": "2026-02-07T13:38:11.273Z"
    }
  }
}
```

### Error Responses

**401 Unauthorized - Invalid Credentials**

```json
{
  "error": {
    "code": "AUTH_ERROR",
    "message": "Invalid credentials",
    "timestamp": "2026-02-07T13:38:11.273Z",
    "path": "/auth/login",
    "requestId": "abc123"
  }
}
```

### Frontend Usage Example

```typescript
const login = async (email: string, password: string) => {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    const error = await response.json();
    if (response.status === 401) {
      throw new Error('Invalid email or password');
    }
    throw new Error(error.error.message);
  }
  
  const { data } = await response.json();
  
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  
  return data.user;
};
```

---

## POST /auth/refresh

Refresh an expired access token using a valid refresh token.

### Request

```http
POST /auth/refresh HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "refreshToken": "89b62e14a7374e2bf18445e2880e7b1ede69d19bb0ffa269af92ba94d38e3b30"
}
```

### Request Body Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `refreshToken` | string | ✅ Yes | Valid refresh token |

### Success Response

**Status:** `200 OK`

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "new-refresh-token-here..."
  }
}
```

### Error Responses

**401 Unauthorized - Invalid/Expired Refresh Token**

```json
{
  "error": {
    "code": "AUTH_ERROR",
    "message": "Invalid or expired refresh token",
    "timestamp": "2026-02-07T13:38:11.273Z",
    "path": "/auth/refresh",
    "requestId": "abc123"
  }
}
```

### Frontend Usage Example (Auto-Refresh)

```typescript
const apiClient = {
  async request(url: string, options: RequestInit = {}) {
    let accessToken = localStorage.getItem('accessToken');
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (response.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      const refreshResponse = await fetch('/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      
      if (refreshResponse.ok) {
        const { data } = await refreshResponse.json();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        // Retry original request
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.accessToken}`
          }
        });
      } else {
        // Refresh failed, redirect to login
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    
    return response;
  }
};
```

---

## POST /auth/logout

Invalidate the current refresh token.

### Request

```http
POST /auth/logout HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "refreshToken": "89b62e14a7374e2bf18445e2880e7b1ede69d19bb0ffa269af92ba94d38e3b30"
}
```

### Success Response

**Status:** `204 No Content`

(Empty response body)

### Frontend Usage Example

```typescript
const logout = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  await fetch('/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
  window.location.href = '/login';
};
```

---

## GET /auth/me

Get the current authenticated user's profile.

### Request

```http
GET /auth/me HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response

**Status:** `200 OK`

```json
{
  "data": {
    "id": "b724a34d-829a-4f0e-9dc3-f35273e16aff",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "createdAt": "2026-02-07T13:38:11.273Z"
  }
}
```

### Error Responses

**401 Unauthorized**

```json
{
  "error": {
    "code": "AUTH_ERROR",
    "message": "No token provided",
    "timestamp": "2026-02-07T13:38:11.273Z",
    "path": "/auth/me",
    "requestId": "abc123"
  }
}
```

---

# 🚗 Car Endpoints

## GET /cars/:id

Get detailed information about a specific car.

### Request

```http
GET /cars/968d6670-1327-401a-9ef1-e8f51e99f304 HTTP/1.1
Host: localhost:3000
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | ✅ Yes | Car's unique identifier |

### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "968d6670-1327-401a-9ef1-e8f51e99f304",
    "name": "Tesla Model 3",
    "brand": "Tesla",
    "model": "Model 3",
    "year": 2023,
    "fuelType": "electric",
    "transmission": "automatic",
    "seats": 5,
    "pricePerDay": 120.00,
    "images": [
      "https://example.com/cars/tesla-model-3-front.jpg",
      "https://example.com/cars/tesla-model-3-side.jpg",
      "https://example.com/cars/tesla-model-3-interior.jpg"
    ],
    "features": [
      "Autopilot",
      "Premium Audio",
      "Glass Roof",
      "Heated Seats",
      "Navigation",
      "Bluetooth"
    ],
    "location": {
      "latitude": 37.71348081,
      "longitude": -122.46106055,
      "address": "123 Market Street",
      "city": "San Francisco",
      "state": "California",
      "country": "USA"
    },
    "isActive": true,
    "createdAt": "2026-01-15T10:30:00.000Z",
    "updatedAt": "2026-02-01T14:22:00.000Z"
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique car identifier |
| `name` | string | Display name of the car |
| `brand` | string | Car manufacturer (Tesla, BMW, etc.) |
| `model` | string | Car model name |
| `year` | number | Manufacturing year |
| `fuelType` | enum | `electric`, `petrol`, `diesel`, `hybrid` |
| `transmission` | enum | `automatic`, `manual` |
| `seats` | number | Number of seats (1-20) |
| `pricePerDay` | number | Daily rental price in USD |
| `images` | string[] | Array of image URLs |
| `features` | string[] | Array of feature names |
| `location.latitude` | number | GPS latitude (-90 to 90) |
| `location.longitude` | number | GPS longitude (-180 to 180) |
| `location.address` | string | Street address |
| `location.city` | string | City name |
| `location.state` | string | State/Province |
| `location.country` | string | Country name |
| `isActive` | boolean | Whether car is available for booking |
| `createdAt` | string (ISO 8601) | Creation timestamp |
| `updatedAt` | string (ISO 8601) | Last update timestamp |

### Error Responses

**404 Not Found**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Car not found",
    "timestamp": "2026-02-07T13:38:11.273Z",
    "path": "/cars/invalid-id",
    "requestId": "abc123"
  }
}
```

### Frontend Usage Example

```typescript
interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  fuelType: 'electric' | 'petrol' | 'diesel' | 'hybrid';
  transmission: 'automatic' | 'manual';
  seats: number;
  pricePerDay: number;
  images: string[];
  features: string[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    country: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const getCarById = async (id: string): Promise<Car> => {
  const response = await fetch(`/cars/${id}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Car not found');
    }
    throw new Error('Failed to fetch car');
  }
  
  const { data } = await response.json();
  return data;
};
```

---

## POST /cars

Create a new car listing. **Admin only.**

### Request

```http
POST /cars HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Tesla Model 3 Long Range",
  "brand": "Tesla",
  "model": "Model 3",
  "year": 2024,
  "fuelType": "electric",
  "transmission": "automatic",
  "seats": 5,
  "pricePerDay": 150,
  "images": [
    "https://example.com/cars/tesla-1.jpg",
    "https://example.com/cars/tesla-2.jpg"
  ],
  "features": [
    "Autopilot",
    "Premium Audio",
    "Glass Roof"
  ],
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "address": "123 Market Street",
    "city": "San Francisco",
    "state": "California",
    "country": "USA"
  }
}
```

### Request Body Schema

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `name` | string | ✅ Yes | 1-255 chars | Display name |
| `brand` | string | ✅ Yes | 1-100 chars | Manufacturer |
| `model` | string | ✅ Yes | 1-100 chars | Model name |
| `year` | number | ✅ Yes | 1900 - current+1 | Manufacturing year |
| `fuelType` | enum | ✅ Yes | See values below | Fuel type |
| `transmission` | enum | ✅ Yes | See values below | Transmission type |
| `seats` | number | ✅ Yes | 1-20 | Number of seats |
| `pricePerDay` | number | ✅ Yes | > 0 | Daily price in USD |
| `images` | string[] | ✅ Yes | Min 1 item | Image URLs |
| `features` | string[] | ❌ No | - | Feature list |
| `location` | object | ✅ Yes | - | Pickup location |

**Fuel Type Values:** `electric`, `petrol`, `diesel`, `hybrid`

**Transmission Values:** `automatic`, `manual`

### Success Response

**Status:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "new-car-uuid",
    "name": "Tesla Model 3 Long Range",
    // ... full car object
  }
}
```

---

## PUT /cars/:id

Update an existing car listing. **Admin only.**

### Request

```http
PUT /cars/968d6670-1327-401a-9ef1-e8f51e99f304 HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "pricePerDay": 130,
  "isActive": true
}
```

### Request Body Schema

All fields from POST /cars are optional. Only include fields you want to update.

| Field | Type | Description |
|-------|------|-------------|
| `isActive` | boolean | Enable/disable car for bookings |
| ... | ... | Any field from POST /cars |

### Success Response

**Status:** `200 OK`

Returns the updated car object.

---

## DELETE /cars/:id

Delete a car listing. **Admin only.**

### Request

```http
DELETE /cars/968d6670-1327-401a-9ef1-e8f51e99f304 HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response

**Status:** `204 No Content`

(Empty response body)

---

# 🔍 Search Endpoints

## GET /search

Search for available cars with geo-spatial filtering and optional availability check.

### Request

```http
GET /search?latitude=37.7749&longitude=-122.4194&radius=15&fuelType=electric&transmission=automatic&seats=4&page=1&limit=10 HTTP/1.1
Host: localhost:3000
```

### Query Parameters

| Parameter | Type | Required | Default | Constraints | Description |
|-----------|------|----------|---------|-------------|-------------|
| `latitude` | number | ✅ Yes | - | -90 to 90 | Search center latitude |
| `longitude` | number | ✅ Yes | - | -180 to 180 | Search center longitude |
| `radius` | number | ❌ No | 10 | > 0 | Search radius in km |
| `query` | string | ❌ No | - | - | Text search (name, brand, features) |
| `fuelType` | enum | ❌ No | - | See values | Filter by fuel type |
| `transmission` | enum | ❌ No | - | See values | Filter by transmission |
| `seats` | number | ❌ No | - | > 0 | Minimum seats |
| `pickupTime` | string | ❌ No | - | ISO 8601 | Check availability from |
| `dropoffTime` | string | ❌ No | - | ISO 8601 | Check availability until |
| `page` | number | ❌ No | 1 | > 0 | Page number |
| `limit` | number | ❌ No | 20 | > 0 | Results per page |

**Fuel Type Values:** `PETROL`, `DIESEL`, `ELECTRIC`, `HYBRID`

**Transmission Values:** `MANUAL`, `AUTOMATIC`

### Example Requests

**Basic Search (nearby cars):**
```
GET /search?latitude=37.7749&longitude=-122.4194
```

**Search with Filters:**
```
GET /search?latitude=37.7749&longitude=-122.4194&radius=20&fuelType=ELECTRIC&seats=5
```

**Search with Text Query:**
```
GET /search?latitude=37.7749&longitude=-122.4194&query=tesla
```

**Search with Availability Check:**
```
GET /search?latitude=37.7749&longitude=-122.4194&pickupTime=2026-02-10T10:00:00Z&dropoffTime=2026-02-12T10:00:00Z
```

### Success Response

**Status:** `200 OK`

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
        "fuelType": "electric",
        "transmission": "automatic",
        "seats": 5,
        "pricePerDay": 120,
        "imageUrl": "https://example.com/cars/tesla-model-3.jpg",
        "location": {
          "lat": 37.71348081,
          "lng": -122.46106055,
          "address": "123 Market Street",
          "city": "San Francisco",
          "state": "California",
          "country": "USA",
          "zipCode": "94102"
        },
        "isAvailable": true,
        "distance": 3.54
      },
      {
        "id": "ce7c0bde-22b9-4d53-af50-3202de11077e",
        "make": "Tesla",
        "model": "Model Y",
        "year": 2023,
        "fuelType": "electric",
        "transmission": "automatic",
        "seats": 7,
        "pricePerDay": 140,
        "imageUrl": "https://example.com/cars/tesla-model-y.jpg",
        "location": {
          "lat": 37.72638454,
          "lng": -122.44873467,
          "address": "456 Mission Street",
          "city": "San Francisco",
          "state": "California",
          "country": "USA",
          "zipCode": "94105"
        },
        "isAvailable": true,
        "distance": 5.92
      }
    ],
    "total": 20,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data.cars` | array | Array of matching cars |
| `data.cars[].id` | string | Car UUID |
| `data.cars[].make` | string | Car manufacturer |
| `data.cars[].model` | string | Car model |
| `data.cars[].year` | number | Manufacturing year |
| `data.cars[].fuelType` | string | Fuel type |
| `data.cars[].transmission` | string | Transmission type |
| `data.cars[].seats` | number | Number of seats |
| `data.cars[].pricePerDay` | number | Daily price in USD |
| `data.cars[].imageUrl` | string | Primary image URL |
| `data.cars[].location.lat` | number | Latitude |
| `data.cars[].location.lng` | number | Longitude |
| `data.cars[].location.address` | string | Street address |
| `data.cars[].location.city` | string | City |
| `data.cars[].location.state` | string | State |
| `data.cars[].location.country` | string | Country |
| `data.cars[].location.zipCode` | string | Zip code |
| `data.cars[].isAvailable` | boolean | Availability status |
| `data.cars[].distance` | number | Distance from search point in km |
| `data.total` | number | Total matching cars |
| `data.page` | number | Current page |
| `data.limit` | number | Results per page |
| `data.totalPages` | number | Total pages |

### Error Responses

**400 Bad Request - Missing Required Parameters**

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "[{\"code\":\"invalid_type\",\"expected\":\"number\",\"received\":\"nan\",\"path\":[\"latitude\"],\"message\":\"Expected number, received nan\"}]"
}
```

### Frontend Usage Example

```typescript
interface SearchParams {
  latitude: number;
  longitude: number;
  radius?: number;
  query?: string;
  fuelType?: 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';
  transmission?: 'MANUAL' | 'AUTOMATIC';
  seats?: number;
  pickupTime?: string;
  dropoffTime?: string;
  page?: number;
  limit?: number;
}

interface CarSearchResult {
  id: string;
  make: string;
  model: string;
  year: number;
  fuelType: string;
  transmission: string;
  seats: number;
  pricePerDay: number;
  imageUrl: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  isAvailable: boolean;
  distance: number;
}

interface SearchResponse {
  cars: CarSearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const searchCars = async (params: SearchParams): Promise<SearchResponse> => {
  const queryString = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryString.append(key, String(value));
    }
  });
  
  const response = await fetch(`/search?${queryString}`);
  
  if (!response.ok) {
    throw new Error('Search failed');
  }
  
  const { data } = await response.json();
  return data;
};

// Usage in React component
const NearbyCarsList = () => {
  const [cars, setCars] = useState<CarSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const results = await searchCars({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        radius: 10
      });
      setCars(results.cars);
      setLoading(false);
    });
  }, []);
  
  // ... render
};
```

---

# 📅 Booking Endpoints

## POST /bookings

Create a new booking for a car.

### Request

```http
POST /bookings HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "carId": "968d6670-1327-401a-9ef1-e8f51e99f304",
  "pickupTime": "2026-02-10T10:00:00.000Z",
  "dropoffTime": "2026-02-12T18:00:00.000Z"
}
```

### Request Body Schema

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `carId` | string (UUID) | ✅ Yes | Valid UUID | Car to book |
| `pickupTime` | string (ISO 8601) | ✅ Yes | Must be in future | Pickup date/time |
| `dropoffTime` | string (ISO 8601) | ✅ Yes | Must be after pickup | Drop-off date/time |

### Validation Rules (for UI)

1. **pickupTime** must be in the future
2. **dropoffTime** must be after **pickupTime**
3. Car must be available for the selected time range
4. User must be authenticated

### Success Response

**Status:** `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "userId": "b724a34d-829a-4f0e-9dc3-f35273e16aff",
    "carId": "968d6670-1327-401a-9ef1-e8f51e99f304",
    "pickupTime": "2026-02-10T10:00:00.000Z",
    "dropoffTime": "2026-02-12T18:00:00.000Z",
    "totalPrice": 320.00,
    "status": "confirmed",
    "createdAt": "2026-02-07T14:00:00.000Z",
    "updatedAt": "2026-02-07T14:00:00.000Z"
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Booking ID |
| `userId` | string (UUID) | User who made booking |
| `carId` | string (UUID) | Booked car ID |
| `pickupTime` | string (ISO 8601) | Pickup date/time |
| `dropoffTime` | string (ISO 8601) | Drop-off date/time |
| `totalPrice` | number | Total price (calculated) |
| `status` | enum | `confirmed`, `cancelled`, `completed` |
| `createdAt` | string (ISO 8601) | Booking creation time |
| `updatedAt` | string (ISO 8601) | Last update time |

### Price Calculation

```
totalPrice = pricePerDay × numberOfDays

numberOfDays = ceil((dropoffTime - pickupTime) / 24hours)
```

### Error Responses

**400 Bad Request - Validation Error**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      {
        "message": "Pickup time must be in the future",
        "path": ["pickupTime"]
      }
    ]
  }
}
```

**400 Bad Request - Invalid Time Range**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dropoff time must be after pickup time"
  }
}
```

**404 Not Found - Car Not Found**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Car not found"
  }
}
```

**409 Conflict - Car Not Available**

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Car is not available for the selected dates"
  }
}
```

### Frontend Usage Example

```typescript
interface CreateBookingRequest {
  carId: string;
  pickupTime: string;
  dropoffTime: string;
}

interface Booking {
  id: string;
  userId: string;
  carId: string;
  pickupTime: string;
  dropoffTime: string;
  totalPrice: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

const createBooking = async (data: CreateBookingRequest): Promise<Booking> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    if (response.status === 409) {
      throw new Error('Car is not available for these dates. Please select different dates.');
    }
    throw new Error(error.error.message);
  }
  
  const { data: booking } = await response.json();
  return booking;
};

// React booking form
const BookingForm = ({ car }: { car: Car }) => {
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [dropoffDate, setDropoffDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const calculateTotal = () => {
    if (!pickupDate || !dropoffDate) return 0;
    const days = Math.ceil((dropoffDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));
    return days * car.pricePerDay;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const booking = await createBooking({
        carId: car.id,
        pickupTime: pickupDate!.toISOString(),
        dropoffTime: dropoffDate!.toISOString()
      });
      
      // Navigate to confirmation page
      router.push(`/bookings/${booking.id}/confirmation`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <DatePicker
        label="Pickup Date"
        value={pickupDate}
        onChange={setPickupDate}
        minDate={new Date()} // Must be future
      />
      <DatePicker
        label="Dropoff Date"
        value={dropoffDate}
        onChange={setDropoffDate}
        minDate={pickupDate || new Date()} // Must be after pickup
      />
      <div>Total: ${calculateTotal()}</div>
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Booking...' : 'Confirm Booking'}
      </button>
    </form>
  );
};
```

---

## GET /bookings

Get all bookings for the authenticated user.

### Request

```http
GET /bookings HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "userId": "b724a34d-829a-4f0e-9dc3-f35273e16aff",
      "carId": "968d6670-1327-401a-9ef1-e8f51e99f304",
      "pickupTime": "2026-02-10T10:00:00.000Z",
      "dropoffTime": "2026-02-12T18:00:00.000Z",
      "totalPrice": 320.00,
      "status": "confirmed",
      "createdAt": "2026-02-07T14:00:00.000Z",
      "updatedAt": "2026-02-07T14:00:00.000Z",
      "car": {
        "id": "968d6670-1327-401a-9ef1-e8f51e99f304",
        "name": "Tesla Model 3",
        "images": ["https://example.com/tesla.jpg"]
      }
    },
    {
      "id": "b2c3d4e5-f6g7-8901-bcde-fg2345678901",
      "userId": "b724a34d-829a-4f0e-9dc3-f35273e16aff",
      "carId": "ce7c0bde-22b9-4d53-af50-3202de11077e",
      "pickupTime": "2026-01-15T09:00:00.000Z",
      "dropoffTime": "2026-01-17T17:00:00.000Z",
      "totalPrice": 280.00,
      "status": "completed",
      "createdAt": "2026-01-10T11:30:00.000Z",
      "updatedAt": "2026-01-17T17:30:00.000Z",
      "car": {
        "id": "ce7c0bde-22b9-4d53-af50-3202de11077e",
        "name": "Tesla Model Y",
        "images": ["https://example.com/modely.jpg"]
      }
    }
  ]
}
```

### Frontend Usage Example

```typescript
interface BookingWithCar extends Booking {
  car: {
    id: string;
    name: string;
    images: string[];
  };
}

const getUserBookings = async (): Promise<BookingWithCar[]> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('/bookings', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch bookings');
  }
  
  const { data } = await response.json();
  return data;
};

// Categorize bookings for UI
const categorizeBookings = (bookings: BookingWithCar[]) => {
  const now = new Date();
  
  return {
    upcoming: bookings.filter(b => 
      b.status === 'confirmed' && new Date(b.pickupTime) > now
    ),
    active: bookings.filter(b => 
      b.status === 'confirmed' && 
      new Date(b.pickupTime) <= now && 
      new Date(b.dropoffTime) >= now
    ),
    past: bookings.filter(b => 
      b.status === 'completed' || new Date(b.dropoffTime) < now
    ),
    cancelled: bookings.filter(b => b.status === 'cancelled')
  };
};
```

---

## GET /bookings/:id

Get details of a specific booking.

### Request

```http
GET /bookings/a1b2c3d4-e5f6-7890-abcd-ef1234567890 HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | ✅ Yes | Booking ID |

### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "userId": "b724a34d-829a-4f0e-9dc3-f35273e16aff",
    "carId": "968d6670-1327-401a-9ef1-e8f51e99f304",
    "pickupTime": "2026-02-10T10:00:00.000Z",
    "dropoffTime": "2026-02-12T18:00:00.000Z",
    "totalPrice": 320.00,
    "status": "confirmed",
    "createdAt": "2026-02-07T14:00:00.000Z",
    "updatedAt": "2026-02-07T14:00:00.000Z"
  }
}
```

### Error Responses

**403 Forbidden - Not Owner**

```json
{
  "error": {
    "code": "AUTH_ERROR",
    "message": "You are not authorized to view this booking"
  }
}
```

**404 Not Found**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Booking not found"
  }
}
```

---

## PATCH /bookings/:id

Cancel a booking.

### Request

```http
PATCH /bookings/a1b2c3d4-e5f6-7890-abcd-ef1234567890 HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "cancelled"
}
```

### Request Body Schema

| Field | Type | Required | Allowed Values | Description |
|-------|------|----------|----------------|-------------|
| `status` | string | ✅ Yes | `cancelled` | New status |

### Cancellation Rules (for UI)

1. Only bookings with status `confirmed` can be cancelled
2. Cannot cancel bookings that have already started
3. Cannot cancel `completed` bookings
4. User must own the booking

### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "cancelled",
    // ... other booking fields
  }
}
```

### Error Responses

**400 Bad Request - Cannot Cancel**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Cannot cancel a booking that has already started"
  }
}
```

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Cannot cancel a completed booking"
  }
}
```

### Frontend Usage Example

```typescript
const cancelBooking = async (bookingId: string): Promise<Booking> => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`/bookings/${bookingId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status: 'cancelled' })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  const { data } = await response.json();
  return data;
};

// Confirmation dialog
const CancelBookingButton = ({ booking }: { booking: Booking }) => {
  const [loading, setLoading] = useState(false);
  
  const canCancel = () => {
    if (booking.status !== 'confirmed') return false;
    if (new Date(booking.pickupTime) <= new Date()) return false;
    return true;
  };
  
  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    setLoading(true);
    try {
      await cancelBooking(booking.id);
      // Refresh page or update state
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (!canCancel()) return null;
  
  return (
    <button onClick={handleCancel} disabled={loading}>
      {loading ? 'Cancelling...' : 'Cancel Booking'}
    </button>
  );
};
```

---

# 🔔 Notification Endpoints

## POST /notifications/subscribe

Subscribe to push notifications.

### Request

```http
POST /notifications/subscribe HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "token": "fcm-device-token-from-firebase",
  "platform": "web"
}
```

### Request Body Schema

| Field | Type | Required | Allowed Values | Description |
|-------|------|----------|----------------|-------------|
| `token` | string | ✅ Yes | - | Push notification token |
| `platform` | string | ✅ Yes | `web`, `ios`, `android` | Client platform |

### Success Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Successfully subscribed to notifications"
  }
}
```

---

# 🏥 Health Endpoints

## GET /health

Check health status of all microservices.

### Request

```http
GET /health HTTP/1.1
Host: localhost:3000
```

### Success Response

**Status:** `200 OK` (all healthy) or `503 Service Unavailable` (degraded)

```json
{
  "status": "healthy",
  "timestamp": "2026-02-07T13:36:58.520Z",
  "services": {
    "auth": {
      "status": "ok",
      "responseTime": 42
    },
    "car": {
      "status": "ok",
      "responseTime": 15
    },
    "search": {
      "status": "ok",
      "responseTime": 9
    },
    "booking": {
      "status": "ok",
      "responseTime": 40
    },
    "notification": {
      "status": "ok",
      "responseTime": 28
    }
  }
}
```

### Status Values

| Status | Description |
|--------|-------------|
| `healthy` | All services operational |
| `degraded` | Some services have issues |
| `unhealthy` | Critical services down |

---

# 📦 Complete TypeScript Types

Copy these types into your frontend project:

```typescript
// ============================================
// Auth Types
// ============================================

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ============================================
// Car Types
// ============================================

export type FuelType = 'electric' | 'petrol' | 'diesel' | 'hybrid';
export type TransmissionType = 'automatic' | 'manual';

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
}

export interface Car {
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

// ============================================
// Search Types
// ============================================

export interface SearchParams {
  latitude: number;
  longitude: number;
  radius?: number;
  query?: string;
  fuelType?: 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';
  transmission?: 'MANUAL' | 'AUTOMATIC';
  seats?: number;
  pickupTime?: string;
  dropoffTime?: string;
  page?: number;
  limit?: number;
}

export interface CarSearchResult {
  id: string;
  make: string;
  model: string;
  year: number;
  fuelType: string;
  transmission: string;
  seats: number;
  pricePerDay: number;
  imageUrl: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  isAvailable: boolean;
  distance: number;
}

export interface SearchResponse {
  cars: CarSearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// Booking Types
// ============================================

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

export interface CreateBookingRequest {
  carId: string;
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

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success?: boolean;
  data: T;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{
      path: string[];
      message: string;
      code?: string;
    }>;
    timestamp: string;
    path: string;
    requestId: string;
  };
}

// ============================================
// Health Types
// ============================================

export interface ServiceHealth {
  status: 'ok' | 'error' | 'timeout';
  responseTime: number;
  error?: string;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    auth: ServiceHealth;
    car: ServiceHealth;
    search: ServiceHealth;
    booking: ServiceHealth;
    notification: ServiceHealth;
  };
}
```

---

# 🔧 API Client Example

Complete API client for React/Next.js:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    // Handle token refresh
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refresh();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers
        });
      }
    }

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.error);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json();
    return data.data || data;
  }

  // Auth methods
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const result = await this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    this.setTokens(result.accessToken, result.refreshToken);
    return result;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const result = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    this.setTokens(result.accessToken, result.refreshToken);
    return result;
  }

  async refresh(): Promise<boolean> {
    try {
      const result = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      if (result.ok) {
        const { data } = await result.json();
        this.setTokens(data.accessToken, data.refreshToken);
        return true;
      }
    } catch {}
    
    this.clearTokens();
    return false;
  }

  async logout(): Promise<void> {
    if (this.refreshToken) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });
    }
    this.clearTokens();
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Car methods
  async getCarById(id: string): Promise<Car> {
    return this.request<Car>(`/cars/${id}`);
  }

  // Search methods
  async searchCars(params: SearchParams): Promise<SearchResponse> {
    const queryString = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryString.append(key, String(value));
    });
    return this.request<SearchResponse>(`/search?${queryString}`);
  }

  // Booking methods
  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    return this.request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getBookings(): Promise<BookingWithCar[]> {
    return this.request<BookingWithCar[]>('/bookings');
  }

  async getBookingById(id: string): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}`);
  }

  async cancelBooking(id: string): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'cancelled' })
    });
  }

  // Health
  async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  // Token management
  private setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}

class ApiError extends Error {
  code: string;
  details?: any[];

  constructor(error: ApiError['error']) {
    super(error.message);
    this.code = error.code;
    this.details = error.details;
  }
}

export const api = new ApiClient();
```
