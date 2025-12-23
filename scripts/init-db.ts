import { readFileSync } from 'fs';
import { join } from 'path';
import prisma from '../src/config/prisma.js';

/**
 * Initialize the database using the raw SQL schema in /sql/db.schema.
 *
 * Notes:
 * - The project uses Prisma as the primary DB client; this script runs raw
 *   SQL statements using Prisma's $executeRawUnsafe for initial schema
 *   creation. Use with caution and only against development/test databases.
 */
const initDb = async () => {
  try {
    console.log('Initializing database using Prisma...');

    const schemaPath = join(process.cwd(), 'sql', 'db.schema');
    const schema = readFileSync(schemaPath, 'utf-8');

    // Split the schema into individual statements. Keep semicolons that are
    // part of statements inside GO blocks or other T-SQL constructs may be
    // a problem; this simple splitter works for standard CREATE TABLE / INSERT
    const statements = schema
      .split(';')
      .map((stmt: string) => stmt.trim())
      .filter((stmt: string) => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (!statement) continue;
      try {
        // Use $executeRawUnsafe because the schema file contains DDL.
        // This is intended for local/dev use only.
        await prisma.$executeRawUnsafe(statement);
        console.log('Executed statement successfully');
      } catch (error: unknown) {
        console.warn('Statement failed (might be normal):', error instanceof Error ? error.message : String(error));
      }
    }

    console.log('Database initialization completed');
    process.exit(0);
  } catch (error: unknown) {
    console.error('Database initialization failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};

initDb();