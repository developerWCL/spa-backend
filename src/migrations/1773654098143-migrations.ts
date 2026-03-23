import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1773654098143 implements MigrationInterface {
  name = 'Migrations1773654098143';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "booking_items" ADD "roomId" uuid`);
    await queryRunner.query(`ALTER TABLE "booking_items" ADD "staffId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "booking_items" ADD CONSTRAINT "FK_6ee62f52377843ef9d203cfc05e" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_items" ADD CONSTRAINT "FK_5a81db649a66e391bdf830974f8" FOREIGN KEY ("staffId") REFERENCES "staffs"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "booking_items" DROP CONSTRAINT "FK_5a81db649a66e391bdf830974f8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_items" DROP CONSTRAINT "FK_6ee62f52377843ef9d203cfc05e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_items" DROP COLUMN "staffId"`,
    );
    await queryRunner.query(`ALTER TABLE "booking_items" DROP COLUMN "roomId"`);
  }
}
