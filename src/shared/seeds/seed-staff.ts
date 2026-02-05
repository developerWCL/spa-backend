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

  // Get or create therapist role
  let therapistRole = await roleRepo.findOne({
    where: { name: 'therapist' },
    relations: ['permissions'],
  });
  if (!therapistRole) {
    const therapistPerms = await permRepo.find({
      where: [
        { name: 'view:bookings' },
        { name: 'view:clients' },
        { name: 'manage:own:schedule' },
        { name: 'view:own:profile' },
        { name: 'update:own:profile' },
        { name: 'manage:own:availability' },
      ],
    });
    therapistRole = roleRepo.create({
      name: 'therapist',
      permissions: therapistPerms,
    });
    therapistRole = await roleRepo.save(therapistRole);
    console.log('Created therapist role');
  }

  // Get or create reception role
  let receptionRole = await roleRepo.findOne({
    where: { name: 'reception' },
    relations: ['permissions'],
  });
  if (!receptionRole) {
    const receptionPerms = await permRepo.find({
      where: [
        { name: 'manage:bookings' },
        { name: 'manage:clients' },
        { name: 'view:schedule' },
        { name: 'manage:appointments' },
        { name: 'view:staff:availability' },
        { name: 'manage:services' },
      ],
    });
    receptionRole = roleRepo.create({
      name: 'reception',
      permissions: receptionPerms,
    });
    receptionRole = await roleRepo.save(receptionRole);
    console.log('Created reception role');
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

  // Create therapist staff
  const therapistEmail = 'therapist@spa.local';
  let therapistStaff = await staffRepo.findOne({
    where: { email: therapistEmail },
  });
  if (!therapistStaff) {
    const therapistPassword = 'therapist123456';
    const passwordHash = await hashPassword(therapistPassword);

    therapistStaff = staffRepo.create({
      firstName: 'Emma',
      lastName: 'Wilson',
      email: therapistEmail,
      passwordHash,
      branches: [branch],
      roles: [therapistRole],
      isActive: true,
    });
    therapistStaff = await staffRepo.save(therapistStaff);
    console.log(`Created therapist staff: ${therapistEmail}`);
    console.log(`Default password: ${therapistPassword}`);
  } else {
    console.log(`Therapist staff already exists: ${therapistEmail}`);
  }

  // Create reception staff
  const receptionEmail = 'reception@spa.local';
  let receptionStaff = await staffRepo.findOne({
    where: { email: receptionEmail },
  });
  if (!receptionStaff) {
    const receptionPassword = 'reception123456';
    const passwordHash = await hashPassword(receptionPassword);

    receptionStaff = staffRepo.create({
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: receptionEmail,
      passwordHash,
      branches: [branch],
      roles: [receptionRole],
      isActive: true,
    });
    receptionStaff = await staffRepo.save(receptionStaff);
    console.log(`Created reception staff: ${receptionEmail}`);
    console.log(`Default password: ${receptionPassword}`);
  } else {
    console.log(`Reception staff already exists: ${receptionEmail}`);
  }

  await dataSource.destroy();
}
