-- =====================================================================
-- Migration viết tay: những thứ schema.prisma không biểu diễn được.
-- Prisma không theo dõi CHECK / trigger / view / partial index,
-- nên đừng xóa file này khi chạy lại migrate.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. CHECK CONSTRAINT (các validation rule trong tài liệu đặc tả)
-- ---------------------------------------------------------------------

-- users / addresses
ALTER TABLE "users"
  ADD CONSTRAINT "chk_users_fullname" CHECK (char_length("fullname") BETWEEN 2 AND 50),
  ADD CONSTRAINT "chk_users_email"    CHECK ("email" ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT "chk_users_phone"    CHECK ("phone" ~ '^0(3|5|7|8|9)[0-9]{8}$'),
  ADD CONSTRAINT "chk_users_login_method" CHECK ("password_hash" IS NOT NULL OR "google_id" IS NOT NULL);

ALTER TABLE "addresses"
  ADD CONSTRAINT "chk_addresses_phone" CHECK ("phone" ~ '^0(3|5|7|8|9)[0-9]{8}$');

-- OTP: sai tối đa 5 lần
ALTER TABLE "otp_codes"
  ADD CONSTRAINT "chk_otp_failed_attempts" CHECK ("failed_attempts" BETWEEN 0 AND 5);

-- wallets
ALTER TABLE "wallets"
  ADD CONSTRAINT "chk_wallet_balance" CHECK ("balance" >= 0);
ALTER TABLE "wallet_transactions"
  ADD CONSTRAINT "chk_wallet_tx_amount" CHECK ("amount" <> 0);

-- products / images
ALTER TABLE "products"
  ADD CONSTRAINT "chk_products_name"        CHECK (char_length("name") BETWEEN 10 AND 120),
  ADD CONSTRAINT "chk_products_description" CHECK (char_length("description") >= 50);

ALTER TABLE "product_images"
  ADD CONSTRAINT "chk_product_images_sort" CHECK ("sort_order" BETWEEN 0 AND 8);   -- tối đa 9 ảnh

-- product_variants (giá, tồn kho, cân nặng)
ALTER TABLE "product_variants"
  ADD CONSTRAINT "chk_variant_price"      CHECK ("price" BETWEEN 1000 AND 1000000000),
  ADD CONSTRAINT "chk_variant_sale_price" CHECK ("sale_price" IS NULL OR ("sale_price" >= 1000 AND "sale_price" < "price")),
  ADD CONSTRAINT "chk_variant_stock"      CHECK ("stock_quantity" >= 0),
  ADD CONSTRAINT "chk_variant_reserved"   CHECK ("reserved_stock" >= 0 AND "reserved_stock" <= "stock_quantity"),
  ADD CONSTRAINT "chk_variant_weight"     CHECK ("weight_gram" > 0 AND "weight_gram" <= 50000),
  ADD CONSTRAINT "chk_variant_max_order"  CHECK ("max_per_order" > 0);

-- vouchers
ALTER TABLE "vouchers"
  ADD CONSTRAINT "chk_voucher_value"   CHECK ("discount_value" > 0),
  ADD CONSTRAINT "chk_voucher_percent" CHECK ("discount_type" <> 'PERCENT' OR "discount_value" <= 100),
  ADD CONSTRAINT "chk_voucher_max"     CHECK ("max_discount" IS NULL OR "max_discount" > 0),
  ADD CONSTRAINT "chk_voucher_min"     CHECK ("min_order_value" >= 0),
  ADD CONSTRAINT "chk_voucher_dates"   CHECK ("end_at" > "start_at"),
  ADD CONSTRAINT "chk_voucher_limit"   CHECK ("usage_limit" > 0 AND "used_count" >= 0 AND "used_count" <= "usage_limit");

-- cart: số lượng 1..20 mỗi lần
ALTER TABLE "cart_items"
  ADD CONSTRAINT "chk_cart_quantity" CHECK ("quantity" BETWEEN 1 AND 20);

-- orders: tổng tiền = tiền hàng + ship - khuyến mãi
ALTER TABLE "orders"
  ADD CONSTRAINT "chk_orders_amounts" CHECK (
        "items_total" >= 0 AND "shipping_total" >= 0 AND "discount_total" >= 0 AND "grand_total" >= 0),
  ADD CONSTRAINT "chk_orders_grand_total" CHECK ("grand_total" = "items_total" + "shipping_total" - "discount_total");

ALTER TABLE "sub_orders"
  ADD CONSTRAINT "chk_sub_orders_amounts" CHECK (
        "items_total" >= 0 AND "shipping_fee" >= 0 AND "discount_amount" >= 0 AND "total_amount" >= 0),
  ADD CONSTRAINT "chk_sub_orders_total" CHECK ("total_amount" = "items_total" + "shipping_fee" - "discount_amount");

ALTER TABLE "order_items"
  ADD CONSTRAINT "chk_order_items_price" CHECK ("unit_price" >= 0),
  ADD CONSTRAINT "chk_order_items_qty"   CHECK ("quantity" > 0);

ALTER TABLE "payments"
  ADD CONSTRAINT "chk_payments_amount" CHECK ("amount" >= 0);

ALTER TABLE "stock_reservations"
  ADD CONSTRAINT "chk_reservation_qty" CHECK ("quantity" > 0);

ALTER TABLE "return_requests"
  ADD CONSTRAINT "chk_return_refund" CHECK ("refund_amount" IS NULL OR "refund_amount" >= 0);

ALTER TABLE "reviews"
  ADD CONSTRAINT "chk_reviews_rating" CHECK ("rating" BETWEEN 1 AND 5);

-- ---------------------------------------------------------------------
-- 2. PARTIAL INDEX / INDEX BIỂU THỨC
-- ---------------------------------------------------------------------

-- Mỗi user chỉ có 1 địa chỉ mặc định
CREATE UNIQUE INDEX "uq_addresses_default" ON "addresses"("user_id") WHERE "is_default";

-- Mỗi sản phẩm chỉ có 1 ảnh bìa
CREATE UNIQUE INDEX "uq_product_cover" ON "product_images"("product_id") WHERE "is_cover";

-- Tìm kiếm sản phẩm theo tên (UC-07)
CREATE INDEX "idx_products_name_fts" ON "products" USING GIN (to_tsvector('simple', "name"));

-- Phục vụ job tự chuyển DELIVERED -> COMPLETED sau 7 ngày
CREATE INDEX "idx_sub_orders_delivered" ON "sub_orders"("delivered_at") WHERE "status" = 'DELIVERED';

-- Phục vụ job quét giao dịch / giữ chỗ quá hạn 15 phút
CREATE INDEX "idx_payments_expiring"     ON "payments"("expires_at")           WHERE "status" = 'PENDING';
CREATE INDEX "idx_reservations_expiring" ON "stock_reservations"("expires_at") WHERE "status" = 'RESERVED';

-- ---------------------------------------------------------------------
-- 3. TRIGGER
-- ---------------------------------------------------------------------

-- 3.1 Tự cập nhật updated_at (kể cả khi sửa bằng SQL thuần, không qua Prisma)
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW."updated_at" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'users','addresses','shops','wallets','products','product_variants',
        'carts','cart_items','sub_orders','payments','return_requests'
    ] LOOP
        EXECUTE format(
            'CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
            'trg_' || t || '_updated_at', t);
    END LOOP;
END $$;

-- 3.2 Sản phẩm chỉ được gán vào danh mục lá đang hoạt động (UC-06)
CREATE OR REPLACE FUNCTION check_leaf_category() RETURNS trigger AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM "categories"
        WHERE "id" = NEW."category_id" AND "is_leaf" AND "is_active"
    ) THEN
        RAISE EXCEPTION 'Danh mục % không phải danh mục lá đang hoạt động', NEW."category_id";
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_products_leaf_category"
BEFORE INSERT OR UPDATE OF "category_id" ON "products"
FOR EACH ROW EXECUTE FUNCTION check_leaf_category();

-- ---------------------------------------------------------------------
-- 4. VIEW
-- ---------------------------------------------------------------------

-- Tồn kho khả dụng của từng biến thể
CREATE VIEW "v_variant_stock" AS
SELECT
    "id" AS "variant_id",
    "product_id",
    "shop_id",
    "stock_quantity",
    "reserved_stock",
    ("stock_quantity" - "reserved_stock") AS "available_stock"
FROM "product_variants";

-- Giỏ hàng kèm cờ is_disabled (hết hàng / bị ẩn), có shop_id để nhóm theo cửa hàng
CREATE VIEW "v_cart_items_detail" AS
SELECT
    ci."id"          AS "cart_item_id",
    c."user_id",
    p."shop_id",
    ci."variant_id",
    p."name"         AS "product_name",
    v."variant_name",
    COALESCE(v."sale_price", v."price") AS "unit_price",
    ci."quantity",
    ci."is_selected",
    (v."stock_quantity" - v."reserved_stock") AS "available_stock",
    (p."status" <> 'ACTIVE'
        OR v."status" <> 'ACTIVE'
        OR (v."stock_quantity" - v."reserved_stock") < ci."quantity") AS "is_disabled"
FROM "cart_items" ci
JOIN "carts" c            ON c."id" = ci."cart_id"
JOIN "product_variants" v ON v."id" = ci."variant_id"
JOIN "products" p         ON p."id" = v."product_id";
