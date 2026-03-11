import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1773195156221 implements MigrationInterface {
  name = 'Migrations1773195156221';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."promotions_discount_type_enum" AS ENUM('percentage', 'fixed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."promotions_status_enum" AS ENUM('active', 'inactive')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."promotions_day_activated_enum" AS ENUM('booking_day', 'service_day')`,
    );
    await queryRunner.query(
      `CREATE TABLE "promotions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "description" text, "discount_type" "public"."promotions_discount_type_enum" NOT NULL, "discount_value" numeric, "start_date" date, "end_date" date, "min_purchase_amount" numeric, "max_used" integer, "used" integer NOT NULL DEFAULT '0', "active_days" text array, "status" "public"."promotions_status_enum" NOT NULL DEFAULT 'active', "auto_apply" boolean NOT NULL DEFAULT false, "day_activated" "public"."promotions_day_activated_enum" NOT NULL DEFAULT 'booking_day', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "branchId" uuid, CONSTRAINT "PK_380cecbbe3ac11f0e5a7c452c34" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "programme_step_translations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "languageCode" character varying(10) NOT NULL, "title" character varying NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "programmeStepId" uuid, CONSTRAINT "PK_49ef0cf2075936ab0ff03b77dc0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "programmes_steps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "duration" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "programmeId" uuid, CONSTRAINT "PK_229fec4506703846dc6b3df917e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "programme_translations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "languageCode" character varying(10) NOT NULL, "name" character varying NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "programmeId" uuid, CONSTRAINT "PK_72697e39aad6ceeb802b1bf93b0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."programmes_status_enum" AS ENUM('active', 'inactive')`,
    );
    await queryRunner.query(
      `CREATE TABLE "programmes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "price" numeric, "status" "public"."programmes_status_enum" NOT NULL DEFAULT 'active', "max_concurrent_bookings" integer DEFAULT '0', "max_bookings_per_day" integer DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "branchId" uuid, CONSTRAINT "PK_116b5f8dbb9f632d76bc144404f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "media" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "filename" character varying NOT NULL, "type" character varying NOT NULL, "mime_type" character varying NOT NULL, "url" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "serviceId" uuid, "programmeId" uuid, "packageId" uuid, CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "package_translations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "languageCode" character varying(10) NOT NULL, "name" character varying NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "packageId" uuid, CONSTRAINT "PK_dc95c6ae274f828916b7333996f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."packages_status_enum" AS ENUM('active', 'inactive')`,
    );
    await queryRunner.query(
      `CREATE TABLE "packages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "price" numeric, "startDate" date NOT NULL, "endDate" date NOT NULL, "status" "public"."packages_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "branchId" uuid, CONSTRAINT "PK_020801f620e21f943ead9311c98" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "rooms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "type" character varying, "capacity" integer, "floor" character varying, "size" character varying, "status" character varying DEFAULT 'available', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "branchId" uuid, CONSTRAINT "PK_0368a2d7c215f2d0458a54933f2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "beds" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "bed_id" character varying, "type" character varying DEFAULT 'bed', "status" character varying DEFAULT 'available', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "roomId" uuid, "branchId" uuid, CONSTRAINT "PK_2212ae7113d85a70dc65983e742" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."carts_status_enum" AS ENUM('active', 'abandoned', 'completed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "carts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."carts_status_enum" NOT NULL DEFAULT 'active', "total_price" numeric, "items_count" integer NOT NULL DEFAULT '0', "notes" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "customerId" uuid NOT NULL, CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."cart_items_itemtype_enum" AS ENUM('sub_service', 'package', 'programme')`,
    );
    await queryRunner.query(
      `CREATE TABLE "cart_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "itemType" "public"."cart_items_itemtype_enum" NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "price" numeric, "subtotal" numeric, "scheduled_date" TIMESTAMP, "scheduled_time" TIME, "notes" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "cartId" uuid NOT NULL, "subServiceId" uuid, "packageId" uuid, "programmeId" uuid, CONSTRAINT "PK_6fccf5ec03c172d27a28a82928b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."guests_gender_enum" AS ENUM('male', 'female')`,
    );
    await queryRunner.query(
      `CREATE TABLE "guests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "special_request" character varying, "email" character varying NOT NULL, "phone" character varying, "nationality" character varying, "gender" "public"."guests_gender_enum" NOT NULL DEFAULT 'male', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "spaId" uuid, "customerId" uuid, CONSTRAINT "PK_4948267e93869ddcc6b340a2c46" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_85d472bf0e9dd55ce9a8268c3e" ON "guests" ("email") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."booking_items_itemtype_enum" AS ENUM('sub_service', 'package', 'programme')`,
    );
    await queryRunner.query(
      `CREATE TABLE "booking_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "itemType" "public"."booking_items_itemtype_enum" NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "price" numeric, "subtotal" numeric, "scheduled_date" TIMESTAMP, "scheduled_time" TIME, "duration" integer NOT NULL, "notes" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "bookingId" uuid NOT NULL, "subServiceId" uuid, "packageId" uuid, "programmeId" uuid, "bedId" uuid, CONSTRAINT "PK_53d863efb388346f9bee6ec6701" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."bookings_status_enum" AS ENUM('pending', 'confirmed', 'completed', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."bookings_payment_type_enum" AS ENUM('on_arrival', 'credit_card', 'bank_transfer', 'paypal')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."bookings_payment_status_enum" AS ENUM('pending', 'paid', 'failed', 'refunded')`,
    );
    await queryRunner.query(
      `CREATE TABLE "bookings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "booking_time" TIMESTAMP NOT NULL, "status" "public"."bookings_status_enum" NOT NULL DEFAULT 'pending', "total_amount" numeric, "items_count" integer NOT NULL DEFAULT '0', "notes" character varying, "payment_type" "public"."bookings_payment_type_enum", "payment_status" "public"."bookings_payment_status_enum", "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "customerId" uuid, "branchId" uuid, "promotionId" uuid, CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "phone" character varying, "is_verified" boolean NOT NULL DEFAULT false, "loyalty_points" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "spaId" uuid, CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8536b8b85c06969f84f0c098b0" ON "customers" ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "otp" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "code" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "type" character varying(50) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "used_at" TIMESTAMP, "spaId" uuid, CONSTRAINT "PK_32556d9d7b22031d7d0e1fd6723" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "spa" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "company_id" uuid, "company_name" character varying, "billing_email" character varying, "metadata" jsonb, "name" character varying NOT NULL, "phone" character varying, "email" character varying, "website" character varying, "status" character varying NOT NULL DEFAULT 'active', "api_key" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_ee374dba7a68caf911f9ec5f23e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "branch_operating_hours" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "day_of_week" integer NOT NULL, "open_time" TIME NOT NULL, "close_time" TIME NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "branchId" uuid, CONSTRAINT "PK_7c505ff64517e6ae2f987a0d34d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "branch_special_closures" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "specific_date" date NOT NULL, "reason" character varying, "is_all_day" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "branchId" uuid, CONSTRAINT "PK_d04f0d0bdee2ab95dbde2c7face" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_48ce552495d14eae9b187bb6716" UNIQUE ("name"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "staffs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying, "password_hash" character varying, "is_active" boolean NOT NULL DEFAULT true, "password_reset_token" character varying, "password_reset_expires" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_f3fec5e06209b46afdf8accf117" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_category_translations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "languageCode" character varying(10) NOT NULL, "name" character varying NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "serviceCategoryId" uuid, CONSTRAINT "PK_f616795af07f57f0aadad1b4e42" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "display_order" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "branchId" uuid, CONSTRAINT "PK_fe4da5476c4ffe5aa2d3524ae68" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "branch" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "location" text, "phone" character varying, "email" character varying, "website" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "spaId" uuid, CONSTRAINT "PK_2e39f426e2faefdaa93c5961976" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_translations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "languageCode" character varying(10) NOT NULL, "name" character varying NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "serviceId" uuid, CONSTRAINT "PK_887292540272908992d43b2145b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."services_status_enum" AS ENUM('active', 'inactive')`,
    );
    await queryRunner.query(
      `CREATE TABLE "services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "base_price" numeric, "duration_minutes" integer, "status" "public"."services_status_enum" NOT NULL DEFAULT 'active', "max_concurrent_bookings" integer DEFAULT '0', "max_bookings_per_day" integer DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "branchId" uuid, "categoryId" uuid, CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sub_service_translations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "languageCode" character varying(10) NOT NULL, "name" character varying NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "subServiceId" uuid, CONSTRAINT "PK_9458cef51a4eee1ce7a498fedb1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sub_services_status_enum" AS ENUM('active', 'inactive')`,
    );
    await queryRunner.query(
      `CREATE TABLE "sub_services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "duration_minutes" integer, "price" numeric, "status" "public"."sub_services_status_enum" NOT NULL DEFAULT 'active', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "serviceId" uuid, CONSTRAINT "PK_8d0808cbbab4fad02bc41183a70" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."staff_dayoffs_reason_enum" AS ENUM('sick_leave', 'personal', 'vacation', 'medical_appointment', 'family_emergency', 'other')`,
    );
    await queryRunner.query(
      `CREATE TABLE "staff_dayoffs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "staff_id" uuid NOT NULL, "reason" "public"."staff_dayoffs_reason_enum" NOT NULL DEFAULT 'other', "note" text, "status" character varying NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_aa15723202c43c9438875df124a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying, "payment_type" character varying, "amount" numeric NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "bookingId" uuid, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "languages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(10) NOT NULL, "name" character varying NOT NULL, "description" text, "isPrimary" boolean NOT NULL DEFAULT true, "isActive" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_7397752718d1c9eb873722ec9b2" UNIQUE ("code"), CONSTRAINT "PK_b517f827ca496b29f4d549c631d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "package_sub_services" ("package_id" uuid NOT NULL, "sub_service_id" uuid NOT NULL, CONSTRAINT "PK_cc7bdfe7e201f50cc07876bd9b7" PRIMARY KEY ("package_id", "sub_service_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c0514b33998fcc04d27eac0dae" ON "package_sub_services" ("package_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_34f40d449a715e7153a45a5dd4" ON "package_sub_services" ("sub_service_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "cart_items_guests" ("cartItemsId" uuid NOT NULL, "guestsId" uuid NOT NULL, CONSTRAINT "PK_500f06537b991d0e9a5bdc426c5" PRIMARY KEY ("cartItemsId", "guestsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2b6163c8d69390731a5fcd3406" ON "cart_items_guests" ("cartItemsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3eb0aac9c6c5ccd24f567bd55c" ON "cart_items_guests" ("guestsId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "booking_items_guests" ("bookingItemsId" uuid NOT NULL, "guestsId" uuid NOT NULL, CONSTRAINT "PK_a7a11cabca279d344b8d2a911d6" PRIMARY KEY ("bookingItemsId", "guestsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9987f9e2fcdce86f0fe8ca9607" ON "booking_items_guests" ("bookingItemsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_90a27cc2e412e8d6960274b29e" ON "booking_items_guests" ("guestsId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permissions" ("rolesId" uuid NOT NULL, "permissionsId" uuid NOT NULL, CONSTRAINT "PK_7931614007a93423204b4b73240" PRIMARY KEY ("rolesId", "permissionsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0cb93c5877d37e954e2aa59e52" ON "role_permissions" ("rolesId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d422dabc78ff74a8dab6583da0" ON "role_permissions" ("permissionsId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "staff_branches" ("staffsId" uuid NOT NULL, "branchId" uuid NOT NULL, CONSTRAINT "PK_1f2168a88c7f67e928692910331" PRIMARY KEY ("staffsId", "branchId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_52644780f06f120050afafaa4f" ON "staff_branches" ("staffsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8748a8b2615c0943acc9af09cf" ON "staff_branches" ("branchId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "staff_roles" ("staffsId" uuid NOT NULL, "rolesId" uuid NOT NULL, CONSTRAINT "PK_fba865e179025288d00c7b9dbee" PRIMARY KEY ("staffsId", "rolesId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_eb7e391f0a875559247bfe7d89" ON "staff_roles" ("staffsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_06e38de745f6c5b6733b1c3553" ON "staff_roles" ("rolesId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "promotions" ADD CONSTRAINT "FK_f0c22277696f66bfefe47f6c84c" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "programme_step_translations" ADD CONSTRAINT "FK_b4ca291ff417e67867193c11df6" FOREIGN KEY ("programmeStepId") REFERENCES "programmes_steps"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "programmes_steps" ADD CONSTRAINT "FK_cda2cd46cda2bce9fa115825224" FOREIGN KEY ("programmeId") REFERENCES "programmes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "programme_translations" ADD CONSTRAINT "FK_60d99c48510a136b3a5a9e86647" FOREIGN KEY ("programmeId") REFERENCES "programmes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "programmes" ADD CONSTRAINT "FK_fd38061ce4ad37c6264171667f4" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "media" ADD CONSTRAINT "FK_c3018eb8f97d05ef6247a3f5624" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "media" ADD CONSTRAINT "FK_e81853a46cc2a83f2b762be8d16" FOREIGN KEY ("programmeId") REFERENCES "programmes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "media" ADD CONSTRAINT "FK_87a3ed10853d823d2f8f983e1db" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "package_translations" ADD CONSTRAINT "FK_eb031cbd9b25aaf72000fd9dcbd" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "packages" ADD CONSTRAINT "FK_0db58e42121e067adf422522f83" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rooms" ADD CONSTRAINT "FK_136aa30aa134259d9828c2d182e" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "beds" ADD CONSTRAINT "FK_ca1eabbd3e4280a6524fe6954dc" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "beds" ADD CONSTRAINT "FK_511e6bbcd6c6bb67f1fbd5fc6fe" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" ADD CONSTRAINT "FK_a4393093f31aabad6de1f54b0e9" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_edd714311619a5ad09525045838" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_1c8e1b073643b39329cd04ba026" FOREIGN KEY ("subServiceId") REFERENCES "sub_services"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_5eb172ab6905ee433f41e91d303" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_7117f7ca7d90b5c16e90714f823" FOREIGN KEY ("programmeId") REFERENCES "programmes"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "guests" ADD CONSTRAINT "FK_c13c52975b3cc2040ec2cd54544" FOREIGN KEY ("spaId") REFERENCES "spa"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "guests" ADD CONSTRAINT "FK_a634179fa062b602268c27f08f0" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_items" ADD CONSTRAINT "FK_13671e33965ca9dca96bd3c733e" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_items" ADD CONSTRAINT "FK_81be2f6583e9f8b274017f34c10" FOREIGN KEY ("subServiceId") REFERENCES "sub_services"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_items" ADD CONSTRAINT "FK_eccb1b01bde759e479b67680496" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_items" ADD CONSTRAINT "FK_739162d31ffd6f269e4563cc8dd" FOREIGN KEY ("programmeId") REFERENCES "programmes"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_items" ADD CONSTRAINT "FK_24ab579d050232f4b8f6a2559e6" FOREIGN KEY ("bedId") REFERENCES "beds"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_67b9cd20f987fc6dc70f7cd283f" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_64de318a01c502530b1e32692fd" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD CONSTRAINT "FK_74c7e639a51f8ebeb224edc9965" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ADD CONSTRAINT "FK_7323d0b67321889d91724fdf116" FOREIGN KEY ("spaId") REFERENCES "spa"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ADD CONSTRAINT "FK_2ca30d2fa7f0ca0ae432e7ac248" FOREIGN KEY ("spaId") REFERENCES "spa"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "branch_operating_hours" ADD CONSTRAINT "FK_8e95663a03fe994b509d2ca0427" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "branch_special_closures" ADD CONSTRAINT "FK_935bab759c979a625464a4d0364" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_category_translations" ADD CONSTRAINT "FK_fe2c1cdc1ad8241c1c2e3437c52" FOREIGN KEY ("serviceCategoryId") REFERENCES "service_categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" ADD CONSTRAINT "FK_a005396e8505118ec7c185081a0" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "branch" ADD CONSTRAINT "FK_2cc4c13df9a995206db0ddca6e1" FOREIGN KEY ("spaId") REFERENCES "spa"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_translations" ADD CONSTRAINT "FK_779fb10af2736831c70689f0782" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD CONSTRAINT "FK_fde8779267ae4af0215f84a21bf" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD CONSTRAINT "FK_034b52310c2d211bc979c3cc4e8" FOREIGN KEY ("categoryId") REFERENCES "service_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_service_translations" ADD CONSTRAINT "FK_e71dbe0cccec8aefc5b3cdf9aec" FOREIGN KEY ("subServiceId") REFERENCES "sub_services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_services" ADD CONSTRAINT "FK_fae73d9e6a5ce81d81cee286016" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_dayoffs" ADD CONSTRAINT "FK_e7eac1e042001478fb9553edbed" FOREIGN KEY ("staff_id") REFERENCES "staffs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_1ead3dc5d71db0ea822706e389d" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "package_sub_services" ADD CONSTRAINT "FK_c0514b33998fcc04d27eac0dae7" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "package_sub_services" ADD CONSTRAINT "FK_34f40d449a715e7153a45a5dd41" FOREIGN KEY ("sub_service_id") REFERENCES "sub_services"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items_guests" ADD CONSTRAINT "FK_2b6163c8d69390731a5fcd34061" FOREIGN KEY ("cartItemsId") REFERENCES "cart_items"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items_guests" ADD CONSTRAINT "FK_3eb0aac9c6c5ccd24f567bd55c9" FOREIGN KEY ("guestsId") REFERENCES "guests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_items_guests" ADD CONSTRAINT "FK_9987f9e2fcdce86f0fe8ca96075" FOREIGN KEY ("bookingItemsId") REFERENCES "booking_items"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_items_guests" ADD CONSTRAINT "FK_90a27cc2e412e8d6960274b29ef" FOREIGN KEY ("guestsId") REFERENCES "guests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_0cb93c5877d37e954e2aa59e52c" FOREIGN KEY ("rolesId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_d422dabc78ff74a8dab6583da02" FOREIGN KEY ("permissionsId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_branches" ADD CONSTRAINT "FK_52644780f06f120050afafaa4f1" FOREIGN KEY ("staffsId") REFERENCES "staffs"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_branches" ADD CONSTRAINT "FK_8748a8b2615c0943acc9af09cf0" FOREIGN KEY ("branchId") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_roles" ADD CONSTRAINT "FK_eb7e391f0a875559247bfe7d897" FOREIGN KEY ("staffsId") REFERENCES "staffs"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_roles" ADD CONSTRAINT "FK_06e38de745f6c5b6733b1c3553a" FOREIGN KEY ("rolesId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "staff_roles" DROP CONSTRAINT "FK_06e38de745f6c5b6733b1c3553a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_roles" DROP CONSTRAINT "FK_eb7e391f0a875559247bfe7d897"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_branches" DROP CONSTRAINT "FK_8748a8b2615c0943acc9af09cf0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_branches" DROP CONSTRAINT "FK_52644780f06f120050afafaa4f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_d422dabc78ff74a8dab6583da02"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_0cb93c5877d37e954e2aa59e52c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_items_guests" DROP CONSTRAINT "FK_90a27cc2e412e8d6960274b29ef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_items_guests" DROP CONSTRAINT "FK_9987f9e2fcdce86f0fe8ca96075"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items_guests" DROP CONSTRAINT "FK_3eb0aac9c6c5ccd24f567bd55c9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items_guests" DROP CONSTRAINT "FK_2b6163c8d69390731a5fcd34061"`,
    );
    await queryRunner.query(
      `ALTER TABLE "package_sub_services" DROP CONSTRAINT "FK_34f40d449a715e7153a45a5dd41"`,
    );
    await queryRunner.query(
      `ALTER TABLE "package_sub_services" DROP CONSTRAINT "FK_c0514b33998fcc04d27eac0dae7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_1ead3dc5d71db0ea822706e389d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "staff_dayoffs" DROP CONSTRAINT "FK_e7eac1e042001478fb9553edbed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_services" DROP CONSTRAINT "FK_fae73d9e6a5ce81d81cee286016"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sub_service_translations" DROP CONSTRAINT "FK_e71dbe0cccec8aefc5b3cdf9aec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP CONSTRAINT "FK_034b52310c2d211bc979c3cc4e8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" DROP CONSTRAINT "FK_fde8779267ae4af0215f84a21bf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_translations" DROP CONSTRAINT "FK_779fb10af2736831c70689f0782"`,
    );
    await queryRunner.query(
      `ALTER TABLE "branch" DROP CONSTRAINT "FK_2cc4c13df9a995206db0ddca6e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_categories" DROP CONSTRAINT "FK_a005396e8505118ec7c185081a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_category_translations" DROP CONSTRAINT "FK_fe2c1cdc1ad8241c1c2e3437c52"`,
    );
    await queryRunner.query(
      `ALTER TABLE "branch_special_closures" DROP CONSTRAINT "FK_935bab759c979a625464a4d0364"`,
    );
    await queryRunner.query(
      `ALTER TABLE "branch_operating_hours" DROP CONSTRAINT "FK_8e95663a03fe994b509d2ca0427"`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" DROP CONSTRAINT "FK_2ca30d2fa7f0ca0ae432e7ac248"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" DROP CONSTRAINT "FK_7323d0b67321889d91724fdf116"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_74c7e639a51f8ebeb224edc9965"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_64de318a01c502530b1e32692fd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP CONSTRAINT "FK_67b9cd20f987fc6dc70f7cd283f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_items" DROP CONSTRAINT "FK_24ab579d050232f4b8f6a2559e6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_items" DROP CONSTRAINT "FK_739162d31ffd6f269e4563cc8dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_items" DROP CONSTRAINT "FK_eccb1b01bde759e479b67680496"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_items" DROP CONSTRAINT "FK_81be2f6583e9f8b274017f34c10"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_items" DROP CONSTRAINT "FK_13671e33965ca9dca96bd3c733e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "guests" DROP CONSTRAINT "FK_a634179fa062b602268c27f08f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "guests" DROP CONSTRAINT "FK_c13c52975b3cc2040ec2cd54544"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_7117f7ca7d90b5c16e90714f823"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_5eb172ab6905ee433f41e91d303"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_1c8e1b073643b39329cd04ba026"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_edd714311619a5ad09525045838"`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" DROP CONSTRAINT "FK_a4393093f31aabad6de1f54b0e9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "beds" DROP CONSTRAINT "FK_511e6bbcd6c6bb67f1fbd5fc6fe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "beds" DROP CONSTRAINT "FK_ca1eabbd3e4280a6524fe6954dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rooms" DROP CONSTRAINT "FK_136aa30aa134259d9828c2d182e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "packages" DROP CONSTRAINT "FK_0db58e42121e067adf422522f83"`,
    );
    await queryRunner.query(
      `ALTER TABLE "package_translations" DROP CONSTRAINT "FK_eb031cbd9b25aaf72000fd9dcbd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "media" DROP CONSTRAINT "FK_87a3ed10853d823d2f8f983e1db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "media" DROP CONSTRAINT "FK_e81853a46cc2a83f2b762be8d16"`,
    );
    await queryRunner.query(
      `ALTER TABLE "media" DROP CONSTRAINT "FK_c3018eb8f97d05ef6247a3f5624"`,
    );
    await queryRunner.query(
      `ALTER TABLE "programmes" DROP CONSTRAINT "FK_fd38061ce4ad37c6264171667f4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "programme_translations" DROP CONSTRAINT "FK_60d99c48510a136b3a5a9e86647"`,
    );
    await queryRunner.query(
      `ALTER TABLE "programmes_steps" DROP CONSTRAINT "FK_cda2cd46cda2bce9fa115825224"`,
    );
    await queryRunner.query(
      `ALTER TABLE "programme_step_translations" DROP CONSTRAINT "FK_b4ca291ff417e67867193c11df6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "promotions" DROP CONSTRAINT "FK_f0c22277696f66bfefe47f6c84c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_06e38de745f6c5b6733b1c3553"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_eb7e391f0a875559247bfe7d89"`,
    );
    await queryRunner.query(`DROP TABLE "staff_roles"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8748a8b2615c0943acc9af09cf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_52644780f06f120050afafaa4f"`,
    );
    await queryRunner.query(`DROP TABLE "staff_branches"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d422dabc78ff74a8dab6583da0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0cb93c5877d37e954e2aa59e52"`,
    );
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_90a27cc2e412e8d6960274b29e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9987f9e2fcdce86f0fe8ca9607"`,
    );
    await queryRunner.query(`DROP TABLE "booking_items_guests"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3eb0aac9c6c5ccd24f567bd55c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2b6163c8d69390731a5fcd3406"`,
    );
    await queryRunner.query(`DROP TABLE "cart_items_guests"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_34f40d449a715e7153a45a5dd4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c0514b33998fcc04d27eac0dae"`,
    );
    await queryRunner.query(`DROP TABLE "package_sub_services"`);
    await queryRunner.query(`DROP TABLE "languages"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TABLE "staff_dayoffs"`);
    await queryRunner.query(`DROP TYPE "public"."staff_dayoffs_reason_enum"`);
    await queryRunner.query(`DROP TABLE "sub_services"`);
    await queryRunner.query(`DROP TYPE "public"."sub_services_status_enum"`);
    await queryRunner.query(`DROP TABLE "sub_service_translations"`);
    await queryRunner.query(`DROP TABLE "services"`);
    await queryRunner.query(`DROP TYPE "public"."services_status_enum"`);
    await queryRunner.query(`DROP TABLE "service_translations"`);
    await queryRunner.query(`DROP TABLE "branch"`);
    await queryRunner.query(`DROP TABLE "service_categories"`);
    await queryRunner.query(`DROP TABLE "service_category_translations"`);
    await queryRunner.query(`DROP TABLE "staffs"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TABLE "branch_special_closures"`);
    await queryRunner.query(`DROP TABLE "branch_operating_hours"`);
    await queryRunner.query(`DROP TABLE "spa"`);
    await queryRunner.query(`DROP TABLE "otp"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8536b8b85c06969f84f0c098b0"`,
    );
    await queryRunner.query(`DROP TABLE "customers"`);
    await queryRunner.query(`DROP TABLE "bookings"`);
    await queryRunner.query(
      `DROP TYPE "public"."bookings_payment_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."bookings_payment_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."bookings_status_enum"`);
    await queryRunner.query(`DROP TABLE "booking_items"`);
    await queryRunner.query(`DROP TYPE "public"."booking_items_itemtype_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_85d472bf0e9dd55ce9a8268c3e"`,
    );
    await queryRunner.query(`DROP TABLE "guests"`);
    await queryRunner.query(`DROP TYPE "public"."guests_gender_enum"`);
    await queryRunner.query(`DROP TABLE "cart_items"`);
    await queryRunner.query(`DROP TYPE "public"."cart_items_itemtype_enum"`);
    await queryRunner.query(`DROP TABLE "carts"`);
    await queryRunner.query(`DROP TYPE "public"."carts_status_enum"`);
    await queryRunner.query(`DROP TABLE "beds"`);
    await queryRunner.query(`DROP TABLE "rooms"`);
    await queryRunner.query(`DROP TABLE "packages"`);
    await queryRunner.query(`DROP TYPE "public"."packages_status_enum"`);
    await queryRunner.query(`DROP TABLE "package_translations"`);
    await queryRunner.query(`DROP TABLE "media"`);
    await queryRunner.query(`DROP TABLE "programmes"`);
    await queryRunner.query(`DROP TYPE "public"."programmes_status_enum"`);
    await queryRunner.query(`DROP TABLE "programme_translations"`);
    await queryRunner.query(`DROP TABLE "programmes_steps"`);
    await queryRunner.query(`DROP TABLE "programme_step_translations"`);
    await queryRunner.query(`DROP TABLE "promotions"`);
    await queryRunner.query(
      `DROP TYPE "public"."promotions_day_activated_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."promotions_status_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."promotions_discount_type_enum"`,
    );
  }
}
