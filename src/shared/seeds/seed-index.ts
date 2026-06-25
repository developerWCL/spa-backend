import { seedLanguages } from './seed-languages';
import { seedRoles } from './seed-roles';
import { seedStaff } from './seed-staff';
import { seedSpa } from './seed-spa';
import { seedBranches } from './seed-branches';
import { seedBranchOperatingHours } from './seed-branch-operating-hours';
// import { seedBranchSpecialClosures } from './seed-branch-special-closures';
import { seedRooms } from './seed-rooms';
import { seedBeds } from './seed-beds';
import { seedServiceCategories } from './seed-service-categories';
import { seedServiceCategoryTranslations } from './seed-category-translations';
import { seedServices } from './seed-services';
import { seedSubServices } from './seed-sub-services';
import { seedPackages } from './seed-packages';
import { seedProgrammes } from './seed-programmes';
import { seedProgrammeSteps } from './seed-programme-steps';
import { seedPromotions } from './seed-promotions';
// import { seedCustomers } from './seed-customers';
// import { seedGuests } from './seed-guests';
// import { seedCarts } from './seed-carts';
// import { seedCartItems } from './seed-cart-items';
// import { seedStaffDayoff } from './seed-staff-dayoff';
// import { seedBookings } from './seed-bookings';
// import { seedPayments } from './seed-payments';
import { dataSource } from '../../config/typeorm';

async function run() {
  try {
    console.log('🌱 Running comprehensive database seeds...\n');

    // Initialize database connection once
    console.log('Initializing database connection...');
    await dataSource.initialize();
    console.log('✅ Database connected\n');

    // // Base entities
    console.log('=== Phase 1: Core Setup ===');
    console.log('Seeding Languages...');
    await seedLanguages();

    console.log('Seeding Roles & Permissions...');
    await seedRoles();

    console.log('Seeding Spa...');
    await seedSpa();

    console.log('\n=== Phase 2: Branch & Facilities ===');
    console.log('Seeding Branches...');
    await seedBranches();

    console.log('Seeding Branch Operating Hours...');
    await seedBranchOperatingHours();

    // console.log('Seeding Branch Special Closures...');
    // await seedBranchSpecialClosures();

    // console.log('Seeding Rooms...');
    // await seedRooms();

    // console.log('Seeding Beds...');
    // await seedBeds();

    console.log('\n=== Phase 3: Staffing ===');
    console.log('Seeding Staff...');
    await seedStaff();

    // console.log('Seeding Staff Day-off...');
    // await seedStaffDayoff();

    console.log('\n=== Phase 4: Services & Products ===');
    console.log('Seeding Service Categories...');
    await seedServiceCategories();

    console.log('Seeding Service Category Translations...');
    await seedServiceCategoryTranslations();

    // console.log('Seeding Services...');
    // await seedServices();

    // console.log('Seeding Sub-Services...');
    // await seedSubServices();

    // console.log('\n=== Phase 5: Packages & Programmes ===');
    // console.log('Seeding Packages...');
    // await seedPackages();

    // console.log('Seeding Programmes...');
    // await seedProgrammes();

    // console.log('Seeding Programme Steps...');
    // await seedProgrammeSteps();

    // console.log('\n=== Phase 6: Marketing & Sales ===');
    // console.log('Seeding Promotions...');
    // await seedPromotions();

    // console.log('\n=== Phase 7: Customer Management ===');
    // console.log('Seeding Customers...');
    // await seedCustomers();

    // console.log('Seeding Guests...');
    // await seedGuests();

    // console.log('\n=== Phase 8: Transactions ===');
    // console.log('Seeding Carts...');
    // await seedCarts();

    // console.log('Seeding Cart Items...');
    // await seedCartItems();

    // console.log('Seeding Bookings...');
    // await seedBookings();

    // console.log('Seeding Payments...');
    // await seedPayments();

    console.log('\n✅ All seeds completed successfully!');
    console.log('🎉 Database is now populated with sample data.\n');

    // Close database connection
    await dataSource.destroy();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error', err);
    await dataSource.destroy();
    process.exit(1);
  }
}

if (require.main === module) void run();

export default run;
