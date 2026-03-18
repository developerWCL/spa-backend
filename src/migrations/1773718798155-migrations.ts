import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1773718798155 implements MigrationInterface {
  name = 'Migrations1773718798155';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bookings" ADD "amount" numeric`);
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD "discount_amount" numeric`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP COLUMN "discount_amount"`,
    );
    await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "amount"`);
  }
}
