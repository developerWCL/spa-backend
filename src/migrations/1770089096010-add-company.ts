import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompany1770089096010 implements MigrationInterface {
  name = 'AddCompany1770089096010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "spa" ADD "company_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "spa" ADD "company_name" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "spa" ADD "billing_email" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "spa" DROP COLUMN "billing_email"`);
    await queryRunner.query(`ALTER TABLE "spa" DROP COLUMN "company_name"`);
    await queryRunner.query(`ALTER TABLE "spa" DROP COLUMN "company_id"`);
  }
}
