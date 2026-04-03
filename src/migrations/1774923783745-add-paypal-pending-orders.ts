import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaypalPendingOrders1774923783745 implements MigrationInterface {
    name = 'AddPaypalPendingOrders1774923783745'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "paypal_pending_orders" ("paypal_order_id" character varying NOT NULL, "branch_id" character varying NOT NULL, "booking_payload" jsonb NOT NULL, "booking_items" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7ea6b48e7ac9c9a38c263e3c583" PRIMARY KEY ("paypal_order_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "paypal_pending_orders"`);
    }

}
