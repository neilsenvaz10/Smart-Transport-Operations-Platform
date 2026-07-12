import { PrismaClient, Role, VehicleStatus, DriverStatus, MaintenanceStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clear existing data
  await prisma.expense.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const passwordHash = await bcrypt.hash('Password123', 10);

  const manager = await prisma.user.create({
    data: {
      email: 'manager@transitops.com',
      passwordHash,
      name: 'Alice Fleet Manager',
      role: Role.fleet_manager,
    },
  });

  const driverUser = await prisma.user.create({
    data: {
      email: 'driver@transitops.com',
      passwordHash,
      name: 'Bob Driver User',
      role: Role.driver,
    },
  });

  await prisma.user.create({
    data: {
      email: 'safety@transitops.com',
      passwordHash,
      name: 'Charlie Safety Officer',
      role: Role.safety_officer,
    },
  });

  await prisma.user.create({
    data: {
      email: 'analyst@transitops.com',
      passwordHash,
      name: 'Diana Financial Analyst',
      role: Role.financial_analyst,
    },
  });

  console.log('Created Users:');
  console.log('- Fleet Manager: manager@transitops.com / Password123');
  console.log('- Driver (Dispatcher): driver@transitops.com / Password123');
  console.log('- Safety Officer: safety@transitops.com / Password123');
  console.log('- Financial Analyst: analyst@transitops.com / Password123');

  // 3. Create Vehicles
  const vehicle1 = await prisma.vehicle.create({
    data: {
      registrationNumber: 'V-001-XYZ',
      nameModel: 'Ford F-550 Cargo Van',
      type: 'Van',
      maxLoadCapacity: 3500, // kg
      odometer: 12500.5,
      acquisitionCost: 45000,
      status: VehicleStatus.available,
      region: 'North Depot',
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      registrationNumber: 'V-002-ABC',
      nameModel: 'Volvo VNL 860 Heavy Duty',
      type: 'Box Truck',
      maxLoadCapacity: 12000,
      odometer: 84300.0,
      acquisitionCost: 110000,
      status: VehicleStatus.in_shop,
      region: 'East Depot',
    },
  });

  console.log('Created Vehicles: V-001-XYZ (Available), V-002-ABC (In Shop)');

  // 4. Create Drivers
  const driver1 = await prisma.driver.create({
    data: {
      name: 'Bob Driver User',
      userId: driverUser.id,
      licenseNumber: 'DL-992348',
      licenseCategory: 'Class A CDL',
      licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      contactNumber: '+1-555-0199',
      safetyScore: 98.5,
      status: DriverStatus.available,
    },
  });

  const driver2 = await prisma.driver.create({
    data: {
      name: 'John Expired License',
      licenseNumber: 'DL-773412',
      licenseCategory: 'Class B CDL',
      licenseExpiry: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Expired 30 days ago
      contactNumber: '+1-555-0177',
      safetyScore: 82.0,
      status: DriverStatus.available,
    },
  });

  const driver3 = await prisma.driver.create({
    data: {
      name: 'Sam Suspended',
      licenseNumber: 'DL-112233',
      licenseCategory: 'Class A CDL',
      licenseExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      contactNumber: '+1-555-0122',
      safetyScore: 65.0,
      status: DriverStatus.suspended,
    },
  });

  console.log('Created Drivers: Bob Driver User (Available), John Expired License (Available but Expired), Sam Suspended (Suspended)');

  // 5. Create Maintenance Log
  await prisma.maintenanceLog.create({
    data: {
      vehicleId: vehicle2.id,
      description: 'Engine transmission rebuild',
      cost: 4500,
      status: MaintenanceStatus.active,
      openedAt: new Date(),
      createdById: manager.id,
    },
  });

  console.log('Created Active Maintenance Log for Volvo Box Truck (vehicle2)');
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
