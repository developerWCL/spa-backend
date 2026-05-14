import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1778054300517 implements MigrationInterface {
  name = 'Migrations1778054300517';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "promotion_packages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "promotionId" uuid, "packageId" uuid, CONSTRAINT "PK_2c5896b391334f14b1840314e00" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "promotion_programmes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "promotionId" uuid, "programmeId" uuid, CONSTRAINT "PK_ca4d0112f01d114db72b01869f0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "promotion_services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "promotionId" uuid, "serviceId" uuid, CONSTRAINT "PK_5f8b4e8e3f9dac710dae1898fb2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "spa" ADD "service_duration" integer NOT NULL DEFAULT '60'`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotion_packages" ADD CONSTRAINT "FK_e41c29a3d0234fd5da9e6d94cbe" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotion_packages" ADD CONSTRAINT "FK_e1b165eb496c471846c5dd70d04" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotion_programmes" ADD CONSTRAINT "FK_ddf8d84d5204859c8d24767e459" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotion_programmes" ADD CONSTRAINT "FK_7400275850412150c3e52d3107d" FOREIGN KEY ("programmeId") REFERENCES "programmes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotion_services" ADD CONSTRAINT "FK_c8eda48bc6fb1b9b7315ff163ae" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotion_services" ADD CONSTRAINT "FK_935db06c3f4a1fab1bc1b447f33" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "promotion_services" DROP CONSTRAINT "FK_935db06c3f4a1fab1bc1b447f33"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotion_services" DROP CONSTRAINT "FK_c8eda48bc6fb1b9b7315ff163ae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotion_programmes" DROP CONSTRAINT "FK_7400275850412150c3e52d3107d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotion_programmes" DROP CONSTRAINT "FK_ddf8d84d5204859c8d24767e459"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotion_packages" DROP CONSTRAINT "FK_e1b165eb496c471846c5dd70d04"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotion_packages" DROP CONSTRAINT "FK_e41c29a3d0234fd5da9e6d94cbe"`,
    );
    await queryRunner.query(`ALTER TABLE "spa" DROP COLUMN "service_duration"`);
    await queryRunner.query(`DROP TABLE "promotion_services"`);
    await queryRunner.query(`DROP TABLE "promotion_programmes"`);
    await queryRunner.query(`DROP TABLE "promotion_packages"`);
  }
}
