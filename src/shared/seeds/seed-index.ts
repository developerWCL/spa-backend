import { seedRoles } from './seed-roles';
import { seedStaff } from './seed-staff';
import { seedServiceCategories } from './seed-service-categories';

async function run() {
  try {
    console.log('Running seeds...');
    await seedRoles();
    await seedStaff();
    await seedServiceCategories();
    console.log('All seeds complete');
    process.exit(0);
  } catch (err) {
    console.error('Seed error', err);
    process.exit(1);
  }
}

if (require.main === module) run();

export default run;
