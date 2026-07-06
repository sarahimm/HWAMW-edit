import { db } from '@/database/configureDatabase'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const participantId = searchParams.get('participantId')

  if (!participantId) {
    return NextResponse.json({ error: 'Missing participantId' }, { status: 400 })
  }

  try {
    const rows = db
      .prepare(
        `SELECT window_name FROM window_sessions
         WHERE participant_id = ? AND status = ?`
      )
      .all(participantId, 'complete') as { window_name: string }[]

    return NextResponse.json({ windows: rows.map((r) => r.window_name) })
  } catch (err) {
    console.error('Failed to load completed windows:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
