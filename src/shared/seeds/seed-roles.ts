import { dataSource } from '../../config/typeorm';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';

export async function seedRoles() {
  await dataSource.initialize();
  const roleRepo = dataSource.getRepository(Role);
  const permRepo = dataSource.getRepository(Permission);

  // Define all permissions
  const perms = [
    // Admin permissions
    'manage:roles',
    'manage:staffs',
    'manage:bookings',
    'manage:clients',
    'manage:services',
    'manage:branches',
    'view:reports',
    'view:analytics',
    'view:branches',
    'manage:staff_dayoff',
    'view:staff_dayoff',

    // Therapist permissions
    'view:bookings',
    'view:clients',
    'manage:own:schedule',
    'view:own:profile',
    'update:own:profile',
    'manage:own:availability',

    // Reception permissions
    'manage:bookings',
    'manage:clients',
    'view:schedule',
    'manage:appointments',
    'view:staff:availability',
    'manage:services',
  ];

  const savedPerms: Permission[] = [];
  for (const name of perms) {
    let p = await permRepo.findOne({ where: { name } });
    if (!p) {
      p = permRepo.create({ name });
      p = await permRepo.save(p);
      console.log('Created permission:', name);
    }
    savedPerms.push(p);
  }

  // Define roles with their permissions
  const rolesConfig = [
    {
      name: 'admin',
      permissionNames: perms, // Admin has all permissions
    },
    {
      name: 'therapist',
      permissionNames: [
        'view:bookings',
        'view:clients',
        'manage:own:schedule',
        'view:own:profile',
        'update:own:profile',
        'manage:own:availability',
      ],
    },
    {
      name: 'reception',
      permissionNames: [
        'manage:bookings',
        'manage:clients',
        'view:schedule',
        'manage:appointments',
        'view:staff:availability',
        'manage:services',
      ],
    },
  ];

  for (const roleConfig of rolesConfig) {
    let role = await roleRepo.findOne({
      where: { name: roleConfig.name },
      relations: ['permissions'],
    });

    const rolePerms = savedPerms.filter((p) =>
      roleConfig.permissionNames.includes(p.name),
    );

    if (!role) {
      role = roleRepo.create({
        name: roleConfig.name,
        permissions: rolePerms,
      });
      role = await roleRepo.save(role);
      console.log(`Created role: ${roleConfig.name}`);
    } else {
      role.permissions = rolePerms;
      await roleRepo.save(role);
      console.log(`Updated role: ${roleConfig.name}`);
    }
  }

  await dataSource.destroy();
}
