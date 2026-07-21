import { db } from '@/database/configureDatabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { participantId, windowName, passages } = await req.json()

    const result = db
      .prepare(
        `UPDATE window_sessions
         SET status = ?, llm_passages = ?, completed_at = ?
         WHERE id = (
           SELECT id FROM window_sessions
           WHERE participant_id = ? AND window_id = ?
           LIMIT 1
         )`
      )
      .run(
        'complete',
        JSON.stringify(passages),   // TEXT column — JSON
        new Date().toISOString(),
        participantId,
        windowName
      )

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'No matching window session found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Failed to complete window session:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
