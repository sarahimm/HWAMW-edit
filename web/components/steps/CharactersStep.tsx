'use client'

import { useState, useEffect, useRef } from 'react'
import { updateParticipantStatus, updateSession, getSession } from '@/lib/session'
import { nextStep } from '@/lib/steps'
import { Participant, Character } from '@/types/database'
import StepWrapper from '@/components/StepWrapper'
import LoadingDots from '@/components/LoadingDots'

interface Props {
  participant: Participant
  pid: string
  onAdvance: () => void
}

function naturalList(names: string[]): string {
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]
  return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1]
}

export default function CharactersStep({ participant, onAdvance }: Props) {
  const [plotSummary, setPlotSummary] = useState('')
  const [summaryConfirmed, setSummaryConfirmed] = useState(false)
  const [characters, setCharacters] = useState<Character[]>([])
  const [currentCharIdx, setCurrentCharIdx] = useState(0)
  const [charDescription, setCharDescription] = useState('')
  const [generating, setGenerating] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const hasGenerated = useRef(false)

  useEffect(() => {
    if (hasGenerated.current) return
    hasGenerated.current = true
    const generate = async () => {
      const session = await getSession(participant.id)
      if (!session?.t1_narrative) {
        setGenerating(false)
        return
      }
      try {
        const res = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ narrative: session.t1_narrative }),
        })
        if (res.ok) {
          const data = await res.json()
          setPlotSummary(data.summary || '')
          setCharacters(data.characters?.map((name: string) => ({ name, description: '' })) || [])
        }
      } catch {
        // Ollama unavailable — proceed with empty summary
      } finally {
        setGenerating(false)
      }
    }
    generate()
  }, [participant.id])

  const handleConfirmSummary = () => setSummaryConfirmed(true)

  const handleCharacterDescription = async () => {
    const updated = characters.map((c, i) =>
      i === currentCharIdx ? { ...c, description: charDescription } : c
    )
    setCharacters(updated)
    setCharDescription('')

    if (currentCharIdx < characters.length - 1) {
      setCurrentCharIdx(currentCharIdx + 1)
    } else {
      setSubmitting(true)
      await updateSession(participant.id, {
        plot_summary: plotSummary,
        characters: updated,
      })
      await updateParticipantStatus(participant.pid, nextStep('characters'))
      onAdvance()
    }
  }

  if (generating) {
    return (
      <StepWrapper>
        <p className="text-stone-400 text-sm leading-relaxed">
          He takes out a small piece of parchment and begins to scribble.{' '}
          <LoadingDots />
        </p>
      </StepWrapper>
    )
  }

  if (!summaryConfirmed) {
    return (
      <StepWrapper>
        <p className="text-stone-400 text-sm leading-relaxed">
          &ldquo;Now let me see if I&apos;ve got this straight.&rdquo; He hands you the parchment.
        </p>
        <p className="text-stone-200 text-sm leading-relaxed">{plotSummary}</p>
        <p className="text-stone-400 text-sm">&ldquo;Is that right?&rdquo;</p>

        <div className="flex gap-3">
          <button
            onClick={handleConfirmSummary}
            className="flex-1 py-3 text-sm rounded border border-stone-700 text-stone-300 hover:bg-stone-800 transition-colors"
          >
            That&apos;s right
          </button>
          <button
            onClick={() => setSummaryConfirmed(true)}
            className="flex-1 py-3 text-sm rounded border border-stone-800 text-stone-500 hover:border-stone-700 hover:text-stone-400 transition-colors"
          >
            Not quite
          </button>
        </div>
      </StepWrapper>
    )
  }

  const currentChar = characters[currentCharIdx]

  if (!currentChar) {
    const advance = async () => {
      await updateSession(participant.id, { plot_summary: plotSummary, characters: [] })
      await updateParticipantStatus(participant.pid, nextStep('characters'))
      onAdvance()
    }
    advance()
    return (
      <StepWrapper>
        <p className="text-stone-500 text-sm"><LoadingDots /></p>
      </StepWrapper>
    )
  }

  const charListLabel = naturalList(characters.map((c) => c.name))

  return (
    <StepWrapper>
      <p className="text-stone-400 text-sm leading-relaxed">
        &ldquo;I see. And the others in your story — that&apos;s mainly {charListLabel}.
        Help me understand: who is <span className="text-stone-200">{currentChar.name}</span>
        {currentCharIdx === 0 ? ', exactly' : ''}?&rdquo;
      </p>

      <textarea
        value={charDescription}
        onChange={(e) => setCharDescription(e.target.value)}
        placeholder={`Say a little about ${currentChar.name}…`}
        rows={3}
        className="w-full bg-stone-900 border border-stone-700 rounded px-4 py-3 text-stone-200 text-sm placeholder-stone-600 focus:outline-none focus:border-stone-500 resize-none leading-relaxed"
      />

      <button
        onClick={handleCharacterDescription}
        disabled={!charDescription.trim() || submitting}
        className="w-full py-3 text-sm font-medium rounded border border-stone-700 text-stone-300 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? '...' : currentCharIdx < characters.length - 1 ? 'Next' : 'Continue'}
      </button>
    </StepWrapper>
  )
}
