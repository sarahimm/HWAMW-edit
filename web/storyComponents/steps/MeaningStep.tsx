'use client'

import { useState, useEffect } from 'react'
import { updateParticipantStatus, updateSession, getSession } from '@/lib/session'
import { nextStep } from '@/lib/steps'
import { Participant, ParticipantStatus } from '@/types/database'
import StepWrapper from '@/storyComponents/StepWrapper'

interface Props {
  participant: Participant
  pid: string
  timing: 't1' | 't2'
  onAdvance: () => void
}

const POSITIONS = [1, 2, 3, 4, 5, 6, 7]

export default function MeaningStep({ participant, timing, onAdvance }: Props) {
  const [score, setScore] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [existingName, setExistingName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (timing === 't2') {
      getSession(participant.id).then((s) => {
        if (s?.participant_name) setExistingName(s.participant_name)
      })
    }
  }, [participant.id, timing])

  const handleSubmit = async () => {
    if (score === null) return
    if (timing === 't1' && !name.trim()) return
    setSubmitting(true)

    const updates: Record<string, unknown> = timing === 't1'
      ? { t1_meaning_score: score, participant_name: name }
      : { t2_meaning_score: score }

    await updateSession(participant.id, updates)

    const currentStatus: ParticipantStatus = timing === 't1' ? 't1_meaning' : 't2_meaning'
    await updateParticipantStatus(participant.pid, nextStep(currentStatus))
    onAdvance()
  }

  return (
    <StepWrapper>
      <p className="text-stone-400 text-sm leading-relaxed">
        {timing === 't1' ? (
          <>
            The gatekeeper nods, like it&apos;s what he expected. &ldquo;And all this
            stuff you&apos;re going through—is it getting you there?&rdquo; He points to
            the stone gate post, where dozens of names have been engraved along
            one vertical line. &ldquo;I keep the most meaningful stories at the
            top—the real life-changing, tear-jerking, lesson-learned ones. At the
            bottom are the ones no one can make sense of yet. Where does yours
            belong?&rdquo;
          </>
        ) : (
          <>
            &ldquo;Ah!&rdquo; the gatekeeper says. &ldquo;You&apos;re just in time. Shall we? Though—
            things always look different in the morning around here. Has the story
            changed?&rdquo; He picks up the rotary tool. &ldquo;Where does it belong now?&rdquo;
          </>
        )}
      </p>

      {/* Visual post scale */}
      <div className="flex flex-col items-center gap-1 py-4">
        <p className="text-stone-600 text-xs text-center mb-3">
          A story that changed everything — the kind you&apos;d tell on your deathbed
        </p>
        {POSITIONS.map((pos) => (
          <button
            key={pos}
            onClick={() => setScore(pos)}
            className={`w-3 h-3 rounded-full border transition-all ${
              score === pos
                ? 'bg-stone-300 border-stone-300 scale-150'
                : 'bg-transparent border-stone-600 hover:border-stone-400'
            }`}
          />
        ))}
        <p className="text-stone-600 text-xs text-center mt-3">
          A story still waiting to make sense
        </p>
      </div>

      {timing === 't1' && (
        <div className="space-y-2">
          <p className="text-stone-400 text-sm">
            &ldquo;And what name should I carve there?&rdquo;
          </p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What would you like to be called?"
            className="w-full bg-stone-900 border border-stone-700 rounded px-4 py-3 text-stone-200 text-sm placeholder-stone-600 focus:outline-none focus:border-stone-500"
          />
        </div>
      )}

      {timing === 't2' && existingName && (
        <p className="text-stone-500 text-sm text-center">
          Pleasure to meet you again, {existingName}.
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={score === null || (timing === 't1' && !name.trim()) || submitting}
        className="w-full py-3 text-sm font-medium rounded border border-stone-700 text-stone-300 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? '...' : timing === 't1' ? 'Step inside' : 'Update the engraving'}
      </button>
    </StepWrapper>
  )
}
