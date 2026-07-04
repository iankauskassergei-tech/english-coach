import Database from 'better-sqlite3';
import path from 'path';
import { initSchema } from './schema';

const isVercel = Boolean(process.env.VERCEL);

let db: Database.Database | undefined;

function createDatabase(): Database.Database {
  const database = isVercel
    ? new Database(':memory:')
    : new Database(path.join(process.cwd(), 'data', 'app.db'));

  database.pragma('journal_mode = WAL');
  database.pragma('foreign_keys = ON');

  if (isVercel) {
    initSchema(database);
  }

  return database;
}

export function isVercelDbStub(): boolean {
  return isVercel;
}

export function getDb(): Database.Database {
  if (!db) {
    db = createDatabase();
  }
  return db;
}
