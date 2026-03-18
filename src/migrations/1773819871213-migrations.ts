import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1773819871213 implements MigrationInterface {
  name = 'Migrations1773819871213';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "media" ADD "promotionId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "media" ADD CONSTRAINT "FK_ca0f2e126416ae2b4387651c6c9" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "media" DROP CONSTRAINT "FK_ca0f2e126416ae2b4387651c6c9"`,
    );
    await queryRunner.query(`ALTER TABLE "media" DROP COLUMN "promotionId"`);
  }
}
