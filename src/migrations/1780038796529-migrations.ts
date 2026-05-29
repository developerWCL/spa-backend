import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1780038796529 implements MigrationInterface {
  name = 'Migrations1780038796529';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."promotions_guest_type_enum" AS ENUM('all_guests', 'authenticated_only')`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotions" ADD "guest_type" "public"."promotions_guest_type_enum" NOT NULL DEFAULT 'all_guests'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "promotions" DROP COLUMN "guest_type"`,
    );
    await queryRunner.query(`DROP TYPE "public"."promotions_guest_type_enum"`);
  }
}
