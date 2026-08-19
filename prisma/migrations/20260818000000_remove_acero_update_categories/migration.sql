-- Migrate products with ACERO_QUIRURGICO to ENCHAPADO first
UPDATE "Product" SET "material" = 'ENCHAPADO' WHERE "material" = 'ACERO_QUIRURGICO';

-- Now safely swap the enum type
CREATE TYPE "Material_new" AS ENUM ('ORO_18K', 'ORO_BAJO', 'ENCHAPADO', 'PLATA_925');

ALTER TABLE "Product"
  ALTER COLUMN "material" TYPE "Material_new"
  USING "material"::text::"Material_new";

DROP TYPE "Material";
ALTER TYPE "Material_new" RENAME TO "Material";
