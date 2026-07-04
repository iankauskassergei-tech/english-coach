import { neon } from '@neondatabase/serverless';
import Database from 'better-sqlite3';
import path from 'path';

const isVercel = Boolean(process.env.VERCEL);

// Если есть URL базы, используем его, иначе null
const sql = isVercel && process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export function getDb() {
  if (isVercel && sql) {
    return {
      prepare: (query: string) => ({
        get: async (params?: any) => {
          const result = await sql(query, params ? [params] : []);
          return result[0];
        },
        all: async (params?: any) => await sql(query, params ? [params] : []),
      }),
    };
  } else {
    // Твой локальный SQLite
    return new Database(path.join(process.cwd(), 'data', 'app.db'));
  }
}