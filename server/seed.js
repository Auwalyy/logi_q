require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Driver = require('./models/Driver');
const Vehicle = require('./models/Vehicle');
const Queue = require('./models/Queue');
const Trip = require('./models/Trip');

const ROUTES = ['Kano → Lagos', 'Kano → Abuja', 'Kano → Kaduna', 'Kano → Katsina', 'Kano → Maiduguri'];
const PARKS = ['Kano Central Park', 'Sabon Gari Terminal', 'Yankaba Cargo Hub'];
const NAMES = ['Musa Abdullahi', 'Ibrahim Yusuf', 'Aminu Sani', 'Usman Bello', 'Kabiru Lawal', 'Suleiman Garba', 'Abubakar Tukur', 'Haruna Danladi'];
const PLATES = ['KN-001-AA', 'KN-002-BB', 'KN-003-CC', 'KN-004-DD', 'KN-005-EE', 'KN-006-FF', 'KN-007-GG', 'KN-008-HH'];
const TYPES = ['truck', 'bus', 'minibus', 'cargo_van'];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding...');

  await Promise.all([User.deleteMany(), Driver.deleteMany(), Vehicle.deleteMany(), Queue.deleteMany(), Trip.deleteMany()]);

  // Admin user
  const admin = await User.create({
    name: 'Park Admin', email: 'admin@parka.ng',
    phone: '+2348000000001', password: 'password123',
    role: 'admin', park: 'Kano Central Park',
  });
  console.log('✓ Admin created: admin@parka.ng / password123');

  // Vehicles
  const vehicles = await Vehicle.insertMany(
    PLATES.map((p, i) => ({
      plateNumber: p, type: TYPES[i % TYPES.length],
      capacity: [50, 18, 14, 5][i % 4],
      cargoCapacity: [20, 5, 2, 10][i % 4],
      company: 'Kano Transport Co.',
      route: ROUTES[i % ROUTES.length],
      status: 'active',
    }))
  );
  console.log(`✓ ${vehicles.length} vehicles created`);

  // Drivers
  const drivers = await Promise.all(
    NAMES.map((name, i) => Driver.create({
      name, phone: `+23480${String(10000000 + i).slice(1)}`,
      licenseNumber: `KN-2024-00${i + 1}`,
      password: 'driver123',
      vehicle: vehicles[i]._id,
      status: ['available', 'in_queue', 'loading', 'available'][i % 4],
      totalTrips: Math.floor(Math.random() * 200) + 10,
      isVerified: i % 3 !== 0,
    }))
  );
  console.log(`✓ ${drivers.length} drivers created`);

  // Queues
  const queues = await Queue.insertMany(
    ROUTES.slice(0, 3).map((route, i) => ({
      name: `${route.split('→')[1].trim()} Queue`,
      route, park: PARKS[i % PARKS.length],
      type: ['mixed', 'cargo', 'passenger'][i % 3],
      status: 'active',
      avgLoadTimeMinutes: 25 + i * 5,
      entries: drivers.slice(i * 2, i * 2 + 3).map((d, j) => ({
        driver: d._id, vehicle: vehicles[i * 2 + j]?._id,
        position: j + 1,
        status: j === 0 ? 'loading' : 'waiting',
        destination: route.split('→')[1].trim(),
        estimatedDepartureTime: new Date(Date.now() + (j + 1) * 30 * 60 * 1000),
        passengerCount: Math.floor(Math.random() * 40) + 5,
      })),
    }))
  );
  console.log(`✓ ${queues.length} queues created`);

  // Trips (historical)
  const tripData = [];
  for (let i = 0; i < 30; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const dep = new Date(Date.now() - daysAgo * 86400000 - Math.random() * 43200000);
    const route = ROUTES[i % ROUTES.length];
    tripData.push({
      driver: drivers[i % drivers.length]._id,
      vehicle: vehicles[i % vehicles.length]._id,
      origin: 'Kano', destination: route.split('→')[1].trim(),
      route, type: ['passenger', 'cargo', 'mixed'][i % 3],
      status: 'departed',
      scheduledDeparture: dep,
      actualDeparture: new Date(dep.getTime() + Math.random() * 20 * 60000),
      passengerCount: Math.floor(Math.random() * 45) + 5,
      cargoWeight: Math.floor(Math.random() * 15),
      delayMinutes: Math.floor(Math.random() * 40),
      fare: 5000 + Math.floor(Math.random() * 10000),
    });
  }
  await Trip.insertMany(tripData);
  console.log(`✓ ${tripData.length} trips created`);

  console.log('\n🚀 Seed complete! Login: admin@parka.ng / password123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
