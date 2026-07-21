import { db } from '@/database/configureDatabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { participantId, windowID, windowCategory, orderInSession } =
      await req.json()

    db.prepare(
      `INSERT INTO window_sessions
         (participant_id, window_id, order_in_session, status)
       VALUES (?, ?, ?, ?)`
    ).run(participantId, windowID, orderInSession, 'in_progress')

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Failed to create window session:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
