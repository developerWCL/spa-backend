import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1773887249211 implements MigrationInterface {
  name = 'Migrations1773887249211';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "media" ADD "branchId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "media" ADD CONSTRAINT "FK_ee95061064e3947e36dcb4ee75e" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "media" DROP CONSTRAINT "FK_ee95061064e3947e36dcb4ee75e"`,
    );
    await queryRunner.query(`ALTER TABLE "media" DROP COLUMN "branchId"`);
  }
}
