'use client'

import { useState } from 'react'
import { updateParticipantStatus, updateSession, getSession } from '@/lib/session'
import { nextStep } from '@/lib/steps'
import { Participant } from '@/types/database'
import StepWrapper from '@/components/StepWrapper'

const TROUBLES = [
  'My love life',
  'My family',
  'My career',
  'My creative pursuits',
  'My community',
  "You wouldn't understand",
]

interface Props {
  participant: Participant
  pid: string
  onAdvance: () => void
}

export default function TroublesStep({ participant, onAdvance }: Props) {
  const [selected, setSelected] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const toggle = (item: string) => {
    setSelected((prev) =>
      prev.includes(item)
        ? prev.filter((x) => x !== item)
        : prev.length < 3
        ? [...prev, item]
        : prev
    )
  }

  const handleSubmit = async () => {
    if (selected.length === 0) return
    setSubmitting(true)
    await updateSession(participant.id, { trouble: selected })
    await updateParticipantStatus(participant.pid, nextStep('troubles'))
    onAdvance()
  }

  return (
    <StepWrapper>
      <p className="text-stone-200 text-sm leading-relaxed">
        You&apos;re out walking late tonight. Much later than you usually stay up.
        It&apos;s been a long day. For that matter, a long year.
      </p>
      <p className="text-stone-200 text-sm leading-relaxed">
        The feeling—it&apos;s tiredness, but not the kind that stillness can solve.
        Something inside of you feels stuck. You&apos;re exhausted, but you keep
        walking, like your feet moving on might make your thoughts follow after.
      </p>

      <div className="w-full h-px bg-stone-800" />

      <p className="text-stone-400 text-sm leading-relaxed">
        Your mind is restless. Like a dog that can&apos;t seem to make itself
        comfortable in one spot, constantly unfurling and repositioning. You list
        the woes swirling around in your mind:
      </p>

      <div className="space-y-2">
        {TROUBLES.map((trouble) => (
          <button
            key={trouble}
            onClick={() => toggle(trouble)}
            className={`w-full text-left px-4 py-3 rounded border text-sm transition-colors ${
              selected.includes(trouble)
                ? 'border-stone-500 bg-stone-800 text-stone-200'
                : 'border-stone-800 text-stone-200 hover:border-stone-600'
            }`}
          >
            {trouble}
          </button>
        ))}
      </div>

      <p className="text-stone-600 text-xs">Choose 1–3.</p>

      <button
        onClick={handleSubmit}
        disabled={selected.length === 0 || submitting}
        className="w-full py-3 text-sm font-medium rounded border border-stone-700 text-stone-300 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? '...' : 'Continue'}
      </button>
    </StepWrapper>
  )
}
