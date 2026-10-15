import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
async function main() {
    console.log('🌱 Đang dọn dẹp dữ liệu cũ (nếu có)...');

    // Xóa sạch dữ liệu cũ theo đúng thứ tự phụ thuộc khóa ngoại
    await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE 
      "reviews", "return_requests", "voucher_usages", "stock_reservations",
      "payments", "order_status_history", "order_items", "sub_orders", "orders",
      "cart_items", "carts", "vouchers", "product_variants", "product_images",
      "products", "brands", "categories", "wallet_transactions", "wallets",
      "shops", "refresh_tokens", "otp_codes", "addresses", "users"
    CASCADE;
  `);

    console.log('📦 Đang nạp dữ liệu test...');

    // 1. Tạo Người dùng (Thỏa mãn ràng buộc length, phone regex 03/05/07/08/09, email)
    await prisma.$executeRawUnsafe(`
    INSERT INTO "users" ("id", "fullname", "email", "phone", "password_hash", "role", "status") VALUES
    (1, 'Nguyễn Văn Admin', 'admin@example.com', '0901234567', '$2a$12$eImiTXuWVxfM37uY4JANjO5E/Q081J8.2.1.1.1.1.1', 'ADMIN', 'ACTIVE'),
    (2, 'Trần Thị Bán', 'seller@example.com', '0912345678', '$2a$12$eImiTXuWVxfM37uY4JANjO5E/Q081J8.2.1.1.1.1.1', 'SELLER', 'ACTIVE'),
    (3, 'Lê Văn Mua', 'buyer@example.com', '0987654321', '$2a$12$eImiTXuWVxfM37uY4JANjO5E/Q081J8.2.1.1.1.1.1', 'BUYER', 'ACTIVE');
  `);
    await prisma.$executeRawUnsafe(`SELECT setval('users_id_seq', (SELECT MAX(id) FROM "users"));`);

    // 2. Tạo Địa chỉ người mua (Thỏa mãn regex phone & uq_addresses_default)
    await prisma.$executeRawUnsafe(`
    INSERT INTO "addresses" ("id", "user_id", "receiver_name", "phone", "province", "district", "ward", "detail", "is_default") VALUES
    (1, 3, 'Lê Văn Mua', '0987654321', 'TP. Hồ Chí Minh', 'Quận 1', 'Phường Bến Nghé', '123 Đường Lê Lợi', true);
  `);
    await prisma.$executeRawUnsafe(`SELECT setval('addresses_id_seq', (SELECT MAX(id) FROM "addresses"));`);

    // 3. Tạo Cửa hàng (Shop)
    await prisma.$executeRawUnsafe(`
    INSERT INTO "shops" ("id", "owner_id", "name", "description", "logo_url", "is_mall", "status") VALUES
    (1, 2, 'Shop Công Nghệ Chính Hãng', 'Chuyên cung cấp sản phẩm công nghệ chất lượng cao', 'https://via.placeholder.com/150', true, 'ACTIVE');
  `);
    await prisma.$executeRawUnsafe(`SELECT setval('shops_id_seq', (SELECT MAX(id) FROM "shops"));`);

    // 4. Tạo Ví cửa hàng
    await prisma.$executeRawUnsafe(`
    INSERT INTO "wallets" ("id", "shop_id", "balance") VALUES
    (1, 1, 10000000);
  `);
    await prisma.$executeRawUnsafe(`SELECT setval('wallets_id_seq', (SELECT MAX(id) FROM "wallets"));`);

    // 5. Tạo Danh mục (Phải có danh mục lá is_leaf = true & is_active = true để thỏa trigger trg_products_leaf_category)
    await prisma.$executeRawUnsafe(`
    INSERT INTO "categories" ("id", "parent_id", "name", "is_leaf", "is_active") VALUES
    (1, NULL, 'Điện thoại & Thiết bị', false, true),
    (2, 1, 'Điện thoại Smartphone', true, true);
  `);
    await prisma.$executeRawUnsafe(`SELECT setval('categories_id_seq', (SELECT MAX(id) FROM "categories"));`);

    // 6. Tạo Thương hiệu
    await prisma.$executeRawUnsafe(`
    INSERT INTO "brands" ("id", "name", "logo_url") VALUES
    (1, 'Apple', 'https://via.placeholder.com/100');
  `);
    await prisma.$executeRawUnsafe(`SELECT setval('brands_id_seq', (SELECT MAX(id) FROM "brands"));`);

    // 7. Tạo Sản phẩm (Name >= 10 ký tự, Description >= 50 ký tự)
    await prisma.$executeRawUnsafe(`
    INSERT INTO "products" ("id", "shop_id", "category_id", "brand_id", "name", "description", "status") VALUES
    (1, 1, 2, 1, 'Điện thoại iPhone 15 Pro Max 256GB - Chính hãng VN/A', 'Màn hình Super Retina XDR 6.7 inch với công nghệ ProMotion. Thiết kế titan bền nhẹ. Chip A17 Pro cho hiệu năng đỉnh cao vượt trội.', 'ACTIVE');
  `);
    await prisma.$executeRawUnsafe(`SELECT setval('products_id_seq', (SELECT MAX(id) FROM "products"));`);

    // 8. Tạo Ảnh sản phẩm (is_cover = true, sort_order <= 8)
    await prisma.$executeRawUnsafe(`
    INSERT INTO "product_images" ("id", "product_id", "url", "is_cover", "sort_order") VALUES
    (1, 1, 'https://via.placeholder.com/500', true, 0);
  `);
    await prisma.$executeRawUnsafe(`SELECT setval('product_images_id_seq', (SELECT MAX(id) FROM "product_images"));`);

    // 9. Tạo Biến thể sản phẩm (Variant) (Thỏa mãn price, sale_price < price, stock, weight, max_order)
    await prisma.$executeRawUnsafe(`
    INSERT INTO "product_variants" ("id", "product_id", "shop_id", "sku_code", "variant_name", "price", "sale_price", "stock_quantity", "reserved_stock", "weight_gram", "max_per_order", "status") VALUES
    (1, 1, 1, 'IP15PM-256-BLK', 'Màu Đen Titan - 256GB', 30000000, 28990000, 100, 0, 500, 5, 'ACTIVE');
  `);
    await prisma.$executeRawUnsafe(`SELECT setval('product_variants_id_seq', (SELECT MAX(id) FROM "product_variants"));`);

    // 10. Tạo Voucher
    await prisma.$executeRawUnsafe(`
    INSERT INTO "vouchers" ("id", "shop_id", "code", "discount_type", "discount_value", "max_discount", "min_order_value", "start_at", "end_at", "usage_limit", "used_count", "is_active") VALUES
    (1, 1, 'KM10K', 'FIXED_AMOUNT', 10000, NULL, 100000, NOW(), NOW() + INTERVAL '30 days', 100, 0, true);
  `);
    await prisma.$executeRawUnsafe(`SELECT setval('vouchers_id_seq', (SELECT MAX(id) FROM "vouchers"));`);

    // 11. Tạo Giỏ hàng & Sản phẩm trong giỏ hàng
    await prisma.$executeRawUnsafe(`
    INSERT INTO "carts" ("id", "user_id") VALUES (1, 3);
  `);
    await prisma.$executeRawUnsafe(`SELECT setval('carts_id_seq', (SELECT MAX(id) FROM "carts"));`);

    await prisma.$executeRawUnsafe(`
    INSERT INTO "cart_items" ("id", "cart_id", "variant_id", "quantity", "is_selected") VALUES
    (1, 1, 1, 1, true);
  `);
    await prisma.$executeRawUnsafe(`SELECT setval('cart_items_id_seq', (SELECT MAX(id) FROM "cart_items"));`);

    // 12. Tạo Đơn hàng Mẫu (Thỏa mãn grand_total = items_total + shipping_total - discount_total)
    await prisma.$executeRawUnsafe(`
    INSERT INTO "orders" ("id", "order_code", "buyer_id", "payment_method", "receiver_name", "receiver_phone", "ship_province", "ship_district", "ship_ward", "ship_detail", "items_total", "shipping_total", "discount_total", "grand_total") VALUES
    (1, 'ORD202610150001', 3, 'COD', 'Lê Văn Mua', '0987654321', 'TP. Hồ Chí Minh', 'Quận 1', 'Phường Bến Nghé', '123 Đường Lê Lợi', 28990000, 30000, 10000, 29010000);
  `);
    await prisma.$executeRawUnsafe(`SELECT setval('orders_id_seq', (SELECT MAX(id) FROM "orders"));`);

    await prisma.$executeRawUnsafe(`
    INSERT INTO "sub_orders" ("id", "order_id", "shop_id", "shop_voucher_id", "status", "items_total", "shipping_fee", "discount_amount", "total_amount") VALUES
    (1, 1, 1, 1, 'PENDING_CONFIRMATION', 28990000, 30000, 10000, 29010000);
  `);
    await prisma.$executeRawUnsafe(`SELECT setval('sub_orders_id_seq', (SELECT MAX(id) FROM "sub_orders"));`);

    await prisma.$executeRawUnsafe(`
    INSERT INTO "order_items" ("id", "sub_order_id", "variant_id", "product_name", "variant_name", "sku_code", "unit_price", "quantity") VALUES
    (1, 1, 1, 'Điện thoại iPhone 15 Pro Max 256GB - Chính hãng VN/A', 'Màu Đen Titan - 256GB', 'IP15PM-256-BLK', 28990000, 1);
  `);
    await prisma.$executeRawUnsafe(`SELECT setval('order_items_id_seq', (SELECT MAX(id) FROM "order_items"));`);

    console.log('✅ Nạp dữ liệu test thành công!');
}

main()
    .catch((e) => {
        console.error('❌ Lỗi khi nạp dữ liệu test:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });