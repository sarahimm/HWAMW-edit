'use client'

import { useState } from 'react'
import { updateParticipantStatus, updateSession, getSession } from '@/lib/session'
import { nextStep } from '@/lib/steps'
import { Participant } from '@/types/database'
import StepWrapper from '@/storyComponents/StepWrapper'

const MOTIVATIONS = [
  'To lead a stable, happy life',
  'To achieve my full potential',
  'To find someone who loves me',
  'To have a better relationship with my family',
  'To make enough money to live the life I want',
  'To be rich, powerful, or famous—ideally all three',
  "Something you'd never find on a list",
]

interface Props {
  participant: Participant
  pid: string
  onAdvance: () => void
}

export default function MotivationsStep({ participant, onAdvance }: Props) {
  const [selected, setSelected] = useState<string[]>([])
  const [elaboration, setElaboration] = useState('')
  const [showElaboration, setShowElaboration] = useState(false)
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

  const handleNext = () => setShowElaboration(true)

  const handleSubmit = async () => {
    if (!elaboration.trim()) return
    setSubmitting(true)
    await updateSession(participant.id, {
      motivations: selected,
      motivation_description: elaboration,
    })
    await updateParticipantStatus(participant.pid, nextStep('motivations'))
    onAdvance()
  }

  if (showElaboration) {
    return (
      <StepWrapper>
        <p className="text-stone-400 text-sm leading-relaxed">
          &ldquo;Well, maybe it&apos;s not quite that simple… There&apos;s a bit more to it?&rdquo;
        </p>
        <textarea
          value={elaboration}
          onChange={(e) => setElaboration(e.target.value)}
          placeholder="Say more…"
          rows={4}
          className="w-full bg-stone-900 border border-stone-700 rounded px-4 py-3 text-stone-200 text-sm placeholder-stone-600 focus:outline-none focus:border-stone-500 resize-none leading-relaxed"
        />
        <button
          onClick={handleSubmit}
          disabled={!elaboration.trim() || submitting}
          className="w-full py-3 text-sm font-medium rounded border border-stone-700 text-stone-300 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? '...' : 'Continue'}
        </button>
      </StepWrapper>
    )
  }

  return (
    <StepWrapper>
      <p className="text-stone-400 text-sm leading-relaxed">
        &ldquo;And one more thing I don&apos;t quite get… What exactly are you hoping to
        get out of all this? What is it you want?&rdquo;
      </p>
      <p className="text-stone-400 text-sm leading-relaxed">
        A night of sleep and an end to this conversation, mostly. But you put on a
        polite smile and give a more genuine answer.
      </p>

      <div className="space-y-2">
        {MOTIVATIONS.map((m) => (
          <button
            key={m}
            onClick={() => toggle(m)}
            className={`w-full text-left px-4 py-3 rounded border text-sm transition-colors ${
              selected.includes(m)
                ? 'border-stone-500 bg-stone-800 text-stone-100'
                : 'border-stone-800 text-stone-400 hover:border-stone-600 hover:text-stone-300'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <p className="text-stone-600 text-xs">Choose 1–3.</p>

      <button
        onClick={handleNext}
        disabled={selected.length === 0}
        className="w-full py-3 text-sm font-medium rounded border border-stone-700 text-stone-300 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Continue
      </button>
    </StepWrapper>
  )
}
