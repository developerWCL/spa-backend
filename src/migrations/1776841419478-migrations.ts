import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1776841419478 implements MigrationInterface {
  name = 'Migrations1776841419478';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."action_logs_feature_enum" AS ENUM('daily', 'booking', 'promotion', 'service', 'programme', 'package', 'staff', 'room', 'bed', 'customer', 'guest')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."action_logs_action_type_enum" AS ENUM('create', 'update', 'delete')`,
    );
    await queryRunner.query(
      `CREATE TABLE "action_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "action_date" TIMESTAMP NOT NULL, "feature" "public"."action_logs_feature_enum" NOT NULL, "sub_feature" character varying(100), "action_type" "public"."action_logs_action_type_enum" NOT NULL, "actor_id" uuid NOT NULL, "actor_name" character varying(255), "new_data" jsonb, "old_data" jsonb, "entity_type" character varying(255), "entity_id" uuid, "description" text, "status" character varying(50) NOT NULL DEFAULT 'success', "ip_address" character varying(45), "branch_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "branchId" uuid, CONSTRAINT "PK_cc15d2a348eaf2e1e153055380c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8cbe4dff03b8de70ff42544cff" ON "action_logs" ("branch_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e47f1c0bc456d4fb3514ae92c3" ON "action_logs" ("entity_type", "entity_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a9cc8c3676b8033d1571ea5781" ON "action_logs" ("action_type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1970642a0e7e8722403388ea85" ON "action_logs" ("actor_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5c46586c7627f828e6a40d1f64" ON "action_logs" ("feature", "action_date") `,
    );
    await queryRunner.query(
      `ALTER TABLE "action_logs" ADD CONSTRAINT "FK_f86138e7664b082b6bd49ea75e2" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "action_logs" DROP CONSTRAINT "FK_f86138e7664b082b6bd49ea75e2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5c46586c7627f828e6a40d1f64"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1970642a0e7e8722403388ea85"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a9cc8c3676b8033d1571ea5781"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e47f1c0bc456d4fb3514ae92c3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8cbe4dff03b8de70ff42544cff"`,
    );
    await queryRunner.query(`DROP TABLE "action_logs"`);
    await queryRunner.query(
      `DROP TYPE "public"."action_logs_action_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."action_logs_feature_enum"`);
  }
}
