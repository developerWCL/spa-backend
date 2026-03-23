import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1773384677881 implements MigrationInterface {
  name = 'Migrations1773384677881';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_85d472bf0e9dd55ce9a8268c3e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD "booking_id" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "UQ_7ff0b5d1ab3fea22169440436f2" UNIQUE ("booking_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "UQ_7ff0b5d1ab3fea22169440436f2"`,
    );
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "booking_id"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_85d472bf0e9dd55ce9a8268c3e" ON "guests" ("email") `,
    );
  }
}
