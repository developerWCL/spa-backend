import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1770021547665 implements MigrationInterface {
  name = 'Initial1770021547665';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "programmes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "branchId" uuid, CONSTRAINT "PK_116b5f8dbb9f632d76bc144404f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "base_price" numeric, "duration_minutes" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "branchId" uuid, CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "packages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "price" numeric, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "branchId" uuid, CONSTRAINT "PK_020801f620e21f943ead9311c98" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "rooms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "room_number" character varying NOT NULL, "room_type" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "branchId" uuid, CONSTRAINT "PK_0368a2d7c215f2d0458a54933f2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "beds" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bed_label" character varying NOT NULL, "status" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "roomId" uuid, CONSTRAINT "PK_2212ae7113d85a70dc65983e742" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "promotions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "discount_percent" numeric, "start_date" date, "end_date" date, "max_used" integer, "used" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "branchId" uuid, CONSTRAINT "PK_380cecbbe3ac11f0e5a7c452c34" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "bookings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "booking_time" TIMESTAMP NOT NULL, "status" character varying, "total_amount" numeric, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "customerId" uuid, "branchId" uuid, "serviceId" uuid, "packageId" uuid, "programmeId" uuid, "bedId" uuid, "promotionId" uuid, CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying, "loyalty_points" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "spaId" uuid, CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8536b8b85c06969f84f0c098b0" ON "customers" ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "spa_api_keys" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key_hash" text NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "expires_at" TIMESTAMP, "last_used_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "spaId" uuid, CONSTRAINT "PK_bbcb61b7a780eda6b84c2a02b39" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "spa" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "phone" character varying, "email" character varying, "website" character varying, "status" character varying NOT NULL DEFAULT 'active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_ee374dba7a68caf911f9ec5f23e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "branch_operating_hours" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "day_of_week" integer NOT NULL, "open_time" TIME NOT NULL, "close_time" TIME NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "branchId" uuid, CONSTRAINT "PK_7c505ff64517e6ae2f987a0d34d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "branch_special_closures" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "specific_date" date NOT NULL, "reason" character varying, "is_all_day" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "branchId" uuid, CONSTRAINT "PK_d04f0d0bdee2ab95dbde2c7face" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "branch" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "location" text, "phone" character varying, "email" character varying, "website" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "spaId" uuid, CONSTRAINT "PK_2e39f426e2faefdaa93c5961976" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "staffs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "role" character varying, "email" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "branchId" uuid, CONSTRAINT "PK_f3fec5e06209b46afdf8accf117" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying, "payment_type" character varying, "amount" numeric NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "bookingId" uuid, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "package_services" ("programme_id" uuid NOT NULL, "service_id" uuid NOT NULL, CONSTRAINT "PK_7327da88b8f341fb6077c8c861d" PRIMARY KEY ("programme_id", "service_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_15cc1856a61222183610f750b1" ON "package_services" ("programme_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_88a6b1f9641c4e6e37b385e20b" ON "package_services" ("service_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "programmes" ADD CONSTRAINT "FK_fd38061ce4ad37c6264171667f4" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD CONSTRAINT "FK_fde8779267ae4af0215f84a21bf" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "packages" ADD CONSTRAINT "FK_0db58e42121e067adf422522f83" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rooms" ADD CONSTRAINT "FK_136aa30aa134259d9828c2d182e" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "beds" ADD CONSTRAINT "FK_ca1eabbd3e4280a6524fe6954dc" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotions" ADD CONSTRAINT "FK_f0c22277696f66bfefe47f6c84c" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_67b9cd20f987fc6dc70f7cd283f" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_64de318a01c502530b1e32692fd" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_15a2431ec10d29dcd96c9563b65" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_c33a993088cbe955492d812b1b2" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_bcee1c00cf99a8e7a942c71ee5d" FOREIGN KEY ("programmeId") REFERENCES "programmes"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_2fe939c8efe2bff6e501f797b06" FOREIGN KEY ("bedId") REFERENCES "beds"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_74c7e639a51f8ebeb224edc9965" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ADD CONSTRAINT "FK_7323d0b67321889d91724fdf116" FOREIGN KEY ("spaId") REFERENCES "spa"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "spa_api_keys" ADD CONSTRAINT "FK_c9c3977e83ff78e1c4887288df6" FOREIGN KEY ("spaId") REFERENCES "spa"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "branch_operating_hours" ADD CONSTRAINT "FK_8e95663a03fe994b509d2ca0427" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "branch_special_closures" ADD CONSTRAINT "FK_935bab759c979a625464a4d0364" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "branch" ADD CONSTRAINT "FK_2cc4c13df9a995206db0ddca6e1" FOREIGN KEY ("spaId") REFERENCES "spa"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "staffs" ADD CONSTRAINT "FK_aebb25039f25dfe6395e4384239" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_1ead3dc5d71db0ea822706e389d" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "package_services" ADD CONSTRAINT "FK_15cc1856a61222183610f750b11" FOREIGN KEY ("programme_id") REFERENCES "programmes"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "package_services" ADD CONSTRAINT "FK_88a6b1f9641c4e6e37b385e20bb" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "package_services" DROP CONSTRAINT "FK_88a6b1f9641c4e6e37b385e20bb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "package_services" DROP CONSTRAINT "FK_15cc1856a61222183610f750b11"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_1ead3dc5d71db0ea822706e389d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staffs" DROP CONSTRAINT "FK_aebb25039f25dfe6395e4384239"`,
    );
    await queryRunner.query(
      `ALTER TABLE "branch" DROP CONSTRAINT "FK_2cc4c13df9a995206db0ddca6e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "branch_special_closures" DROP CONSTRAINT "FK_935bab759c979a625464a4d0364"`,
    );
    await queryRunner.query(
      `ALTER TABLE "branch_operating_hours" DROP CONSTRAINT "FK_8e95663a03fe994b509d2ca0427"`,
    );
    await queryRunner.query(
      `ALTER TABLE "spa_api_keys" DROP CONSTRAINT "FK_c9c3977e83ff78e1c4887288df6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" DROP CONSTRAINT "FK_7323d0b67321889d91724fdf116"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_74c7e639a51f8ebeb224edc9965"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_2fe939c8efe2bff6e501f797b06"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_bcee1c00cf99a8e7a942c71ee5d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_c33a993088cbe955492d812b1b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_15a2431ec10d29dcd96c9563b65"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_64de318a01c502530b1e32692fd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_67b9cd20f987fc6dc70f7cd283f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotions" DROP CONSTRAINT "FK_f0c22277696f66bfefe47f6c84c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "beds" DROP CONSTRAINT "FK_ca1eabbd3e4280a6524fe6954dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rooms" DROP CONSTRAINT "FK_136aa30aa134259d9828c2d182e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "packages" DROP CONSTRAINT "FK_0db58e42121e067adf422522f83"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP CONSTRAINT "FK_fde8779267ae4af0215f84a21bf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "programmes" DROP CONSTRAINT "FK_fd38061ce4ad37c6264171667f4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_88a6b1f9641c4e6e37b385e20b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_15cc1856a61222183610f750b1"`,
    );
    await queryRunner.query(`DROP TABLE "package_services"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TABLE "staffs"`);
    await queryRunner.query(`DROP TABLE "branch"`);
    await queryRunner.query(`DROP TABLE "branch_special_closures"`);
    await queryRunner.query(`DROP TABLE "branch_operating_hours"`);
    await queryRunner.query(`DROP TABLE "spa"`);
    await queryRunner.query(`DROP TABLE "spa_api_keys"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8536b8b85c06969f84f0c098b0"`,
    );
    await queryRunner.query(`DROP TABLE "customers"`);
    await queryRunner.query(`DROP TABLE "bookings"`);
    await queryRunner.query(`DROP TABLE "promotions"`);
    await queryRunner.query(`DROP TABLE "beds"`);
    await queryRunner.query(`DROP TABLE "rooms"`);
    await queryRunner.query(`DROP TABLE "packages"`);
    await queryRunner.query(`DROP TABLE "services"`);
    await queryRunner.query(`DROP TABLE "programmes"`);
  }
}
