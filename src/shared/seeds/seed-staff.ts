import { dataSource } from '../../config/typeorm';
import { Staff } from '../../entities/staffs.entity';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';
import { Branch } from '../../entities/branch.entity';
import { hashPassword } from '../../shared/password.util';

export async function seedStaff() {
  await dataSource.initialize();
  const staffRepo = dataSource.getRepository(Staff);
  const roleRepo = dataSource.getRepository(Role);
  const permRepo = dataSource.getRepository(Permission);
  const branchRepo = dataSource.getRepository(Branch);

  // All permissions
  const permissionNames = [
    'manage:roles',
    'manage:bookings',
    'view:reports',
    'manage:staffs',
  ];

  // Ensure all permissions exist
  const savedPerms: Permission[] = [];
  for (const name of permissionNames) {
    let p = await permRepo.findOne({ where: { name } });
    if (!p) {
      p = permRepo.create({ name });
      p = await permRepo.save(p);
      console.log('Created permission', name);
    }
    savedPerms.push(p);
  }

  // Ensure admin role exists with all permissions
  let adminRole = await roleRepo.findOne({
    where: { name: 'admin' },
    relations: ['permissions'],
  });
  if (!adminRole) {
    adminRole = roleRepo.create({ name: 'admin', permissions: savedPerms });
    adminRole = await roleRepo.save(adminRole);
    console.log('Created admin role with all permissions');
  } else {
    adminRole.permissions = savedPerms;
    await roleRepo.save(adminRole);
    console.log('Updated admin role with all permissions');
  }

  // Get default branch or create one
  let branch = await branchRepo.findOne({ where: {} });
  if (!branch) {
    // Create a default branch if none exists
    branch = branchRepo.create({
      name: 'Main Branch',
      // Add other required fields if needed
    });
    branch = await branchRepo.save(branch);
    console.log('Created default branch');
  }

  // Create default admin staff
  const adminEmail = 'admin@spa.local';
  let adminStaff = await staffRepo.findOne({ where: { email: adminEmail } });
  if (!adminStaff) {
    const adminPassword = 'admin123456'; // Default password
    const passwordHash = await hashPassword(adminPassword);

    adminStaff = staffRepo.create({
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      passwordHash,
      branches: [branch],
      roles: [adminRole],
      isActive: true,
    });
    adminStaff = await staffRepo.save(adminStaff);
    console.log(`Created admin staff: ${adminEmail}`);
    console.log(`Default password: ${adminPassword}`);
  } else {
    console.log(`Admin staff already exists: ${adminEmail}`);
  }

  await dataSource.destroy();
}
