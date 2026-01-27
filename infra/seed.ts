import { PrismaClient } from '@prisma/client';
import { Client } from '@opensearch-project/opensearch';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const esClient = new Client({ 
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
});

const SAN_FRANCISCO = { lat: 37.7749, lng: -122.4194 };

// Helper to generate random location near SF
function randomLocation(center: { lat: number; lng: number }, radiusKm: number) {
  const radiusInDegrees = radiusKm / 111;
  const u = Math.random();
  const v = Math.random();
  const w = radiusInDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);
  return {
    lat: center.lat + x,
    lng: center.lng + y
  };
}

// Street addresses in San Francisco
const SF_ADDRESSES = [
  { address: '1 Market Street', city: 'San Francisco', state: 'California', country: 'USA' },
  { address: '555 Mission Street', city: 'San Francisco', state: 'California', country: 'USA' },
  { address: '101 California Street', city: 'San Francisco', state: 'California', country: 'USA' },
  { address: '350 Bush Street', city: 'San Francisco', state: 'California', country: 'USA' },
  { address: '425 Market Street', city: 'San Francisco', state: 'California', country: 'USA' },
  { address: '50 Fremont Street', city: 'San Francisco', state: 'California', country: 'USA' },
  { address: '345 Spear Street', city: 'San Francisco', state: 'California', country: 'USA' },
  { address: '201 3rd Street', city: 'San Francisco', state: 'California', country: 'USA' },
  { address: '600 California Street', city: 'San Francisco', state: 'California', country: 'USA' },
  { address: '555 California Street', city: 'San Francisco', state: 'California', country: 'USA' },
  { address: '123 Mission Street', city: 'San Francisco', state: 'California', country: 'USA' },
  { address: '77 Beale Street', city: 'San Francisco', state: 'California', country: 'USA' },
  { address: '180 Sansome Street', city: 'San Francisco', state: 'California', country: 'USA' },
  { address: '650 California Street', city: 'San Francisco', state: 'California', country: 'USA' },
  { address: '44 Montgomery Street', city: 'San Francisco', state: 'California', country: 'USA' },
  { address: '100 First Street', city: 'San Francisco', state: 'California', country: 'USA' },
  { address: '525 Market Street', city: 'San Francisco', state: 'California', country: 'USA' },
  { address: '150 Spear Street', city: 'San Francisco', state: 'California', country: 'USA' },
  { address: '235 Pine Street', city: 'San Francisco', state: 'California', country: 'USA' },
  { address: '400 Howard Street', city: 'San Francisco', state: 'California', country: 'USA' },
];

const CARS_DATA = [
  {
    name: 'Tesla Model 3',
    brand: 'Tesla',
    model: 'Model 3',
    fuelType: 'electric',
    transmission: 'automatic',
    seats: 5,
    year: 2023,
    pricePerDay: 120,
    features: ['Autopilot', 'Premium Audio', 'Glass Roof', 'Heated Seats']
  },
  {
    name: 'Toyota Camry Hybrid',
    brand: 'Toyota',
    model: 'Camry',
    fuelType: 'hybrid',
    transmission: 'automatic',
    seats: 5,
    year: 2022,
    pricePerDay: 75,
    features: ['Backup Camera', 'Bluetooth', 'Lane Assist']
  },
  {
    name: 'Ford Mustang GT',
    brand: 'Ford',
    model: 'Mustang',
    fuelType: 'petrol',
    transmission: 'manual',
    seats: 4,
    year: 2021,
    pricePerDay: 150,
    features: ['Sport Mode', 'Premium Sound', 'Navigation']
  },
  {
    name: 'Honda Civic',
    brand: 'Honda',
    model: 'Civic',
    fuelType: 'petrol',
    transmission: 'automatic',
    seats: 5,
    year: 2023,
    pricePerDay: 65,
    features: ['Bluetooth', 'Backup Camera', 'Cruise Control']
  },
  {
    name: 'BMW 3 Series',
    brand: 'BMW',
    model: '3 Series',
    fuelType: 'diesel',
    transmission: 'automatic',
    seats: 5,
    year: 2022,
    pricePerDay: 130,
    features: ['Leather Seats', 'Sunroof', 'Premium Audio', 'Navigation']
  },
  {
    name: 'Chevrolet Suburban',
    brand: 'Chevrolet',
    model: 'Suburban',
    fuelType: 'petrol',
    transmission: 'automatic',
    seats: 7,
    year: 2023,
    pricePerDay: 110,
    features: ['Third Row Seating', '4WD', 'Towing Package', 'Backup Camera']
  },
  {
    name: 'Tesla Model Y',
    brand: 'Tesla',
    model: 'Model Y',
    fuelType: 'electric',
    transmission: 'automatic',
    seats: 7,
    year: 2023,
    pricePerDay: 140,
    features: ['Autopilot', 'Premium Interior', 'Third Row', 'Supercharging']
  },
  {
    name: 'Nissan Leaf',
    brand: 'Nissan',
    model: 'Leaf',
    fuelType: 'electric',
    transmission: 'automatic',
    seats: 5,
    year: 2022,
    pricePerDay: 70,
    features: ['ProPILOT Assist', 'Backup Camera', 'Apple CarPlay']
  },
  {
    name: 'Audi A4',
    brand: 'Audi',
    model: 'A4',
    fuelType: 'petrol',
    transmission: 'automatic',
    seats: 5,
    year: 2023,
    pricePerDay: 125,
    features: ['Quattro AWD', 'Virtual Cockpit', 'Bang & Olufsen Audio']
  },
  {
    name: 'Mazda CX-5',
    brand: 'Mazda',
    model: 'CX-5',
    fuelType: 'petrol',
    transmission: 'automatic',
    seats: 5,
    year: 2022,
    pricePerDay: 85,
    features: ['All-Wheel Drive', 'Blind Spot Monitor', 'Adaptive Cruise']
  },
  {
    name: 'Porsche 911 Carrera',
    brand: 'Porsche',
    model: '911',
    fuelType: 'petrol',
    transmission: 'manual',
    seats: 2,
    year: 2023,
    pricePerDay: 300,
    features: ['Sport Chrono', 'Bose Audio', 'Sport Exhaust', 'PDK']
  },
  {
    name: 'Hyundai Kona Electric',
    brand: 'Hyundai',
    model: 'Kona Electric',
    fuelType: 'electric',
    transmission: 'automatic',
    seats: 5,
    year: 2023,
    pricePerDay: 80,
    features: ['Fast Charging', 'Heated Seats', 'Wireless Charging']
  },
  {
    name: 'Jeep Wrangler Rubicon',
    brand: 'Jeep',
    model: 'Wrangler',
    fuelType: 'petrol',
    transmission: 'manual',
    seats: 4,
    year: 2022,
    pricePerDay: 95,
    features: ['4WD', 'Removable Top', 'Off-Road Package']
  },
  {
    name: 'Mercedes E-Class',
    brand: 'Mercedes-Benz',
    model: 'E-Class',
    fuelType: 'diesel',
    transmission: 'automatic',
    seats: 5,
    year: 2023,
    pricePerDay: 160,
    features: ['Luxury Interior', 'Panoramic Roof', 'Burmester Audio', 'MBUX']
  },
  {
    name: 'Volkswagen ID.4',
    brand: 'Volkswagen',
    model: 'ID.4',
    fuelType: 'electric',
    transmission: 'automatic',
    seats: 5,
    year: 2023,
    pricePerDay: 90,
    features: ['All-Wheel Drive', 'Augmented Reality HUD', 'Fast Charging']
  },
  {
    name: 'Subaru Outback',
    brand: 'Subaru',
    model: 'Outback',
    fuelType: 'petrol',
    transmission: 'automatic',
    seats: 5,
    year: 2022,
    pricePerDay: 80,
    features: ['Symmetrical AWD', 'EyeSight Safety', 'Roof Rails']
  },
  {
    name: 'Lexus RX 350h',
    brand: 'Lexus',
    model: 'RX 350',
    fuelType: 'hybrid',
    transmission: 'automatic',
    seats: 5,
    year: 2023,
    pricePerDay: 135,
    features: ['Mark Levinson Audio', 'Luxury Package', 'Adaptive Cruise']
  },
  {
    name: 'Kia Niro EV',
    brand: 'Kia',
    model: 'Niro EV',
    fuelType: 'electric',
    transmission: 'automatic',
    seats: 5,
    year: 2022,
    pricePerDay: 75,
    features: ['Heat Pump', 'Smart Cruise Control', 'Wireless CarPlay']
  },
  {
    name: 'Dodge Charger RT',
    brand: 'Dodge',
    model: 'Charger',
    fuelType: 'petrol',
    transmission: 'automatic',
    seats: 5,
    year: 2023,
    pricePerDay: 110,
    features: ['V8 Engine', 'Sport Mode', 'Harman Kardon Audio']
  },
  {
    name: 'Mini Cooper S',
    brand: 'Mini',
    model: 'Cooper S',
    fuelType: 'petrol',
    transmission: 'manual',
    seats: 4,
    year: 2022,
    pricePerDay: 85,
    features: ['Sport Package', 'Panoramic Roof', 'Harman Kardon Sound']
  }
];

async function seed() {
  console.log('🌱 Starting seed process...');

  try {
    // 1. Clean existing data
    console.log('🧹 Cleaning existing data...');
    await prisma.booking.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.car.deleteMany();
    await prisma.user.deleteMany();

    // Delete Elasticsearch index if exists
    try {
      await esClient.indices.delete({ index: 'cars' });
    } catch (e) {
      // Index might not exist
    }

    // 2. Create Elasticsearch index
    console.log('🔍 Creating Elasticsearch index...');
    await esClient.indices.create({
      index: 'cars',
      body: {
        mappings: {
          properties: {
            car_id: { type: 'keyword' },
            name: { type: 'text', analyzer: 'standard' },
            make: { type: 'keyword' },
            model: { type: 'keyword' },
            fuel: { type: 'keyword' },
            transmission: { type: 'keyword' },
            seats: { type: 'integer' },
            year: { type: 'integer' },
            price_per_day: { type: 'float' },
            location: { type: 'geo_point' },
            address: { type: 'text' },
            city: { type: 'keyword' },
            state: { type: 'keyword' },
            country: { type: 'keyword' },
            images: { type: 'keyword' },
            features: { type: 'keyword' },
            is_active: { type: 'boolean' }
          }
        }
      }
    });

    // 3. Create test users
    console.log('👥 Creating test users...');
    const passwordHash = await bcrypt.hash('Password123', 10);

    const testUser1 = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: passwordHash,
        name: 'Test User'
      }
    });

    const testUser2 = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        password: passwordHash,
        name: 'Demo User'
      }
    });

    console.log(`✅ Created users: ${testUser1.email}, ${testUser2.email}`);

    // 4. Create cars
    console.log('🚗 Creating cars...');
    const cars = [];

    for (let i = 0; i < CARS_DATA.length; i++) {
      const carData = CARS_DATA[i];
      const location = randomLocation(SAN_FRANCISCO, 10);
      const addressData = SF_ADDRESSES[i % SF_ADDRESSES.length];

      const car = await prisma.car.create({
        data: {
          name: carData.name,
          brand: carData.brand,
          model: carData.model,
          year: carData.year,
          fuelType: carData.fuelType,
          transmission: carData.transmission,
          seats: carData.seats,
          pricePerDay: carData.pricePerDay,
          latitude: location.lat,
          longitude: location.lng,
          address: addressData.address,
          city: addressData.city,
          state: addressData.state,
          country: addressData.country,
          images: [
            `https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=${encodeURIComponent(carData.name)}`,
            `https://via.placeholder.com/800x600/7C3AED/FFFFFF?text=${encodeURIComponent(carData.name)}+Interior`,
            `https://via.placeholder.com/800x600/2563EB/FFFFFF?text=${encodeURIComponent(carData.name)}+Side`
          ],
          features: carData.features,
          isActive: true
        }
      });

      cars.push(car);

      // Index in Elasticsearch/OpenSearch
      await esClient.index({
        index: 'cars',
        id: car.id,
        body: {
          car_id: car.id,
          name: car.name,
          make: car.brand,
          model: car.model,
          fuel: car.fuelType,
          transmission: car.transmission,
          seats: car.seats,
          year: car.year,
          price_per_day: Number(car.pricePerDay),
          location: {
            lat: Number(car.latitude),
            lon: Number(car.longitude)
          },
          address: car.address,
          city: car.city,
          state: car.state,
          country: car.country,
          images: car.images,
          features: car.features,
          is_active: car.isActive
        }
      });
    }

    await esClient.indices.refresh({ index: 'cars' });

    console.log(`✅ Created ${cars.length} cars`);

    // 5. Create sample bookings
    console.log('📅 Creating sample bookings...');

    const now = new Date();
    const pastBooking = await prisma.booking.create({
      data: {
        userId: testUser1.id,
        carId: cars[0].id,
        pickupTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        dropoffTime: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        totalPrice: Number(cars[0].pricePerDay) * 3,
        status: 'completed'
      }
    });

    const futureBooking = await prisma.booking.create({
      data: {
        userId: testUser1.id,
        carId: cars[1].id,
        pickupTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        dropoffTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        totalPrice: Number(cars[1].pricePerDay) * 3,
        status: 'confirmed'
      }
    });

    console.log(`✅ Created 2 sample bookings`);

    // 6. Summary
    console.log('\n✨ Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: 2`);
    console.log(`   Cars: ${cars.length}`);
    console.log(`   Bookings: 2`);
    console.log('\n🔐 Test Credentials:');
    console.log(`   Email: test@example.com`);
    console.log(`   Password: Password123`);
    console.log(`   \n   Email: demo@example.com`);
    console.log(`   Password: Password123`);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
