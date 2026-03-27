import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1774411038357 implements MigrationInterface {
  name = 'Migrations1774411038357';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "room_bed_closure" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "closure_date" TIMESTAMP NOT NULL, "reason" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "roomId" uuid, "bedId" uuid, CONSTRAINT "PK_33df04986738031f37d8fbfc093" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "beds" ADD "reason" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "room_bed_closure" ADD CONSTRAINT "FK_72c4c1bf4f1a30721a3978973af" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "room_bed_closure" ADD CONSTRAINT "FK_da2b06d795f94e6ea5f83f8b82a" FOREIGN KEY ("bedId") REFERENCES "beds"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "room_bed_closure" DROP CONSTRAINT "FK_da2b06d795f94e6ea5f83f8b82a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "room_bed_closure" DROP CONSTRAINT "FK_72c4c1bf4f1a30721a3978973af"`,
    );
    await queryRunner.query(`ALTER TABLE "beds" DROP COLUMN "reason"`);
    await queryRunner.query(`DROP TABLE "room_bed_closure"`);
  }
}
