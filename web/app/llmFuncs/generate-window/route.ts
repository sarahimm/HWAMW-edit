import { NextRequest, NextResponse } from 'next/server'
import { getCompletions } from '@/lib/completions'
import { getWindowConfig, buildSystemPrompt, buildSectionPrompt } from '@/lib/windows'
import { Session } from '@/types/database'

export async function POST(req: NextRequest) {
  const { windowName, session }: { windowName: string; session: Session } = await req.json()

  const config = getWindowConfig(windowName)
  if (!config) return NextResponse.json({ error: 'Unknown window' }, { status: 400 })

  const systemPrompt = buildSystemPrompt(config, session)
  const passages = []
  const generatedSections: string[] = []

  for (let i = 0; i < config.sectionStructure.length; i++) {
    const userPrompt = buildSectionPrompt(config, i, generatedSections)
    const content = await getCompletions ([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ])
    generatedSections.push(content)
    passages.push({ section: i + 1, content, corrections: [] })
  }

  return NextResponse.json({ passages })
}
