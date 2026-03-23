import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1773713538737 implements MigrationInterface {
  name = 'Migrations1773713538737';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP COLUMN "payment_type"`,
    );
    await queryRunner.query(`DROP TYPE "public"."bookings_payment_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP COLUMN "payment_status"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."bookings_payment_status_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "status"`);
    await queryRunner.query(
      `CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'paid', 'failed', 'refunded')`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "status" "public"."payments_status_enum" NOT NULL DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN "payment_type"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payments_payment_type_enum" AS ENUM('on_arrival', 'credit_card', 'bank_transfer', 'paypal')`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "payment_type" "public"."payments_payment_type_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN "payment_type"`,
    );
    await queryRunner.query(`DROP TYPE "public"."payments_payment_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "payment_type" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "payments" ADD "status" character varying`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."bookings_payment_status_enum" AS ENUM('pending', 'paid', 'failed', 'refunded')`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD "payment_status" "public"."bookings_payment_status_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."bookings_payment_type_enum" AS ENUM('on_arrival', 'credit_card', 'bank_transfer', 'paypal')`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD "payment_type" "public"."bookings_payment_type_enum"`,
    );
  }
}
