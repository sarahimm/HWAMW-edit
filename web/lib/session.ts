'use server'

import { db } from '../database/configureDatabase'
import { Participant, ParticipantStatus, Session } from '@/types/database'

const rows: any[] = db.prepare('SELECT id FROM windows').all();
const windowIds: string[] = rows.map(row => row.id);

const SESSION_COLUMNS = new Set<string>([
  'trouble',
  'qualities',
  'quality_description',
  't1_narrative',
  'plot_summary',
  'characters',
  'motivations',
  'motivation_description',
  't1_meaning_score',
  'participant_name',
  'participant_pronouns',
  't2_narrative',
  't2_meaning_score',
])

function pickRandom<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n)
}

// Parse JSON-text columns back into objects/arrays
function hydrateParticipant(row: any): Participant {
  return {
    ...row,
    assigned_windows: JSON.parse(row.assigned_windows),
  } as Participant
}

export async function getOrCreateParticipant(pid: string): Promise<Participant> {
  const existing = db
    .prepare(`SELECT * FROM participants WHERE pid = ?`)
    .get(pid)

  if (existing) {
    return hydrateParticipant(existing)
  }


  const assignedWindows = pickRandom(windowIds, 3)

  const created = db
    .prepare(
      `INSERT INTO participants (pid, assigned_windows, status)
       VALUES (?, ?, ?)
       RETURNING *`
    )
    .get(pid, JSON.stringify(assignedWindows), 'troubles')

  if (!created) {
    throw new Error('Failed to create participant')
  }

  return hydrateParticipant(created)
}

export async function updateParticipantStatus(
  pid: string,
  status: ParticipantStatus
) {
  const result = db
    .prepare(`UPDATE participants SET status = ? WHERE pid = ?`)
    .run(status, pid)

  if (result.changes === 0) {
    throw new Error(`Participant with pid ${pid} not found`)
  }
}

export async function getSession(
  participantId: string
): Promise<Session | null> {
  const row = db
    .prepare(`SELECT * FROM sessions WHERE participant_id = ?`)
    .get(participantId)

  return (row as Session) ?? null
}

export async function ensureSession(participantId: string): Promise<Session> {
  const existing = await getSession(participantId)
  if (existing) return existing

  const created = db
    .prepare(`INSERT INTO sessions (participant_id) VALUES (?) RETURNING *`)
    .get(participantId)

  if (!created) {
    throw new Error(`Failed to create session for participant ${participantId}`)
  }
  return created as Session
}

const JSON_COLUMNS = new Set([
  'trouble',
  'qualities',
  'motivations',
  'characters',
])

export async function updateSession(
  participantId: string,
  updates: Partial<Session>
) {
  const keys = Object.keys(updates)
  if (keys.length === 0) return

  for (const key of keys) {
    if (!SESSION_COLUMNS.has(key)) {
      throw new Error(`Disallowed session column: ${key}`)
    }
  }

  const setClause = keys.map((key) => `${key} = ?`).join(', ')

  // Serialize array/JSON columns; leave scalars as-is
  const values = keys.map((key) =>
    JSON_COLUMNS.has(key)
      ? JSON.stringify((updates as any)[key])
      : (updates as any)[key]
  )

  const result = db
    .prepare(`UPDATE sessions SET ${setClause} WHERE participant_id = ?`)
    .run(...values, participantId)

  if (result.changes === 0) {
    throw new Error(`Session for participant ${participantId} not found`)
  }
}

