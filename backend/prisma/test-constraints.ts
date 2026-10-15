import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function runTestCase(
    testName: string,
    queryFn: () => Promise<any>,
    expectedConstraint: string
) {
    try {
        await queryFn();
        console.log(`❌ TEST FAILED [${testName}]: Dữ liệu vi phạm ĐÃ chèn thành công (Database KHÔNG chặn!)`);
    } catch (error: any) {
        const errorMsg = error.message || '';
        if (
            errorMsg.includes(expectedConstraint) ||
            errorMsg.includes('violates check constraint') ||
            errorMsg.includes('EXCEPTION')
        ) {
            console.log(`✅ TEST PASSED [${testName}]: Database đã CHẶN ĐÚNG quy tắc (${expectedConstraint})`);
        } else {
            console.log(`⚠️ TEST ERROR [${testName}]: Lỗi khác xuất hiện:`, errorMsg);
        }
    }
}

async function main() {
    console.log('🧪 BẮT ĐẦU KIỂM THỬ CÁC RÀNG BUỘC DATABASE (CHECK CONSTRAINTS & TRIGGERS)...\n');

    // 1. Test tên quá ngắn (< 2 ký tự)
    await runTestCase(
        'Users: Fullname quá ngắn (< 2 ký tự)',
        () => prisma.$executeRawUnsafe(`
      INSERT INTO "users" ("fullname", "email", "phone", "password_hash")
      VALUES ('A', 'test_shortname@example.com', '0911111111', 'hash123');
    `),
        'chk_users_fullname'
    );

    // 2. Test email sai định dạng
    await runTestCase(
        'Users: Email sai định dạng (thiếu @ và domain)',
        () => prisma.$executeRawUnsafe(`
      INSERT INTO "users" ("fullname", "email", "phone", "password_hash")
      VALUES ('Nguyễn Văn A', 'email_invalid_format', '0911111112', 'hash123');
    `),
        'chk_users_email'
    );

    // 3. Test SĐT sai đầu số Việt Nam
    await runTestCase(
        'Users: SĐT sai đầu số nhà mạng (0123...)',
        () => prisma.$executeRawUnsafe(`
      INSERT INTO "users" ("fullname", "email", "phone", "password_hash")
      VALUES ('Nguyễn Văn B', 'test_phone@example.com', '0123456789', 'hash123');
    `),
        'chk_users_phone'
    );

    // 4. Test không có cả password_hash lẫn google_id
    await runTestCase(
        'Users: Thiếu cả password_hash và google_id',
        () => prisma.$executeRawUnsafe(`
      INSERT INTO "users" ("fullname", "email", "phone")
      VALUES ('Nguyễn Văn C', 'test_nologin@example.com', '0911111113');
    `),
        'chk_users_login_method'
    );

    // 5. Test tên sản phẩm quá ngắn (< 10 ký tự)
    await runTestCase(
        'Products: Tên sản phẩm quá ngắn (< 10 ký tự)',
        () => prisma.$executeRawUnsafe(`
      INSERT INTO "products" ("shop_id", "category_id", "name", "description")
      VALUES (1, 2, 'Áo thun', 'Mô tả dài đủ điều kiện hơn 50 ký tự cho sản phẩm test...');
    `),
        'chk_products_name'
    );

    // 6. Test giá khuyến mãi lớn hơn giá gốc
    await runTestCase(
        'Product Variants: Giá sale lớn hơn giá gốc',
        () => prisma.$executeRawUnsafe(`
      INSERT INTO "product_variants" ("product_id", "shop_id", "sku_code", "price", "sale_price", "weight_gram")
      VALUES (1, 1, 'SKU-ERR-01', 100000, 150000, 200);
    `),
        'chk_variant_sale_price'
    );

    // 7. Test tính sai grand_total của đơn hàng
    await runTestCase(
        'Orders: Tính sai tổng tiền (grand_total != items + shipping - discount)',
        () => prisma.$executeRawUnsafe(`
      INSERT INTO "orders" ("order_code", "buyer_id", "payment_method", "receiver_name", "receiver_phone", "ship_province", "ship_district", "ship_ward", "ship_detail", "items_total", "shipping_total", "discount_total", "grand_total")
      VALUES ('ORD_TEST_ERR', 3, 'COD', 'Lê Văn Mua', '0987654321', 'HCM', 'Q1', 'P1', '123 Str', 100000, 20000, 10000, 999999);
    `),
        'chk_orders_grand_total'
    );

    // 8. Test đánh giá quá 5 sao
    await runTestCase(
        'Reviews: Rating = 6 (Vượt quá 5 sao)',
        () => prisma.$executeRawUnsafe(`
      INSERT INTO "reviews" ("order_item_id", "user_id", "product_id", "rating")
      VALUES (1, 3, 1, 6);
    `),
        'chk_reviews_rating'
    );

    // 9. Test Trigger: Gán sản phẩm vào danh mục cha (is_leaf = false)
    await runTestCase(
        'Triggers: Gán sản phẩm vào danh mục không phải danh mục lá (category_id = 1)',
        () => prisma.$executeRawUnsafe(`
      INSERT INTO "products" ("shop_id", "category_id", "name", "description")
      VALUES (1, 1, 'Điện thoại iPhone 15 Pro Max', 'Mô tả sản phẩm dài đầy đủ điều kiện hơn 50 ký tự mẫu test...');
    `),
        'không phải danh mục lá'
    );

    console.log('\n🏁 HOÀN TẤT KIỂM THỬ CHECK CONSTRAINTS & TRIGGERS!');
}

main()
    .catch((e) => console.error('Lỗi khi chạy test:', e))
    .finally(async () => await prisma.$disconnect());