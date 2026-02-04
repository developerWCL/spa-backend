import { dataSource } from '../../config/typeorm';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';

export async function seedRoles() {
  await dataSource.initialize();
  const roleRepo = dataSource.getRepository(Role);
  const permRepo = dataSource.getRepository(Permission);

  const perms = ['manage:roles', 'manage:bookings', 'view:reports'];
  const savedPerms: Permission[] = [];
  for (const name of perms) {
    let p = await permRepo.findOne({ where: { name } });
    if (!p) {
      p = permRepo.create({ name });
      p = await permRepo.save(p);
      console.log('Created permission', name);
    }
    savedPerms.push(p);
  }

  const adminRoleName = 'admin';
  let admin = await roleRepo.findOne({
    where: { name: adminRoleName },
    relations: ['permissions'],
  });
  if (!admin) {
    admin = roleRepo.create({ name: adminRoleName, permissions: savedPerms });
    admin = await roleRepo.save(admin);
    console.log('Created role', adminRoleName);
  } else {
    admin.permissions = savedPerms;
    await roleRepo.save(admin);
    console.log('Updated role', adminRoleName);
  }

  await dataSource.destroy();
}
