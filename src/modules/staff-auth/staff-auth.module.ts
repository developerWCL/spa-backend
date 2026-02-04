import { Module } from '@nestjs/common';
import { AuthSubmodule } from './auth/auth.module';
import { RolesSubmodule } from './roles/roles.module';
import { StaffSubmodule } from './staff/staff.module';

@Module({
  imports: [AuthSubmodule, RolesSubmodule, StaffSubmodule],
  exports: [AuthSubmodule, RolesSubmodule, StaffSubmodule],
})
export class StaffAuthModule {}
