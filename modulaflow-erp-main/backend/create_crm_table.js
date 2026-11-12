require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Connecting to PostgreSQL database...');
  console.log('📍 DATABASE_URL:', process.env.DATABASE_URL);

  // 1. CREATE TABLE "crm"
  console.log('📦 Creating table "crm" in PostgreSQL...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "crm" (
      "id" TEXT NOT NULL,
      "source" TEXT NOT NULL DEFAULT 'Meta Ads',
      "businessName" TEXT,
      "category" TEXT,
      "genderType" TEXT,
      "primaryPhone" TEXT,
      "secondaryEmail" TEXT,
      "website" TEXT,
      "address" TEXT,
      "locality" TEXT,
      "mapsUrl" TEXT,
      "sourceNote" TEXT,
      "sourceUrl" TEXT,
      "status" TEXT NOT NULL DEFAULT 'New',
      "notes" TEXT,
      "lastEmailedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "crm_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "crm_source_idx" ON "crm"("source");');
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "crm_locality_idx" ON "crm"("locality");');
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "crm_status_idx" ON "crm"("status");');
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "crm_primaryPhone_idx" ON "crm"("primaryPhone");');

  console.log('✅ Table "crm" and indexes created successfully.');

  // 2. Read all 84 records from src/data/crm-data.ts
  const crmDataPath = path.resolve(__dirname, '../src/data/crm-data.ts');
  console.log('📖 Reading CRM data from:', crmDataPath);
  const fileContent = fs.readFileSync(crmDataPath, 'utf8');

  // Parse INITIAL_CRM_RECORDS from typescript file
  const arrayStartMatch = fileContent.indexOf('export const INITIAL_CRM_RECORDS: CRMLead[] = [');
  if (arrayStartMatch === -1) {
    throw new Error('Could not find INITIAL_CRM_RECORDS in crm-data.ts');
  }

  const rawArrayCode = fileContent.slice(arrayStartMatch + 'export const INITIAL_CRM_RECORDS: CRMLead[] ='.length).trim();
  // Evaluate the JS array safely
  const cleanedJsCode = rawArrayCode.replace(/;\s*$/, '');
  const records = eval(cleanedJsCode);

  console.log(`📊 Found ${records.length} CRM records to insert into "crm" table.`);

  // 3. Insert / Upsert all 84 records
  let insertedCount = 0;
  for (const item of records) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "crm" (
        "id", "source", "businessName", "category", "genderType", 
        "primaryPhone", "secondaryEmail", "website", "address", "locality", 
        "mapsUrl", "sourceNote", "sourceUrl", "status", "notes", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP)
      ON CONFLICT ("id") DO UPDATE SET
        "source" = EXCLUDED."source",
        "businessName" = EXCLUDED."businessName",
        "category" = EXCLUDED."category",
        "genderType" = EXCLUDED."genderType",
        "primaryPhone" = EXCLUDED."primaryPhone",
        "secondaryEmail" = EXCLUDED."secondaryEmail",
        "website" = EXCLUDED."website",
        "address" = EXCLUDED."address",
        "locality" = EXCLUDED."locality",
        "mapsUrl" = EXCLUDED."mapsUrl",
        "sourceNote" = EXCLUDED."sourceNote",
        "sourceUrl" = EXCLUDED."sourceUrl",
        "status" = EXCLUDED."status",
        "notes" = EXCLUDED."notes",
        "updatedAt" = CURRENT_TIMESTAMP`,
      item.id,
      item.source || 'Meta',
      item.businessName || null,
      item.category || null,
      item.genderType || null,
      item.primaryPhone || null,
      item.secondaryEmail || null,
      item.website || null,
      item.address || null,
      item.locality || null,
      item.mapsUrl || null,
      item.sourceNote || null,
      item.sourceUrl || null,
      item.status || 'New',
      item.notes || null,
      item.createdAt ? new Date(item.createdAt) : new Date()
    );
    insertedCount++;
  }

  console.log(`🎉 Successfully saved all ${insertedCount} records in "crm" table!`);

  // Verify count from DB
  const countResult = await prisma.$queryRawUnsafe('SELECT COUNT(*)::int as count FROM "crm";');
  console.log(`🔍 Current total rows in "crm" table:`, countResult[0].count);

  // 4. Generate standalone SQL file for user inspection / pgAdmin execution
  const sqlStatements = [];
  sqlStatements.push('-- ========================================================');
  sqlStatements.push('-- PostgreSQL Script: Create Table "crm" & Seed All 84 Leads');
  sqlStatements.push('-- Database: my_database.backup | Schema: public');
  sqlStatements.push('-- ========================================================\n');
  sqlStatements.push(`CREATE TABLE IF NOT EXISTS "crm" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'Meta Ads',
    "businessName" TEXT,
    "category" TEXT,
    "genderType" TEXT,
    "primaryPhone" TEXT,
    "secondaryEmail" TEXT,
    "website" TEXT,
    "address" TEXT,
    "locality" TEXT,
    "mapsUrl" TEXT,
    "sourceNote" TEXT,
    "sourceUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'New',
    "notes" TEXT,
    "lastEmailedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "crm_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "crm_source_idx" ON "crm"("source");
CREATE INDEX IF NOT EXISTS "crm_locality_idx" ON "crm"("locality");
CREATE INDEX IF NOT EXISTS "crm_status_idx" ON "crm"("status");
CREATE INDEX IF NOT EXISTS "crm_primaryPhone_idx" ON "crm"("primaryPhone");\n`);

  function escapeSql(val) {
    if (val === null || val === undefined || val === '') return 'NULL';
    return "'" + String(val).replace(/'/g, "''") + "'";
  }

  for (const item of records) {
    const created = item.createdAt ? `'${new Date(item.createdAt).toISOString()}'` : 'CURRENT_TIMESTAMP';
    sqlStatements.push(
      `INSERT INTO "crm" ("id", "source", "businessName", "category", "genderType", "primaryPhone", "secondaryEmail", "website", "address", "locality", "mapsUrl", "sourceNote", "sourceUrl", "status", "notes", "createdAt", "updatedAt") ` +
      `VALUES (${escapeSql(item.id)}, ${escapeSql(item.source)}, ${escapeSql(item.businessName)}, ${escapeSql(item.category)}, ${escapeSql(item.genderType)}, ${escapeSql(item.primaryPhone)}, ${escapeSql(item.secondaryEmail)}, ${escapeSql(item.website)}, ${escapeSql(item.address)}, ${escapeSql(item.locality)}, ${escapeSql(item.mapsUrl)}, ${escapeSql(item.sourceNote)}, ${escapeSql(item.sourceUrl)}, ${escapeSql(item.status || 'New')}, ${escapeSql(item.notes)}, ${created}, CURRENT_TIMESTAMP) ` +
      `ON CONFLICT ("id") DO UPDATE SET ` +
      `"source" = EXCLUDED."source", "businessName" = EXCLUDED."businessName", "category" = EXCLUDED."category", "genderType" = EXCLUDED."genderType", "primaryPhone" = EXCLUDED."primaryPhone", "secondaryEmail" = EXCLUDED."secondaryEmail", "website" = EXCLUDED."website", "address" = EXCLUDED."address", "locality" = EXCLUDED."locality", "mapsUrl" = EXCLUDED."mapsUrl", "sourceNote" = EXCLUDED."sourceNote", "sourceUrl" = EXCLUDED."sourceUrl", "status" = EXCLUDED."status", "notes" = EXCLUDED."notes", "updatedAt" = CURRENT_TIMESTAMP;`
    );
  }

  const sqlOutPath = path.resolve(__dirname, 'crm_table_and_data.sql');
  fs.writeFileSync(sqlOutPath, sqlStatements.join('\n'), 'utf8');
  console.log(`💾 Standalone SQL script generated at: ${sqlOutPath}`);
}

main()
  .catch((err) => {
    console.error('❌ Error executing script:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
