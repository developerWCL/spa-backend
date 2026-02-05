import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SpaModule } from './modules/spa/spa.module';
import { StaffAuthModule } from './modules/staff-auth/staff-auth.module';
import { BranchesModule } from './modules/branches/branches.module';
import { typeOrmConfig } from './config/typeorm';
import { SubscriptionClientService } from './shared/subscription-client.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    SpaModule,
    StaffAuthModule,
    BranchesModule,
  ],
  controllers: [AppController],
  providers: [AppService, SubscriptionClientService],
})
export class AppModule {}
