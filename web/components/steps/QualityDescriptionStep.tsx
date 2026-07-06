'use client'

import { useState } from 'react'
import { updateParticipantStatus, updateSession, getSession } from '@/lib/session'
import { nextStep } from '@/lib/steps'
import { Participant } from '@/types/database'
import StepWrapper from '@/components/StepWrapper'
import { useEffect } from 'react'

interface Props {
  participant: Participant
  pid: string
  onAdvance: () => void
}

export default function QualityDescriptionStep({ participant, onAdvance }: Props) {
  const [qualities, setQualities] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getSession(participant.id).then((s) => {
      if (s?.qualities) setQualities(s.qualities)
    })
  }, [participant.id])

  const handleSubmit = async () => {
    if (!description.trim()) return
    setSubmitting(true)
    await updateSession(participant.id, { quality_description: description })
    await updateParticipantStatus(participant.pid, nextStep('quality_description'))
    onAdvance()
  }

  const qualityList = qualities.filter(q => !q.includes('more options')).join(' and ')

  return (
    <StepWrapper>
      <p className="text-stone-200 text-sm leading-relaxed">
        You stroll down this smoother path, humming a little.{' '}
        {qualityList ? (
          <span className="text-stone-100">{qualityList}…</span>
        ) : (
          <span>That about sums it up.</span>
        )}{' '}
        That about sums it up.
      </p>
      <p className="text-stone-200 text-sm leading-relaxed">
        Other people might see it differently. But at least that&apos;s how you
        experience it. If you had to be more specific, you might say:
      </p>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="In your own words…"
        rows={4}
        className="w-full bg-stone-900 border border-stone-700 rounded px-4 py-3 text-stone-200 text-sm placeholder-stone-600 focus:outline-none focus:border-stone-500 resize-none leading-relaxed"
      />

      <button
        onClick={handleSubmit}
        disabled={!description.trim() || submitting}
        className="w-full py-3 text-sm font-medium rounded border border-stone-700 text-stone-300 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? '...' : 'Continue'}
      </button>
    </StepWrapper>
  )
}
