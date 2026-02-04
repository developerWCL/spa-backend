import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../../entities/role.entity';
import { Permission } from '../../../entities/permission.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { CreatePermissionDto } from '../dto/create-permission.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permRepo: Repository<Permission>,
  ) {}

  async listRoles() {
    return this.roleRepo.find({ relations: ['permissions'] });
  }

  async listPermissions() {
    return this.permRepo.find();
  }

  async createPermission(dto: CreatePermissionDto) {
    const existing = await this.permRepo.findOne({ where: { name: dto.name } });
    if (existing) return existing;
    const p = this.permRepo.create({ name: dto.name });
    return this.permRepo.save(p);
  }

  async createRole(dto: CreateRoleDto) {
    const perms = [] as Permission[];
    if (dto.permissionNames && dto.permissionNames.length) {
      for (const name of dto.permissionNames) {
        let p = await this.permRepo.findOne({ where: { name } });
        if (!p) {
          p = this.permRepo.create({ name });
          p = await this.permRepo.save(p);
        }
        perms.push(p);
      }
    }

    const role = this.roleRepo.create({ name: dto.name, permissions: perms });
    return this.roleRepo.save(role);
  }

  async getRole(id: string) {
    const r = await this.roleRepo.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!r) throw new NotFoundException('Role not found');
    return r;
  }
}
