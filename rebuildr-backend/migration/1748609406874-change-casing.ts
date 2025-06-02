import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeCasing1748609406874 implements MigrationInterface {
  name = 'ChangeCasing1748609406874';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const dbName = process.env.DB_NAME;

    await queryRunner.query(
      `ALTER TABLE "shipping_price" RENAME COLUMN "max_weight" TO "maxWeight"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" RENAME COLUMN "mime_type" to "mimeType"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" RENAME COLUMN "created_at" TO "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" RENAME COLUMN "product_image_id" TO "productImageId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" RENAME COLUMN "product_document_id" TO "productDocumentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" RENAME COLUMN "user_id" TO "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "brand" RENAME COLUMN "created_at" TO "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "brand" RENAME COLUMN "updated_at" TO "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" RENAME COLUMN "parent_id" TO "parentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" RENAME COLUMN "in_selection" TO "inSelection"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" RENAME COLUMN "in_season" TO "inSeason"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" RENAME COLUMN "image_id" TO "imageId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" RENAME COLUMN "primary_quantity_unit" TO "primaryQuantityUnit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" RENAME COLUMN "secondary_quantity_unit" TO "secondaryQuantityUnit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" RENAME COLUMN "order_index" TO "orderIndex"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" RENAME COLUMN "created_at" TO "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" RENAME COLUMN "purchase_id" TO "purchaseId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" RENAME COLUMN "reviewer_id" TO "reviewerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" RENAME COLUMN "reviewee_id" TO "revieweeId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "created_at" TO "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "product_id" TO "productId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "buyer_id" TO "buyerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "rocker_payment_id" TO "rockerPaymentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "rocker_offer_id" TO "rockerOfferId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "delivered_at" TO "deliveredAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "approved_at" TO "approvedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "payout_received_at" TO "payoutReceivedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "rocker_payout_id" TO "rockerPayoutId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "payout_started_at" TO "payoutStartedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "failed_at" TO "failedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "payment_sent_at" TO "paymentSentAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "payment_accepted_at" TO "paymentAcceptedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "shipment_booked_at" TO "shipmentBookedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "shipment_dropped_off_at" TO "shipmentDroppedOffAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "shipment_delivered_at" TO "shipmentDeliveredAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "shipment_started_at" TO "shipmentStartedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "paused_at" TO "pausedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "payout_failed_at" TO "payoutFailedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "refund_id" TO "refundId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" RENAME COLUMN "created_at" TO "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" RENAME COLUMN "sender_id" TO "senderId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" RENAME COLUMN "receiver_id" TO "receiverId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" RENAME COLUMN "product_id" TO "productId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" RENAME COLUMN "created_at" TO "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" RENAME COLUMN "contact_name" TO "contactName"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" RENAME COLUMN "contact_email" TO "contactEmail"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" RENAME COLUMN "contact_phone" TO "contactPhone"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" RENAME COLUMN "address_location" TO "addressLocation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" RENAME COLUMN "user_id" TO "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" RENAME COLUMN "project_picture_id" TO "projectPictureId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "created_at" TO "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "category_id" TO "categoryId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "seller_id" TO "sellerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "address_location" TO "addressLocation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "hidden_reason" TO "hiddenReason"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "is_giveaway" TO "isGiveaway"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "primary_quantity" TO "primaryQuantity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "primary_unit" TO "primaryUnit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "secondary_quantity" TO "secondaryQuantity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "secondary_unit" TO "secondaryUnit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "brand_id" TO "brandId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "updated_at" TO "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "project_id" TO "projectId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "pickup_enabled" TO "pickupEnabled"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "delivery_radius" TO "deliveryRadius"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "delivery_price" TO "deliveryPrice"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "delivery_enabled" TO "deliveryEnabled"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "deleted_at" TO "deletedAt"`,
    );

    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "text_search"`);
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`,
      ['GENERATED_COLUMN', 'text_search', dbName, 'public', 'product'],
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD "textSearch" tsvector GENERATED ALWAYS AS (setweight(to_tsvector('swedish', coalesce(title, '')), 'A') || setweight(to_tsvector('swedish', coalesce(description, '')), 'B')) STORED`,
    );
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        dbName,
        'public',
        'product',
        'GENERATED_COLUMN',
        'textSearch',
        "setweight(to_tsvector('swedish', coalesce(title, '')), 'A') || setweight(to_tsvector('swedish', coalesce(description, '')), 'B')",
      ],
    );

    await queryRunner.query(
      `ALTER TABLE "refresh_token" RENAME COLUMN "expires_at" TO "expiresAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_token" RENAME COLUMN "user_id" TO "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_result" RENAME COLUMN "search_string" TO "searchString"`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_result" RENAME COLUMN "deleted_at" TO "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_result" RENAME COLUMN "created_at" TO "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_result" RENAME COLUMN "updated_at" TO "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_result" RENAME COLUMN "searcher_id" TO "searcherId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "created_at" TO "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "verify_email_token" TO "verifyEmailToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "reset_password_token" TO "resetPasswordToken"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "address_location" TO "addressLocation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "rocker_user_id" TO "rockerUserId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "email_verified_at" TO "emailVerifiedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "organization_number" TO "organizationNumber"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "organization_approved_at" TO "organizationApprovedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "phone_number" TO "phoneNumber"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "payout_account_swish_id" TO "payoutAccountSwishId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "payout_account_rix_id" TO "payoutAccountRixId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "payout_account_bank_giro_id" TO "payoutAccountBankGiroId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "payout_account_plus_giro_id" TO "payoutAccountPlusGiroId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "selected_payout_method" TO "selectedPayoutMethod"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "deleted_at" TO "deletedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "post_code" TO "postCode"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "notify_on_message" TO "notifyOnMessage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "notify_on_buy" TO "notifyOnBuy"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "notify_on_sale" TO "notifyOnSale"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" RENAME COLUMN "user_id" TO "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" RENAME COLUMN "created_at" TO "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_brands_brand" RENAME COLUMN "category_id" TO "categoryId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_brands_brand" RENAME COLUMN "brand_id" TO "brandId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_liked_by_user" RENAME COLUMN "product_id" TO "productId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_liked_by_user" RENAME COLUMN "user_id" TO "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shipping_prices_shipping_price" RENAME COLUMN "product_id" TO "productId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shipping_prices_shipping_price" RENAME COLUMN "shipping_price_id" TO "shippingPriceId"`,
    );

    //Payout method
    await queryRunner.query(
      `ALTER TYPE "public"."user_selected_payout_method_enum" RENAME TO "user_selected_payout_method_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_selectedpayoutmethod_enum" AS ENUM('SWISH', 'TRUSTLY', 'RIX', 'BANKGIRO', 'PLUGIRO')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "selectedPayoutMethod" TYPE "public"."user_selectedpayoutmethod_enum" USING "selectedPayoutMethod"::"text"::"public"."user_selectedpayoutmethod_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_selected_payout_method_enum_old"`,
    );

    //Purchase status
    await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."purchase_status_enum"`);
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`,
      ['GENERATED_COLUMN', 'status', dbName, 'public', 'purchase'],
    );
    await queryRunner.query(
      `CREATE TYPE "public"."purchase_status_enum" AS ENUM('CLAIMED', 'PAYMENT_SENT', 'PAYMENT_ACCEPTED', 'SHIPMENT_BOOKED', 'SHIPMENT_DROPPED_OFF', 'SHIPPING_STARTED', 'SHIPPING_DELIVERED', 'DELIVERED', 'APPROVED', 'PAYOUT_STARTED', 'FINISHED_FAILED', 'FINISHED_SUCCESS', 'PAUSED', 'PAYOUT_FAILED')`,
    );

    await queryRunner.query(`ALTER TABLE "purchase" ADD "status" "public"."purchase_status_enum" GENERATED ALWAYS AS (
      CASE
        WHEN "failedAt" IS NOT NULL THEN 'FINISHED_FAILED'::purchase_status_enum
        WHEN "payoutReceivedAt" IS NOT NULL THEN 'FINISHED_SUCCESS'::purchase_status_enum
        WHEN "payoutFailedAt" IS NOT NULL THEN 'PAYOUT_FAILED'::purchase_status_enum
        WHEN "payoutStartedAt" IS NOT NULL THEN 'PAYOUT_STARTED'::purchase_status_enum
        WHEN "approvedAt" IS NOT NULL THEN 'APPROVED'::purchase_status_enum
        WHEN "pausedAt" IS NOT NULL THEN 'PAUSED'::purchase_status_enum
        WHEN "deliveredAt" IS NOT NULL THEN 'DELIVERED'::purchase_status_enum
        WHEN "shipmentDeliveredAt" IS NOT NULL THEN 'SHIPPING_DELIVERED'::purchase_status_enum
        WHEN "shipmentStartedAt" IS NOT NULL THEN 'SHIPPING_STARTED'::purchase_status_enum
        WHEN "shipmentDroppedOffAt" IS NOT NULL THEN 'SHIPMENT_DROPPED_OFF'::purchase_status_enum
        WHEN "shipmentBookedAt" IS NOT NULL THEN 'SHIPMENT_BOOKED'::purchase_status_enum
        WHEN "paymentAcceptedAt" IS NOT NULL THEN 'PAYMENT_ACCEPTED'::purchase_status_enum
        WHEN "paymentSentAt" IS NOT NULL THEN 'PAYMENT_SENT'::purchase_status_enum
        ELSE 'CLAIMED'::purchase_status_enum
      END
    ) STORED NOT NULL`);
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        dbName,
        'public',
        'purchase',
        'GENERATED_COLUMN',
        'status',
        "\n      CASE\n        WHEN \"failedAt\" IS NOT NULL THEN 'FINISHED_FAILED'::purchase_status_enum\n        WHEN \"payoutReceivedAt\" IS NOT NULL THEN 'FINISHED_SUCCESS'::purchase_status_enum\n        WHEN \"payoutFailedAt\" IS NOT NULL THEN 'PAYOUT_FAILED'::purchase_status_enum\n        WHEN \"payoutStartedAt\" IS NOT NULL THEN 'PAYOUT_STARTED'::purchase_status_enum\n        WHEN \"approvedAt\" IS NOT NULL THEN 'APPROVED'::purchase_status_enum\n        WHEN \"pausedAt\" IS NOT NULL THEN 'PAUSED'::purchase_status_enum\n        WHEN \"deliveredAt\" IS NOT NULL THEN 'DELIVERED'::purchase_status_enum\n        WHEN \"shipmentDeliveredAt\" IS NOT NULL THEN 'SHIPPING_DELIVERED'::purchase_status_enum\n        WHEN \"shipmentStartedAt\" IS NOT NULL THEN 'SHIPPING_STARTED'::purchase_status_enum\n        WHEN \"shipmentDroppedOffAt\" IS NOT NULL THEN 'SHIPMENT_DROPPED_OFF'::purchase_status_enum\n        WHEN \"shipmentBookedAt\" IS NOT NULL THEN 'SHIPMENT_BOOKED'::purchase_status_enum\n        WHEN \"paymentAcceptedAt\" IS NOT NULL THEN 'PAYMENT_ACCEPTED'::purchase_status_enum\n        WHEN \"paymentSentAt\" IS NOT NULL THEN 'PAYMENT_SENT'::purchase_status_enum\n        ELSE 'CLAIMED'::purchase_status_enum\n      END\n    ",
      ],
    );

    //Category tree view
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'category_tree', 'public'],
    );
    await queryRunner.query(`DROP VIEW "category_tree"`);
    await queryRunner.query(`CREATE RECURSIVE VIEW category_tree (id, "ancestorIds") AS (
      SELECT id, '{}'::uuid[]
      FROM category 
      WHERE "parentId" IS NULL
    UNION ALL
      SELECT c.id, t."ancestorIds" || c."parentId"
      FROM category c, category_tree t
      WHERE c."parentId" = t.id
  )
`);
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      ['public', 'VIEW', 'category_tree', 'SELECT * from "category_tree"'],
    );

    //Typeorm wants to change the names of the CONSTRAINTS
    await queryRunner.query(
      `ALTER TABLE "file" DROP CONSTRAINT "FK_5cd168fb06c2e35b3a67d2aea26"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" DROP CONSTRAINT "FK_edbc9e9632307c1d5053b42d3fc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" DROP CONSTRAINT "FK_516f1cf15166fd07b732b4b6ab0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" DROP CONSTRAINT "FK_1117b4fcb3cd4abb4383e1c2743"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" DROP CONSTRAINT "FK_dc252738f70366595ac88f5a98f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" DROP CONSTRAINT "FK_2f8adca6682f8238c64d767c9d3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" DROP CONSTRAINT "FK_a7c1548c6150e7408af91ea8d5f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" DROP CONSTRAINT "FK_5d0020681bf0619840045f25c27"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" DROP CONSTRAINT "FK_70f3fd21152b586eb4ceae61c43"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" DROP CONSTRAINT "FK_68e5815290fd0e71e36093eb14c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" DROP CONSTRAINT "FK_6f8f0c36428d7d3419bb813c6fd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" DROP CONSTRAINT "FK_c0ab99d9dfc61172871277b52f6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" DROP CONSTRAINT "FK_f4da40532b0102d51beb220f16a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" DROP CONSTRAINT "FK_bbf3741715e8823e91e6ea26ca9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" DROP CONSTRAINT "FK_1cf56b10b23971cfd07e4fc6126"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_2eb5ce4324613b4b457c364f4a2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_0dce9bc93c2d2c399982d04bef1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_4ad08184e74db0e63cdf106a031"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_79a3ae0442388a2418ec67a3120"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_6bbe63d2fe75e7f0ba1710351d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_result" DROP CONSTRAINT "FK_c1bdc5f3596da7ec2ea219a1d40"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" DROP CONSTRAINT "FK_e6358bd3df1b2874637dca92bcf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_brands_brand" DROP CONSTRAINT "FK_ec3cf4300a10c6818aab2763511"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_brands_brand" DROP CONSTRAINT "FK_870340baa27f4bfd36c6ac511b1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_liked_by_user" DROP CONSTRAINT "FK_fe960bce1f627859071dbf30cc6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_liked_by_user" DROP CONSTRAINT "FK_470df2a6d0495f48947b74432a3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shipping_prices_shipping_price" DROP CONSTRAINT "FK_a8b5fba7aa2d84a7c98b71668d7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shipping_prices_shipping_price" DROP CONSTRAINT "FK_a76e45317cf597ca607d6113bc5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_870340baa27f4bfd36c6ac511b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ec3cf4300a10c6818aab276351"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fe960bce1f627859071dbf30cc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_470df2a6d0495f48947b74432a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a76e45317cf597ca607d6113bc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a8b5fba7aa2d84a7c98b71668d"`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_9d0e2d3055d031488c451c6876" ON "category_brands_brand" ("categoryId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bbcbcfd74d7d1046174b3954dd" ON "category_brands_brand" ("brandId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9bea38c73c8e523fdb0562309e" ON "product_liked_by_user" ("productId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dd9fae339087a49b50abf7ac1e" ON "product_liked_by_user" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_502730b6ab5136554772ae5ce5" ON "product_shipping_prices_shipping_price" ("productId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2b1a44c303cf5d55d4218d8d8c" ON "product_shipping_prices_shipping_price" ("shippingPriceId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "file" ADD CONSTRAINT "FK_4a69d73d6367f2b0cde463c082d" FOREIGN KEY ("productImageId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" ADD CONSTRAINT "FK_cec26dc33b880ebe9704605e5c3" FOREIGN KEY ("productDocumentId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" ADD CONSTRAINT "FK_b2d8e683f020f61115edea206b3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ADD CONSTRAINT "FK_d5456fd7e4c4866fec8ada1fa10" FOREIGN KEY ("parentId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ADD CONSTRAINT "FK_8a12e4cb68bc526f8d8e59efb12" FOREIGN KEY ("imageId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" ADD CONSTRAINT "FK_8ff172e9b5fc03772f25ab8d6d2" FOREIGN KEY ("purchaseId") REFERENCES "purchase"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" ADD CONSTRAINT "FK_34413365b39e3bf5bea866569b4" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" ADD CONSTRAINT "FK_2bbe7b10857bd93ca651699037b" FOREIGN KEY ("revieweeId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" ADD CONSTRAINT "FK_9af3a556aa0f166dd771a1e6c46" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" ADD CONSTRAINT "FK_6bc4d92ea5571b15834bf5d51ca" FOREIGN KEY ("buyerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_bc096b4e18b1f9508197cd98066" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_71fb36906595c602056d936fc13" FOREIGN KEY ("receiverId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_9d91cdd8a0ee3dd7798d4aaee1c" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD CONSTRAINT "FK_7c4b0d3b77eaf26f8b4da879e63" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD CONSTRAINT "FK_4b7165ae84ca4c12d5699d33c34" FOREIGN KEY ("projectPictureId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_ff0c0301a95e517153df97f6812" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_d5cac481d22dacaf4d53f900a3f" FOREIGN KEY ("sellerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_bb7d3d9dc1fae40293795ae39d6" FOREIGN KEY ("brandId") REFERENCES "brand"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_ddb019b1a0244697911f4e6e118" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_8e913e288156c133999341156ad" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_result" ADD CONSTRAINT "FK_9a2e7c30ef8d0f39575454b0fa1" FOREIGN KEY ("searcherId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD CONSTRAINT "FK_01cd2b829e0263917bf570cb672" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_brands_brand" ADD CONSTRAINT "FK_9d0e2d3055d031488c451c68766" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_brands_brand" ADD CONSTRAINT "FK_bbcbcfd74d7d1046174b3954ddf" FOREIGN KEY ("brandId") REFERENCES "brand"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_liked_by_user" ADD CONSTRAINT "FK_9bea38c73c8e523fdb0562309e7" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_liked_by_user" ADD CONSTRAINT "FK_dd9fae339087a49b50abf7ac1e0" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shipping_prices_shipping_price" ADD CONSTRAINT "FK_502730b6ab5136554772ae5ce58" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shipping_prices_shipping_price" ADD CONSTRAINT "FK_2b1a44c303cf5d55d4218d8d8c8" FOREIGN KEY ("shippingPriceId") REFERENCES "shipping_price"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const dbName = process.env.DB_NAME;

    //First fix CONSTRAINTS
    await queryRunner.query(
      `ALTER TABLE "product_shipping_prices_shipping_price" DROP CONSTRAINT "FK_2b1a44c303cf5d55d4218d8d8c8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shipping_prices_shipping_price" DROP CONSTRAINT "FK_502730b6ab5136554772ae5ce58"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_liked_by_user" DROP CONSTRAINT "FK_dd9fae339087a49b50abf7ac1e0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_liked_by_user" DROP CONSTRAINT "FK_9bea38c73c8e523fdb0562309e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_brands_brand" DROP CONSTRAINT "FK_bbcbcfd74d7d1046174b3954ddf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_brands_brand" DROP CONSTRAINT "FK_9d0e2d3055d031488c451c68766"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" DROP CONSTRAINT "FK_01cd2b829e0263917bf570cb672"`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_result" DROP CONSTRAINT "FK_9a2e7c30ef8d0f39575454b0fa1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_8e913e288156c133999341156ad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_ddb019b1a0244697911f4e6e118"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_bb7d3d9dc1fae40293795ae39d6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_d5cac481d22dacaf4d53f900a3f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" DROP CONSTRAINT "FK_ff0c0301a95e517153df97f6812"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" DROP CONSTRAINT "FK_4b7165ae84ca4c12d5699d33c34"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" DROP CONSTRAINT "FK_7c4b0d3b77eaf26f8b4da879e63"`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" DROP CONSTRAINT "FK_9d91cdd8a0ee3dd7798d4aaee1c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" DROP CONSTRAINT "FK_71fb36906595c602056d936fc13"`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" DROP CONSTRAINT "FK_bc096b4e18b1f9508197cd98066"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" DROP CONSTRAINT "FK_6bc4d92ea5571b15834bf5d51ca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" DROP CONSTRAINT "FK_9af3a556aa0f166dd771a1e6c46"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" DROP CONSTRAINT "FK_2bbe7b10857bd93ca651699037b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" DROP CONSTRAINT "FK_34413365b39e3bf5bea866569b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" DROP CONSTRAINT "FK_8ff172e9b5fc03772f25ab8d6d2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" DROP CONSTRAINT "FK_8a12e4cb68bc526f8d8e59efb12"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" DROP CONSTRAINT "FK_d5456fd7e4c4866fec8ada1fa10"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" DROP CONSTRAINT "FK_b2d8e683f020f61115edea206b3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" DROP CONSTRAINT "FK_cec26dc33b880ebe9704605e5c3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" DROP CONSTRAINT "FK_4a69d73d6367f2b0cde463c082d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2b1a44c303cf5d55d4218d8d8c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_502730b6ab5136554772ae5ce5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dd9fae339087a49b50abf7ac1e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9bea38c73c8e523fdb0562309e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bbcbcfd74d7d1046174b3954dd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9d0e2d3055d031488c451c6876"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a8b5fba7aa2d84a7c98b71668d" ON "product_shipping_prices_shipping_price" ("shippingPriceId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a76e45317cf597ca607d6113bc" ON "product_shipping_prices_shipping_price" ("productId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_470df2a6d0495f48947b74432a" ON "product_liked_by_user" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fe960bce1f627859071dbf30cc" ON "product_liked_by_user" ("productId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ec3cf4300a10c6818aab276351" ON "category_brands_brand" ("brandId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_870340baa27f4bfd36c6ac511b" ON "category_brands_brand" ("categoryId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shipping_prices_shipping_price" ADD CONSTRAINT "FK_a76e45317cf597ca607d6113bc5" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shipping_prices_shipping_price" ADD CONSTRAINT "FK_a8b5fba7aa2d84a7c98b71668d7" FOREIGN KEY ("shippingPriceId") REFERENCES "shipping_price"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_liked_by_user" ADD CONSTRAINT "FK_470df2a6d0495f48947b74432a3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_liked_by_user" ADD CONSTRAINT "FK_fe960bce1f627859071dbf30cc6" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_brands_brand" ADD CONSTRAINT "FK_870340baa27f4bfd36c6ac511b1" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_brands_brand" ADD CONSTRAINT "FK_ec3cf4300a10c6818aab2763511" FOREIGN KEY ("brandId") REFERENCES "brand"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD CONSTRAINT "FK_e6358bd3df1b2874637dca92bcf" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_result" ADD CONSTRAINT "FK_c1bdc5f3596da7ec2ea219a1d40" FOREIGN KEY ("searcherId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_6bbe63d2fe75e7f0ba1710351d4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_79a3ae0442388a2418ec67a3120" FOREIGN KEY ("sellerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_4ad08184e74db0e63cdf106a031" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_0dce9bc93c2d2c399982d04bef1" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" ADD CONSTRAINT "FK_2eb5ce4324613b4b457c364f4a2" FOREIGN KEY ("brandId") REFERENCES "brand"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD CONSTRAINT "FK_1cf56b10b23971cfd07e4fc6126" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" ADD CONSTRAINT "FK_bbf3741715e8823e91e6ea26ca9" FOREIGN KEY ("projectPictureId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_f4da40532b0102d51beb220f16a" FOREIGN KEY ("receiverId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_c0ab99d9dfc61172871277b52f6" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_6f8f0c36428d7d3419bb813c6fd" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" ADD CONSTRAINT "FK_68e5815290fd0e71e36093eb14c" FOREIGN KEY ("buyerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" ADD CONSTRAINT "FK_70f3fd21152b586eb4ceae61c43" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" ADD CONSTRAINT "FK_5d0020681bf0619840045f25c27" FOREIGN KEY ("purchaseId") REFERENCES "purchase"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" ADD CONSTRAINT "FK_a7c1548c6150e7408af91ea8d5f" FOREIGN KEY ("revieweeId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" ADD CONSTRAINT "FK_2f8adca6682f8238c64d767c9d3" FOREIGN KEY ("reviewerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ADD CONSTRAINT "FK_dc252738f70366595ac88f5a98f" FOREIGN KEY ("imageId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ADD CONSTRAINT "FK_1117b4fcb3cd4abb4383e1c2743" FOREIGN KEY ("parentId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" ADD CONSTRAINT "FK_516f1cf15166fd07b732b4b6ab0" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" ADD CONSTRAINT "FK_edbc9e9632307c1d5053b42d3fc" FOREIGN KEY ("productImageId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" ADD CONSTRAINT "FK_5cd168fb06c2e35b3a67d2aea26" FOREIGN KEY ("productDocumentId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "shipping_price" RENAME COLUMN "maxWeight" TO "max_weight"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_liked_by_user" RENAME COLUMN "userId" TO "user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_liked_by_user" RENAME COLUMN "productId" TO "product_id"`,
    );

    await queryRunner.query(
      `ALTER TABLE "category_brands_brand" RENAME COLUMN "brandId" TO "brand_id"`,
    );

    await queryRunner.query(
      `ALTER TABLE "category_brands_brand" RENAME COLUMN "categoryId" TO "category_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" RENAME COLUMN "createdAt" TO "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" RENAME COLUMN "userId" TO "user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "notifyOnSale" TO "notify_on_sale"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "notifyOnBuy" TO "notify_on_buy"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "notifyOnMessage" TO "notify_on_message"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "organizationApprovedAt" TO "organization_approved_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shipping_prices_shipping_price" RENAME COLUMN "productId" TO "product_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_shipping_prices_shipping_price" RENAME COLUMN "shippingPriceId" TO "shipping_price_id"`,
    );

    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "organizationNumber" TO "organization_number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "selectedPayoutMethod" TO "selected_payout_method"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "payoutAccountPlusGiroId" TO "payout_account_plus_giro_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "payoutAccountBankGiroId" TO "payout_account_bank_giro_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "payoutAccountRixId" TO "payout_account_rix_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "payoutAccountSwishId" TO "payout_account_swish_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "rockerUserId" TO "rocker_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "resetPasswordToken" TO "reset_password_token"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "emailVerifiedAt" TO "email_verified_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "verifyEmailToken" TO "verify_email_token"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "phoneNumber" TO "phone_number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "postCode" TO "post_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "addressLocation" TO "address_location"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "deletedAt" TO "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "createdAt" TO "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_result" RENAME COLUMN "searcherId" TO "searcher_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_result" RENAME COLUMN "updatedAt" TO "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_result" RENAME COLUMN "createdAt" TO "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_result" RENAME COLUMN "deletedAt" TO "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "search_result" RENAME COLUMN "searchString" TO "search_string"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_token" RENAME COLUMN "userId" TO "user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_token" RENAME COLUMN "expiresAt" TO "expires_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "projectId" TO "project_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "deliveryPrice" TO "delivery_price"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "deliveryRadius" TO "delivery_radius"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "deliveryEnabled" TO "delivery_enabled"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "pickupEnabled" TO "pickup_enabled"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "brandId" TO "brand_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "secondaryUnit" TO "secondary_unit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "secondaryQuantity" TO "secondary_quantity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "primaryUnit" TO "primary_unit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "primaryQuantity" TO "primary_quantity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "isGiveaway" TO "is_giveaway"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "hiddenReason" TO "hidden_reason"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "addressLocation" TO "address_location"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "sellerId" TO "seller_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "categoryId" TO "category_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "deletedAt" TO "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "updatedAt" TO "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product" RENAME COLUMN "createdAt" TO "created_at"`,
    );

    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`,
      ['GENERATED_COLUMN', 'textSearch', dbName, 'public', 'product'],
    );
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "textSearch"`);
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`,
      [dbName, 'public', 'product', 'GENERATED_COLUMN', 'text_search', ''],
    );
    await queryRunner.query(`ALTER TABLE "product" ADD "text_search" tsvector`);

    await queryRunner.query(
      `ALTER TABLE "project" RENAME COLUMN "projectPictureId" TO "project_picture_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" RENAME COLUMN "userId" TO "user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" RENAME COLUMN "addressLocation" TO "address_location"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" RENAME COLUMN "contactPhone" TO "contact_phone"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" RENAME COLUMN "contactEmail" TO "contact_email"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" RENAME COLUMN "contactName" TO "contact_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project" RENAME COLUMN "createdAt" TO "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" RENAME COLUMN "productId" TO "product_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" RENAME COLUMN "receiverId" TO "receiver_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" RENAME COLUMN "senderId" TO "sender_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" RENAME COLUMN "createdAt" TO "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "refundId" TO "refund_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "payoutFailedAt" TO "payout_failed_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "pausedAt" TO "paused_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "failedAt" TO "failed_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "payoutReceivedAt" TO "payout_received_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "payoutStartedAt" TO "payout_started_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "approvedAt" TO "approved_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "deliveredAt" TO "delivered_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "shipmentStartedAt" TO "shipment_started_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "shipmentDeliveredAt" TO "shipment_delivered_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "shipmentDroppedOffAt" TO "shipment_dropped_off_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "shipmentBookedAt" TO "shipment_booked_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "paymentAcceptedAt" TO "payment_accepted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "paymentSentAt" TO "payment_sent_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "rockerPayoutId" TO "rocker_payout_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "rockerOfferId" TO "rocker_offer_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "rockerPaymentId" TO "rocker_payment_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "buyerId" TO "buyer_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "productId" TO "product_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "purchase" RENAME COLUMN "createdAt" TO "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" RENAME COLUMN "revieweeId" TO "reviewee_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" RENAME COLUMN "reviewerId" TO "reviewer_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" RENAME COLUMN "purchaseId" TO "purchase_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review" RENAME COLUMN "createdAt" TO "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" RENAME COLUMN "secondaryQuantityUnit" TO "secondary_quantity_unit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" RENAME COLUMN "primaryQuantityUnit" TO "primary_quantity_unit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" RENAME COLUMN "imageId" TO "image_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" RENAME COLUMN "inSeason" TO "in_season"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" RENAME COLUMN "inSelection" TO "in_selection"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" RENAME COLUMN "parentId" TO "parent_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" RENAME COLUMN "orderIndex" TO "order_index"`,
    );
    await queryRunner.query(
      `ALTER TABLE "brand" RENAME COLUMN "updatedAt" TO "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "brand" RENAME COLUMN "createdAt" TO "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" RENAME COLUMN "userId" TO "user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" RENAME COLUMN "productDocumentId" TO "product_document_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" RENAME COLUMN "productImageId" TO "product_image_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" RENAME COLUMN "createdAt" TO "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "file" RENAME COLUMN "mimeType" TO "mime_type"`,
    );

    //Payout method
    await queryRunner.query(
      `ALTER TYPE "public"."user_selectedpayoutmethod_enum" RENAME TO "user_selected_payout_method_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_selected_payout_method_enum" AS ENUM('SWISH', 'TRUSTLY', 'RIX', 'BANKGIRO', 'PLUGIRO')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "selected_payout_method" TYPE "public"."user_selected_payout_method_enum" USING "selected_payout_method"::"text"::"public"."user_selected_payout_method_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_selected_payout_method_enum_old"`,
    );

    //Purchase status
    await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "status"`);
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`,
      ['GENERATED_COLUMN', 'status', dbName, 'public', 'purchase'],
    );
    await queryRunner.query(`ALTER TABLE "purchase" ADD "status" "public"."purchase_status_enum" GENERATED ALWAYS AS (
      CASE
        WHEN "failed_at" IS NOT NULL THEN 'FINISHED_FAILED'::purchase_status_enum
        WHEN "payout_received_at" IS NOT NULL THEN 'FINISHED_SUCCESS'::purchase_status_enum
        WHEN "payout_failed_at" IS NOT NULL THEN 'PAYOUT_FAILED'::purchase_status_enum
        WHEN "payout_started_at" IS NOT NULL THEN 'PAYOUT_STARTED'::purchase_status_enum
        WHEN "approved_at" IS NOT NULL THEN 'APPROVED'::purchase_status_enum
        WHEN "paused_at" IS NOT NULL THEN 'PAUSED'::purchase_status_enum
        WHEN "delivered_at" IS NOT NULL THEN 'DELIVERED'::purchase_status_enum
        WHEN "shipment_delivered_at" IS NOT NULL THEN 'SHIPPING_DELIVERED'::purchase_status_enum
        WHEN "shipment_started_at" IS NOT NULL THEN 'SHIPPING_STARTED'::purchase_status_enum
        WHEN "shipment_dropped_off_at" IS NOT NULL THEN 'SHIPMENT_DROPPED_OFF'::purchase_status_enum
        WHEN "shipment_booked_at" IS NOT NULL THEN 'SHIPMENT_BOOKED'::purchase_status_enum
        WHEN "payment_accepted_at" IS NOT NULL THEN 'PAYMENT_ACCEPTED'::purchase_status_enum
        WHEN "payment_sent_at" IS NOT NULL THEN 'PAYMENT_SENT'::purchase_status_enum
        ELSE 'CLAIMED'::purchase_status_enum
      END
    ) STORED NOT NULL`);
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        dbName,
        'public',
        'purchase',
        'GENERATED_COLUMN',
        'status',
        "\n      CASE\n        WHEN \"failed_at\" IS NOT NULL THEN 'FINISHED_FAILED'::purchase_status_enum\n        WHEN \"payout_received_at\" IS NOT NULL THEN 'FINISHED_SUCCESS'::purchase_status_enum\n        WHEN \"payout_failed_at\" IS NOT NULL THEN 'PAYOUT_FAILED'::purchase_status_enum\n        WHEN \"payout_started_at\" IS NOT NULL THEN 'PAYOUT_STARTED'::purchase_status_enum\n        WHEN \"approved_at\" IS NOT NULL THEN 'APPROVED'::purchase_status_enum\n        WHEN \"paused_at\" IS NOT NULL THEN 'PAUSED'::purchase_status_enum\n        WHEN \"delivered_at\" IS NOT NULL THEN 'DELIVERED'::purchase_status_enum\n        WHEN \"shipmentDeliveredAt\" IS NOT NULL THEN 'SHIPPING_DELIVERED'::purchase_status_enum\n        WHEN \"shipment_delivered_at\" IS NOT NULL THEN 'SHIPPING_DELIVERED'::purchase_status_enum\n        WHEN \"shipment_started_at\" IS NOT NULL THEN 'SHIPPING_STARTED'::purchase_status_enum\n        WHEN \"shipment_dropped_off_at\" IS NOT NULL THEN 'SHIPMENT_DROPPED_OFF'::purchase_status_enum\n        WHEN \"shipment_booked_at\" IS NOT NULL THEN 'SHIPMENT_BOOKED'::purchase_status_enum\n        WHEN \"payment_accepted_at\" IS NOT NULL THEN 'PAYMENT_ACCEPTED'::purchase_status_enum\n        WHEN \"payment_sent_at\" IS NOT NULL THEN 'PAYMENT_SENT'::purchase_status_enum\n        ELSE 'CLAIMED'::purchase_status_enum\n      END\n    ",
      ],
    );

    //Category tree view
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['VIEW', 'category_tree', 'public'],
    );
    await queryRunner.query(`DROP VIEW "category_tree"`);
    await queryRunner.query(`CREATE RECURSIVE VIEW category_tree (id, ancestor_ids) AS (
          SELECT id, '{}'::uuid[]
          FROM category 
          WHERE parent_id IS NULL
        UNION ALL
          SELECT c.id, t.ancestor_ids || c.parent_id
          FROM category c, category_tree t
          WHERE c.parent_id = t.id
      )
    `);
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      ['public', 'VIEW', 'category_tree', 'SELECT * from "category_tree"'],
    );
  }
}
