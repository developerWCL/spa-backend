import { dataSource } from '../../config/typeorm';
import { Staff } from '../../entities/staffs.entity';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';
import { Branch } from '../../entities/branch.entity';
import { hashPassword } from '../../shared/password.util';

export async function seedStaff() {
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
  const branch = await branchRepo.findOne({
    where: {
      name: 'Deevana Patong Resort & Spa',
    },
  });
  const orBranch = await branchRepo.find({
    where: {
      spa: {
        name: 'Orientala Spa',
      },
    },
  });
  const wclBranch = await branchRepo.find({
    where: {
      spa: {
        name: 'Web Connection Spa',
      },
    },
  });

  // Create default admin staff
  const adminEmail = 'admin@spa.local';
  const wclAdminEmail = 'wcl-admin@spa.local';
  const admin1Email = 'admin1@spa.local';
  const admin2Email = 'admin2@spa.local';
  const admin3Email = 'admin3@spa.local';

  let adminStaff = await staffRepo.findOne({ where: { email: adminEmail } });
  let wclAdminStaff = await staffRepo.findOne({
    where: { email: wclAdminEmail },
  });
  let admin1Staff = await staffRepo.findOne({ where: { email: admin1Email } });
  let admin2Staff = await staffRepo.findOne({ where: { email: admin2Email } });
  let admin3Staff = await staffRepo.findOne({ where: { email: admin3Email } });

  if (!adminStaff) {
    const adminPassword = 'admin123456'; // Default password
    const passwordHash = await hashPassword(adminPassword);

    adminStaff = staffRepo.create({
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      passwordHash: passwordHash,
      branches: orBranch,
      roles: [adminRole],
      isActive: true,
    });
    adminStaff = await staffRepo.save(adminStaff);
    console.log(`Created admin staff: ${adminEmail}`);
    console.log(`Default password: ${adminPassword}`);
  } else {
    console.log(`Admin staff already exists: ${adminEmail}`);
  }

  if (!wclAdminStaff) {
    const wclAdminPassword = 'wcladmin123456'; // Default password
    const passwordHash = await hashPassword(wclAdminPassword);

    wclAdminStaff = staffRepo.create({
      firstName: 'WCL Admin',
      lastName: 'User',
      email: wclAdminEmail,
      passwordHash: passwordHash,
      branches: wclBranch,
      roles: [adminRole],
      isActive: true,
    });
    wclAdminStaff = await staffRepo.save(wclAdminStaff);
    console.log(`Created WCL admin staff: ${wclAdminEmail}`);
    console.log(`Default password: ${wclAdminPassword}`);
  } else {
    console.log(`WCL Admin staff already exists: ${wclAdminEmail}`);
  }

  if (!admin1Staff) {
    const admin1Password = 'admin1123456'; // Default password
    const passwordHash = await hashPassword(admin1Password);

    admin1Staff = staffRepo.create({
      firstName: 'Admin1',
      lastName: 'User',
      email: admin1Email,
      passwordHash: passwordHash,
      branches: orBranch,
      roles: [adminRole],
      isActive: true,
    });
    admin1Staff = await staffRepo.save(admin1Staff);
    console.log(`Created admin staff: ${admin1Email}`);
    console.log(`Default password: ${admin1Password}`);
  } else {
    console.log(`Admin staff already exists: ${admin1Email}`);
  }

  if (!admin2Staff) {
    const admin2Password = 'admin2123456'; // Default password
    const passwordHash = await hashPassword(admin2Password);

    admin2Staff = staffRepo.create({
      firstName: 'Admin2',
      lastName: 'User',
      email: admin2Email,
      passwordHash: passwordHash,
      branches: orBranch,
      roles: [adminRole],
      isActive: true,
    });
    admin2Staff = await staffRepo.save(admin2Staff);
    console.log(`Created admin staff: ${admin2Email}`);
    console.log(`Default password: ${admin2Password}`);
  } else {
    console.log(`Admin staff already exists: ${admin2Email}`);
  }

  if (!admin3Staff) {
    const admin3Password = 'admin3123456'; // Default password
    const passwordHash = await hashPassword(admin3Password);

    admin3Staff = staffRepo.create({
      firstName: 'Admin3',
      lastName: 'User',
      email: admin3Email,
      passwordHash: passwordHash,
      branches: orBranch,
      roles: [adminRole],
      isActive: true,
    });
    admin3Staff = await staffRepo.save(admin3Staff);
    console.log(`Created admin staff: ${admin3Email}`);
    console.log(`Default password: ${admin3Password}`);
  } else {
    console.log(`Admin staff already exists: ${admin3Email}`);
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
}
