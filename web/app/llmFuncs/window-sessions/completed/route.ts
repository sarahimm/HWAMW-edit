import { db } from '@/database/configureDatabase'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const participantId = searchParams.get('participantId')
  const type = searchParams.get('type') ?? 'windows' // 'windows' | 'passages'

  if (!participantId) {
    return NextResponse.json({ error: 'Missing participantId' }, { status: 400 })
  }

  if (type !== 'windows' && type !== 'passages') {
    return NextResponse.json(
      { error: "Invalid type parameter. Must be 'windows' or 'passages'" },
      { status: 400 }
    )
  }

  try {
    if (type === 'passages') {
      const rows = db
        .prepare(
          `SELECT llm_passages FROM window_sessions
           WHERE participant_id = ? AND status = ?`
        )
        .all(participantId, 'complete') as { llm_passages: string }[]

      const passages = rows.map((r) => (JSON.parse(r.llm_passages) as { content: string; corrections: unknown[]; section: number }[]).map((p) => p.content).join('\n'))
      return NextResponse.json({ passages })
    } else {
      const rows = db
        .prepare(
          `SELECT window_id FROM window_sessions
           WHERE participant_id = ? AND status = ?`
        )
        .all(participantId, 'complete') as { window_id: string }[]

      return NextResponse.json({ windows: rows.map((r) => r.window_id) })
    }
  } catch (err) {
    console.error('Failed to load completed windows:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
