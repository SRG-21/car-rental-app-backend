import { PrismaClient } from '@prisma/client';
import { Client } from '@elastic/elasticsearch';
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

const CARS_DATA = [
  {
    name: 'Tesla Model 3',
    fuel: 'electric',
    transmission: 'automatic',
    seats: 5,
    year: 2023,
    pricePerDay: 120,
    features: ['Autopilot', 'Premium Audio', 'Glass Roof', 'Heated Seats']
  },
  {
    name: 'Toyota Camry',
    fuel: 'hybrid',
    transmission: 'automatic',
    seats: 5,
    year: 2022,
    pricePerDay: 75,
    features: ['Backup Camera', 'Bluetooth', 'Lane Assist']
  },
  {
    name: 'Ford Mustang',
    fuel: 'petrol',
    transmission: 'manual',
    seats: 4,
    year: 2021,
    pricePerDay: 150,
    features: ['Sport Mode', 'Premium Sound', 'Navigation']
  },
  {
    name: 'Honda Civic',
    fuel: 'petrol',
    transmission: 'automatic',
    seats: 5,
    year: 2023,
    pricePerDay: 65,
    features: ['Bluetooth', 'Backup Camera', 'Cruise Control']
  },
  {
    name: 'BMW 3 Series',
    fuel: 'diesel',
    transmission: 'automatic',
    seats: 5,
    year: 2022,
    pricePerDay: 130,
    features: ['Leather Seats', 'Sunroof', 'Premium Audio', 'Navigation']
  },
  {
    name: 'Chevrolet Suburban',
    fuel: 'petrol',
    transmission: 'automatic',
    seats: 7,
    year: 2023,
    pricePerDay: 110,
    features: ['Third Row Seating', '4WD', 'Towing Package', 'Backup Camera']
  },
  {
    name: 'Tesla Model Y',
    fuel: 'electric',
    transmission: 'automatic',
    seats: 7,
    year: 2023,
    pricePerDay: 140,
    features: ['Autopilot', 'Premium Interior', 'Third Row', 'Supercharging']
  },
  {
    name: 'Nissan Leaf',
    fuel: 'electric',
    transmission: 'automatic',
    seats: 5,
    year: 2022,
    pricePerDay: 70,
    features: ['ProPILOT Assist', 'Backup Camera', 'Apple CarPlay']
  },
  {
    name: 'Audi A4',
    fuel: 'petrol',
    transmission: 'automatic',
    seats: 5,
    year: 2023,
    pricePerDay: 125,
    features: ['Quattro AWD', 'Virtual Cockpit', 'Bang & Olufsen Audio']
  },
  {
    name: 'Mazda CX-5',
    fuel: 'petrol',
    transmission: 'automatic',
    seats: 5,
    year: 2022,
    pricePerDay: 85,
    features: ['All-Wheel Drive', 'Blind Spot Monitor', 'Adaptive Cruise']
  },
  {
    name: 'Porsche 911',
    fuel: 'petrol',
    transmission: 'manual',
    seats: 2,
    year: 2023,
    pricePerDay: 300,
    features: ['Sport Chrono', 'Bose Audio', 'Sport Exhaust', 'PDK']
  },
  {
    name: 'Hyundai Kona Electric',
    fuel: 'electric',
    transmission: 'automatic',
    seats: 5,
    year: 2023,
    pricePerDay: 80,
    features: ['Fast Charging', 'Heated Seats', 'Wireless Charging']
  },
  {
    name: 'Jeep Wrangler',
    fuel: 'petrol',
    transmission: 'manual',
    seats: 4,
    year: 2022,
    pricePerDay: 95,
    features: ['4WD', 'Removable Top', 'Off-Road Package']
  },
  {
    name: 'Mercedes E-Class',
    fuel: 'diesel',
    transmission: 'automatic',
    seats: 5,
    year: 2023,
    pricePerDay: 160,
    features: ['Luxury Interior', 'Panoramic Roof', 'Burmester Audio', 'MBUX']
  },
  {
    name: 'Volkswagen ID.4',
    fuel: 'electric',
    transmission: 'automatic',
    seats: 5,
    year: 2023,
    pricePerDay: 90,
    features: ['All-Wheel Drive', 'Augmented Reality HUD', 'Fast Charging']
  },
  {
    name: 'Subaru Outback',
    fuel: 'petrol',
    transmission: 'automatic',
    seats: 5,
    year: 2022,
    pricePerDay: 80,
    features: ['Symmetrical AWD', 'EyeSight Safety', 'Roof Rails']
  },
  {
    name: 'Lexus RX 350',
    fuel: 'hybrid',
    transmission: 'automatic',
    seats: 5,
    year: 2023,
    pricePerDay: 135,
    features: ['Mark Levinson Audio', 'Luxury Package', 'Adaptive Cruise']
  },
  {
    name: 'Kia Niro EV',
    fuel: 'electric',
    transmission: 'automatic',
    seats: 5,
    year: 2022,
    pricePerDay: 75,
    features: ['Heat Pump', 'Smart Cruise Control', 'Wireless CarPlay']
  },
  {
    name: 'Dodge Charger',
    fuel: 'petrol',
    transmission: 'automatic',
    seats: 5,
    year: 2023,
    pricePerDay: 110,
    features: ['V8 Engine', 'Sport Mode', 'Harman Kardon Audio']
  },
  {
    name: 'Mini Cooper S',
    fuel: 'petrol',
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
            fuel: { type: 'keyword' },
            transmission: { type: 'keyword' },
            seats: { type: 'integer' },
            year: { type: 'integer' },
            price_per_day: { type: 'float' },
            location: { type: 'geo_point' },
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
        passwordHash,
        name: 'Test User'
      }
    });

    const testUser2 = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        passwordHash,
        name: 'Demo User'
      }
    });

    console.log(`✅ Created users: ${testUser1.email}, ${testUser2.email}`);

    // 4. Create cars
    console.log('🚗 Creating cars...');
    const cars = [];

    for (const carData of CARS_DATA) {
      const location = randomLocation(SAN_FRANCISCO, 10);

      const car = await prisma.car.create({
        data: {
          ...carData,
          baseLat: location.lat,
          baseLng: location.lng,
          images: [
            `https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=${encodeURIComponent(carData.name)}`,
            `https://via.placeholder.com/800x600/7C3AED/FFFFFF?text=${encodeURIComponent(carData.name)}+Interior`,
            `https://via.placeholder.com/800x600/2563EB/FFFFFF?text=${encodeURIComponent(carData.name)}+Side`
          ],
          isActive: true
        }
      });

      cars.push(car);

      // Index in Elasticsearch
      await esClient.index({
        index: 'cars',
        id: car.id,
        document: {
          car_id: car.id,
          name: car.name,
          fuel: car.fuel,
          transmission: car.transmission,
          seats: car.seats,
          year: car.year,
          price_per_day: Number(car.pricePerDay),
          location: {
            lat: Number(car.baseLat),
            lon: Number(car.baseLng)
          },
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
