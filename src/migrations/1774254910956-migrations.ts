import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1774254910956 implements MigrationInterface {
    name = ' $npmConfigName1774254910956'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."paypal_accounts_mode_enum" AS ENUM('sandbox', 'live')`);
        await queryRunner.query(`CREATE TABLE "paypal_accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "label" character varying NOT NULL, "client_id" text NOT NULL, "client_secret" text NOT NULL, "webhook_id" character varying, "mode" "public"."paypal_accounts_mode_enum" NOT NULL DEFAULT 'sandbox', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "spaId" uuid, CONSTRAINT "PK_08d054255fa00fc33cb971d384f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "paypal_account_branches" ("paypal_account_id" uuid NOT NULL, "branch_id" uuid NOT NULL, CONSTRAINT "PK_89f4bbbe847913040c65eb9953e" PRIMARY KEY ("paypal_account_id", "branch_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ebc037013229b194c65cd656f9" ON "paypal_account_branches" ("paypal_account_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_fd2572d30260cd6aee7a60caee" ON "paypal_account_branches" ("branch_id") `);
        await queryRunner.query(`ALTER TABLE "payments" ADD "paypal_order_id" character varying`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "paypal_capture_id" character varying`);
        await queryRunner.query(`ALTER TABLE "paypal_accounts" ADD CONSTRAINT "FK_a91ef23453559f241bba22655c3" FOREIGN KEY ("spaId") REFERENCES "spa"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "paypal_account_branches" ADD CONSTRAINT "FK_ebc037013229b194c65cd656f98" FOREIGN KEY ("paypal_account_id") REFERENCES "paypal_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "paypal_account_branches" ADD CONSTRAINT "FK_fd2572d30260cd6aee7a60caeed" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "paypal_account_branches" DROP CONSTRAINT "FK_fd2572d30260cd6aee7a60caeed"`);
        await queryRunner.query(`ALTER TABLE "paypal_account_branches" DROP CONSTRAINT "FK_ebc037013229b194c65cd656f98"`);
        await queryRunner.query(`ALTER TABLE "paypal_accounts" DROP CONSTRAINT "FK_a91ef23453559f241bba22655c3"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "paypal_capture_id"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "paypal_order_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fd2572d30260cd6aee7a60caee"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ebc037013229b194c65cd656f9"`);
        await queryRunner.query(`DROP TABLE "paypal_account_branches"`);
        await queryRunner.query(`DROP TABLE "paypal_accounts"`);
        await queryRunner.query(`DROP TYPE "public"."paypal_accounts_mode_enum"`);
    }

}
