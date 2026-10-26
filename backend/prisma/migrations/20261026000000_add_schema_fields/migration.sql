-- Bring the existing database schema in line with fields already defined
-- by the Prisma models. Keep category slugs nullable for legacy rows: their
-- original slug values are not available to backfill without guessing.
ALTER TABLE "categories"
  ADD COLUMN "slug" TEXT;

CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

ALTER TABLE "products"
  ADD COLUMN "slug" TEXT;

ALTER TABLE "product_variants"
  ADD COLUMN "color" TEXT,
  ADD COLUMN "size" TEXT;
