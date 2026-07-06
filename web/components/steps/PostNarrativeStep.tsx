'use client'

import { useState } from 'react'
import { updateParticipantStatus, updateSession, getSession } from '@/lib/session'
import { nextStep } from '@/lib/steps'
import { Participant } from '@/types/database'
import StepWrapper from '@/components/StepWrapper'

interface Props {
  participant: Participant
  pid: string
  onAdvance: () => void
}

export default function PostNarrativeStep({ participant, onAdvance }: Props) {
  const [narrative, setNarrative] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const wordCount = narrative.trim().split(/\s+/).filter(Boolean).length

  const handleSubmit = async () => {
    if (!narrative.trim() || wordCount > 350) return
    setSubmitting(true)
    await updateSession(participant.id, { t2_narrative: narrative })
    await updateParticipantStatus(participant.pid, nextStep('post_narrative'))
    onAdvance()
  }

  return (
    <StepWrapper>
      <p className="text-stone-400 text-sm leading-relaxed">
        &ldquo;Ah!&rdquo; the gatekeeper says. &ldquo;You&apos;re just in time. I&apos;ve been thinking
        about your story all night, and just where to put it. Shall we?&rdquo;
      </p>
      <p className="text-stone-200 text-sm leading-relaxed">
        He&apos;s ready to go, standing beside the gate with a rotary tool in hand.
        But on seeing your wide-eyed look, he pauses. &ldquo;Unless… the story&apos;s
        changed, hasn&apos;t it?&rdquo;
      </p>
      <p className="text-stone-200 text-sm leading-relaxed">
        You nod. &ldquo;Thought so,&rdquo; he says. &ldquo;Things always look different in the
        morning around here. Go on, then.&rdquo;
      </p>

      <p className="text-stone-500 text-xs leading-relaxed">
        Tell your story again — up to 300 words. You may draw on anything you saw
        through the windows, but the words are entirely yours.
      </p>

      <textarea
        value={narrative}
        onChange={(e) => setNarrative(e.target.value)}
        placeholder="Your story, retold…"
        rows={10}
        className="w-full bg-stone-900 border border-stone-700 rounded px-4 py-3 text-stone-200 text-sm placeholder-stone-600 focus:outline-none focus:border-stone-500 resize-none leading-relaxed"
      />

      <div className="flex justify-between items-center">
        <span className={`text-xs ${wordCount > 300 ? 'text-amber-600' : 'text-stone-600'}`}>
          {wordCount} / 300 words
        </span>
        <button
          onClick={handleSubmit}
          disabled={!narrative.trim() || wordCount > 350 || submitting}
          className="px-6 py-2 text-sm font-medium rounded border border-stone-700 text-stone-300 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? '...' : 'Hand it over'}
        </button>
      </div>
    </StepWrapper>
  )
}
