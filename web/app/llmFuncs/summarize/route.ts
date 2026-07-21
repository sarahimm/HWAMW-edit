import { NextRequest, NextResponse } from 'next/server'
import { getCompletions } from '@/lib/completions'

export async function POST(req: NextRequest) {
  const { narrative } = await req.json()

  const summary = await getCompletions([
    {
      role: 'system',
      content: `A traveller has just told you their story. You are going to repeat it back to them to make sure you've understood it correctly.

Produce two things:

1. A plot summary of 2–5 sentences, spoken directly to the traveller in second person ("you"). Be specific to the actual details of their story--capture all key events, names, and details briefly, factually, but not unkindly.

2. A list of the other key people in the story — not the traveller, only others. Name them as the traveller would: "your mother", "your brother", "an old friend", "your ex", "James". Maximum 5. No abstract labels like "Author" or "Narrator". If there are no other people, return an empty array.

Respond only in this exact JSON format: { "summary": "...", "characters": ["your mother", "your brother"] }`,
    },
    { role: 'user', content: narrative },
  ])

  try {
    const json = JSON.parse(summary.trim())
    return NextResponse.json(json)
  } catch {
    return NextResponse.json({ summary, characters: [] })
  }
}
