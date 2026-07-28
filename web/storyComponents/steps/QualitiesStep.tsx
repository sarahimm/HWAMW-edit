'use client'

import { useState } from 'react'
import { updateParticipantStatus, updateSession, getSession } from '@/lib/session'
import { nextStep } from '@/lib/steps'
import { Participant } from '@/types/database'
import StepWrapper from '@/storyComponents/StepWrapper'

interface Props {
  participant: Participant
  pid: string
  onAdvance: () => void
}

export default function QualitiesStep({ participant, onAdvance }: Props) {
  const [values, setValues] = useState<[string, string, string]>(['', '', ''])
  const [submitting, setSubmitting] = useState(false)
  const placeholders = ["Quality 1", "Quality 2", "Quality 3"]
  const setField = (index: number, text: string) => {
    setValues((prev) => {
      const next: [string, string, string] = [...prev] as [string, string, string]
      next[index] = text
      return next
    })
  }

  const qualities = values.map((v) => v.trim()).filter((v) => v.length > 0)
  const canSubmit = qualities.length > 0

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    await updateSession(participant.id, { qualities })
    await updateParticipantStatus(participant.pid, nextStep('qualities'))
    onAdvance()
  }

  return (
    <StepWrapper>
      <p className="text-stone-200 text-sm leading-relaxed">
        The trail turns, growing as convoluted as your thoughts. With a sigh,
        you make your way back up to the hardened dirt path. You&apos;re allowed to be here, probably.
      </p>
      <p className="text-stone-200 text-sm leading-relaxed">
        Sure, there was that sign at the head of the path that said &ldquo;No
        Trespassers,&rdquo; but that could hardly be referring to you. You&apos;re many
        things…
      </p>

      <div className="space-y-2">
        <p className="text-sm text-stone-500 italic">How would you describe yourself? Think of qualities like creative, ambitious, loyal, eccentric, stubborn, introspective, bubbly, or shy. </p>
        {values.map((value, index) => (
          <input
            key={index}
            autoFocus={index === 0}
            type="text"
            value={value}
            onChange={(e) => setField(index, e.target.value)}
            placeholder={placeholders[index]}
            maxLength={40}
            className="w-full px-4 py-3 rounded border border-stone-600 bg-stone-900 text-stone-200 text-sm placeholder:text-stone-500 focus:outline-none focus:border-stone-500 placeholder:italic transition-colors"
          />
        ))}
      </div>

      <p className="text-stone-600 text-xs">Fill in 1–3.</p>

      <p className="text-stone-200 text-sm leading-relaxed">
        …but you're not a trespasser.
      </p>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="w-full py-3 text-sm font-medium rounded border border-stone-700 text-stone-300 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? '...' : 'Continue'}
      </button>
    </StepWrapper>
  )
}
