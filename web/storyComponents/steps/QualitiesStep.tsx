'use client'

import { useState } from 'react'
import { updateParticipantStatus, updateSession, getSession } from '@/lib/session'
import { nextStep } from '@/lib/steps'
import { Participant } from '@/types/database'
import StepWrapper from '@/storyComponents/StepWrapper'

const QUALITIES = [
  'Smart',
  'Good looking',
  'Charismatic',
  'Creative',
  'Loyal',
  'Indecisive — give me more options',
]

interface Props {
  participant: Participant
  pid: string
  onAdvance: () => void
}

export default function QualitiesStep({ participant, onAdvance }: Props) {
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
    await updateSession(participant.id, { qualities: selected })
    await updateParticipantStatus(participant.pid, nextStep('qualities'))
    onAdvance()
  }

  return (
    <StepWrapper>
      <p className="text-stone-200 text-sm leading-relaxed">
        The trail turns, growing as convoluted as your thoughts. With a sigh,
        you make your way back up to the hardened dirt path. You&apos;re allowed to
        be here, probably.
      </p>
      <p className="text-stone-200 text-sm leading-relaxed">
        Sure, there was that sign at the head of the path that said &ldquo;No
        Trespassers,&rdquo; but that could hardly be referring to you. You&apos;re many
        things…
      </p>

      <div className="space-y-2">
        {QUALITIES.map((quality) => (
          <button
            key={quality}
            onClick={() => toggle(quality)}
            className={`w-full text-left px-4 py-3 rounded border text-sm transition-colors ${
              selected.includes(quality)
                ? 'border-stone-500 bg-stone-800 text-stone-200'
                : 'border-stone-800 text-stone-200 hover:border-stone-600'
            }`}
          >
            {quality}
          </button>
        ))}
      </div>

      <p className="text-stone-600 text-xs">Choose 1–3.</p>

      <p className="text-stone-200 text-sm leading-relaxed">
        …but a trespasser isn&apos;t one of them.
      </p>

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
