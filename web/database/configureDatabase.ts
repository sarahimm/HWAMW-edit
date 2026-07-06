// database/configureDatabase.ts
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import os from 'os'

function resolveDbPath() {
  const configured = process.env.DATABASE_PATH
  if (configured) {
    // Use as-is if absolute; otherwise resolve against cwd
    return path.isAbsolute(configured)
      ? configured
      : path.join(process.cwd(), configured)
  }
  // Default: a folder in the user's home dir, outside the project
  return path.join(os.homedir(), '.study-data', 'study.db')
}

function createDb() {
  const dbPath = resolveDbPath()

  // Ensure the parent directory exists (first run)
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })

  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  return db
}

const globalForDb = globalThis as unknown as {
  db: Database.Database | undefined
}

export const db = globalForDb.db ?? createDb()

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db
}
