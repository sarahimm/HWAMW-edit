// addWindows.ts
//
// Usage:
//   npx ts-node addWindows.ts ./exampleWindows.json
//   npx ts-node addWindows.ts ./exampleWindows.json ./path/to/database.db
//
// Adds or updates rows in the `windows` table from a JSON file.
// A window is matched (for update) on the combination of `writer` + `work`.

import fs from 'fs'
import path from 'path'
import Database from 'better-sqlite3'

// ---- Types -----------------------------------------------------------------

interface WindowInput {
  description: string
  writer: string
  work: string
  styleInterventions?: string[]
  structureInterventions?: string[]
}

// ---- Validation ------------------------------------------------------------

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string')
}

function validateWindow(entry: unknown, index: number): WindowInput {
  if (typeof entry !== 'object' || entry === null) {
    throw new Error(`Entry #${index} is not an object.`)
  }

  const e = entry as Record<string, unknown>

  if (typeof e.description !== 'string' || e.description.trim() === '') {
    throw new Error(`Entry #${index} is missing a valid "description".`)
  }
  if (typeof e.writer !== 'string' || e.writer.trim() === '') {
    throw new Error(`Entry #${index} is missing a valid "writer".`)
  }
  if (typeof e.work !== 'string' || e.work.trim() === '') {
    throw new Error(`Entry #${index} is missing a valid "work".`)
  }
  if (e.styleInterventions !== undefined && !isStringArray(e.styleInterventions)) {
    throw new Error(`Entry #${index} has an invalid "styleInterventions" (expected string[]).`)
  }
  if (e.structureInterventions !== undefined && !isStringArray(e.structureInterventions)) {
    throw new Error(`Entry #${index} has an invalid "structureInterventions" (expected string[]).`)
  }

  return {
    description: e.description,
    writer: e.writer,
    work: e.work,
    styleInterventions: (e.styleInterventions as string[]) ?? [],
    structureInterventions: (e.structureInterventions as string[]) ?? [],
  }
}

// ---- Main ------------------------------------------------------------------

function main() {
  const jsonPath = process.argv[2]
  const dbPath = process.argv[3] ?? path.resolve(process.cwd(), 'database.db')

  if (!jsonPath) {
    console.error('Usage: ts-node addWindows.ts <path-to-json> [path-to-db]')
    process.exit(1)
  }

  // Read + parse JSON
  const raw = fs.readFileSync(path.resolve(jsonPath), 'utf-8')
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (err) {
    console.error(`Failed to parse JSON: ${(err as Error).message}`)
    process.exit(1)
  }

  if (!Array.isArray(parsed)) {
    console.error('Expected the JSON file to contain an array of windows.')
    process.exit(1)
  }

  const windows = parsed.map((entry, i) => validateWindow(entry, i))

  // Open DB
  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  // Prepared statements.
  // We match existing rows on (writer, work) to decide update vs insert.
  const findStmt = db.prepare(
    `SELECT id FROM windows WHERE writer = ? AND work = ?`
  )

  const insertStmt = db.prepare(
    `INSERT INTO windows (description, writer, work, styleInterventions, structureInterventions)
     VALUES (@description, @writer, @work, @styleInterventions, @structureInterventions)`
  )

  const updateStmt = db.prepare(
    `UPDATE windows
        SET description = @description,
            styleInterventions = @styleInterventions,
            structureInterventions = @structureInterventions
      WHERE id = @id`
  )

  let inserted = 0
  let updated = 0

  const run = db.transaction((items: WindowInput[]) => {
    for (const w of items) {
      const row = {
        description: w.description,
        writer: w.writer,
        work: w.work,
        styleInterventions: JSON.stringify(w.styleInterventions ?? []),
        structureInterventions: JSON.stringify(w.structureInterventions ?? []),
      }

      const existing = findStmt.get(w.writer, w.work) as { id: string } | undefined

      if (existing) {
        updateStmt.run({ ...row, id: existing.id })
        updated++
      } else {
        insertStmt.run(row)
        inserted++
      }
    }
  })

  run(windows)
  db.close()

  console.log(
    `Done. Inserted ${inserted}, updated ${updated} (out of ${windows.length} entries).`
  )
}

main()
