import { NextRequest, NextResponse } from 'next/server'
import { getCompletions } from '@/lib/completions'
import { getWindowConfig, buildSystemPrompt, buildSectionPrompt } from '@/lib/windows'
import { Session, LLMPassage } from '@/types/database'

export async function POST(req: NextRequest) {
  const {
    windowId,
    session,
    passages: previousPassages,
    feedback,
    fromSection,
  }: {
    windowId: string
    session: Session
    passages: LLMPassage[]
    feedback: string
    fromSection: number
  } = await req.json()

  const config = getWindowConfig(windowId)
  if (!config) return NextResponse.json({ error: 'Unknown window' }, { status: 400 })

  const systemPrompt = buildSystemPrompt(config, session)
  const lockedSections = previousPassages.map((p) => p.content)
  const newPassages: LLMPassage[] = []

  for (let i = fromSection; i < 3; i++) {
    const allPrior = [...lockedSections, ...newPassages.map((p) => p.content)]
    const basePrompt = buildSectionPrompt(config, i, allPrior)
    const userPrompt =
      i === fromSection
        ? `${basePrompt}\n\nNote: the participant gave this feedback on the previous version: "${feedback}". Please take it into account.`
        : basePrompt

    const content = await getCompletions([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ])

    newPassages.push({
      section: (i + 1) as 1 | 2 | 3,
      content,
      corrections: i === fromSection ? [{ feedback, revised_content: content }] : [],
    })
  }

  return NextResponse.json({ passages: newPassages })
}
