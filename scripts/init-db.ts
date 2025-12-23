import fs from 'fs';
import path from 'path';
import { initDatabaseConnection, query } from '../src/config/db.js';

const initDb = async () => {
  try {
    await initDatabaseConnection();
    console.log('Database connected successfully');

    const schemaPath = path.join(process.cwd(), 'sql', 'db.schema');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await query(statement);
          console.log('Executed statement successfully');
        } catch (error: any) {
          console.warn('Statement failed (might be normal):', error.message);
        }
      }
    }

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

initDb();