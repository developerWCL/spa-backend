import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SpaModule } from './modules/spa/spa.module';
import { StaffAuthModule } from './modules/staff-auth/staff-auth.module';
import { BranchesModule } from './modules/branches/branches.module';
import { StaffDayoffModule } from './modules/staff-dayoff/staff-dayoff.module';
import { ServicesModule } from './modules/services/services.module';
import { MediasModule } from './modules/medias/medias.module';
import { typeOrmConfig } from './config/typeorm';
import { SubscriptionClientService } from './shared/subscription-client.service';
import { LanguagesModule } from './modules/languages/languages.module';
import { ProgrammesModule } from './modules/programmes/programmes.module';
import { PackagesModule } from './modules/packages/packages.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { BedsModule } from './modules/beds/beds.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    SpaModule,
    StaffAuthModule,
    BranchesModule,
    StaffDayoffModule,
    ServicesModule,
    MediasModule,
    LanguagesModule,
    ProgrammesModule,
    PackagesModule,
    RoomsModule,
    BedsModule,
  ],
  controllers: [AppController],
  providers: [AppService, SubscriptionClientService],
})
export class AppModule {}
