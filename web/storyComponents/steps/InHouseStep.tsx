'use client'

import { useState, useEffect } from 'react'
import { updateParticipantStatus, updateSession, getSession } from '@/lib/session'
import { nextStep } from '@/lib/steps'
import { Participant, LLMPassage } from '@/types/database'
import StepWrapper from '@/storyComponents/StepWrapper'
import LoadingDots from '@/storyComponents/LoadingDots'

interface Props {
  participant: Participant
  pid: string
  onAdvance: () => void
}

const WINDOW_LABELS: Record<string, { title: string; description: string }> = {
  'heros-journey':         { title: 'The Burnished Frame', description: 'A slender frame of burnished mahogany, gleaming bloodred in the candlelight, casting a shadow longer than it ought.' },
  'redemption-arc':        { title: 'The Tarnished Frame', description: 'A heavy frame, once gilded, its gold worn away at the edges to reveal something darker beneath.' },
  'conversations-with-god':{ title: 'The Stone Frame', description: 'A frame cut directly from the wall—no wood, no metal. Just the stone itself, ancient and indifferent.' },
  'bildungsroman':         { title: 'The Pine Frame', description: 'A simple, unvarnished pine frame. It smells of cat hair, peat, and cigarettes.' },
  'epiphany':              { title: 'The Silver Frame', description: 'A narrow silver frame, almost too bright to look at directly, like light off still water.' },
  'focalization':          { title: 'The Golden Frame', description: 'A dignified golden frame, clearly transatlantic in origin, with three small mirrors set into the corners.' },
  'zoom':                  { title: 'The Clock Frame', description: 'A frame made from the face of a clock, its hands removed, the numerals still faintly visible.' },
  'objects-as-metaphors':  { title: 'The Cluttered Frame', description: 'A frame hung with small objects—a key, a button, a coin—each one seemingly placed with care.' },
  'nonlinear-narrative':   { title: 'The Splintered Frame', description: 'A frame that appears to have been broken and reassembled, the pieces not quite in their original order.' },
  'sensory-detail':        { title: 'The Weathered Frame', description: 'A frame worn by weather and handling, its surface rough to the touch, smelling faintly of rain.' },
}

type WindowPhase = 'choosing' | 'reading' | 'done'

export default function InHouseStep({ participant, onAdvance }: Props) {
  const [completedWindows, setCompletedWindows] = useState<string[]>([])
  const [currentWindow, setCurrentWindow] = useState<string | null>(null)
  const [phase, setPhase] = useState<WindowPhase>('choosing')
  const [passages, setPassages] = useState<LLMPassage[]>([])
  const [currentSection, setCurrentSection] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [generating, setGenerating] = useState(false)

  const remainingWindows = participant.assigned_windows.filter(
    (w) => !completedWindows.includes(w)
  )

  useEffect(() => {
    fetch(`/llmFuncs/window-sessions/completed?participantId=${participant.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.windows) setCompletedWindows(data.windows)
      })
      .catch((err) => console.error('Failed to load completed windows:', err))
  }, [participant.id])

  const enterWindow = async (windowName: string) => {
    setCurrentWindow(windowName)
    setPhase('reading')
    setCurrentSection(0)
    setPassages([])
    setGenerating(true)

    await fetch('/llmFuncs/window-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participantId: participant.id,
        windowName,
        orderInSession: completedWindows.length + 1,
      }),
    })

    // Generate all 3 sections
    const session = await getSession(participant.id)
    const res = await fetch('/llmFuncs/generate-window', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        windowName,
        session,
      }),
    })
    const data = await res.json()
    setPassages(data.passages)
    setGenerating(false)
  }

  const handleGoOn = () => {
    if (currentSection < passages.length - 1) {
      setCurrentSection(currentSection + 1)
    }
  }

  const handleCorrection = async () => {
    if (!feedback.trim() || !currentWindow) return
    setGenerating(true)
    setShowFeedback(false)

    const session = await getSession(participant.id)
    const res = await fetch('/llmFuncs/regenerate-window', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        windowName: currentWindow,
        session,
        passages: passages.slice(0, currentSection),
        feedback,
        fromSection: currentSection,
      }),
    })
    const data = await res.json()
    const updatedPassages = [
      ...passages.slice(0, currentSection),
      ...data.passages,
    ]
    setPassages(updatedPassages)
    setFeedback('')
    setGenerating(false)
  }

  const handleAcceptWindow = async () => {
    if (!currentWindow) return

    await fetch('/llmFuncs/window-sessions/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participantId: participant.id,
        windowName: currentWindow,
        passages,
      }),
    })

    const newCompleted = [...completedWindows, currentWindow]
    setCompletedWindows(newCompleted)
    setCurrentWindow(null)
    setPhase('choosing')

    if (newCompleted.length >= participant.assigned_windows.length) {
      await updateParticipantStatus(participant.pid, nextStep('in_house'))
      onAdvance()
    }
  }

  // Choosing a window
  if (phase === 'choosing') {
    return (
      <StepWrapper>
        <p className="text-stone-200 text-sm leading-relaxed">
          Before you are {remainingWindows.length === participant.assigned_windows.length
            ? 'three window frames'
            : `${remainingWindows.length} remaining window${remainingWindows.length !== 1 ? 's' : ''}`}.
          Do you walk toward…
        </p>

        <div className="space-y-3">
          {remainingWindows.map((w) => {
            const label = WINDOW_LABELS[w] ?? { title: w, description: '' }
            return (
              <button
                key={w}
                onClick={() => enterWindow(w)}
                className="w-full text-left px-4 py-4 rounded border border-stone-800 hover:border-stone-600 transition-colors group"
              >
                <p className="text-stone-200 text-sm font-medium group-hover:text-stone-100">{label.title}</p>
                <p className="text-stone-500 text-xs mt-1 leading-relaxed">{label.description}</p>
              </button>
            )
          })}
        </div>

        {completedWindows.length > 0 && (
          <p className="text-stone-600 text-xs text-center">
            {completedWindows.length} of {participant.assigned_windows.length} windows visited
          </p>
        )}
      </StepWrapper>
    )
  }

  // Reading a window
  const currentPassage = passages[currentSection]
  const isLastSection = currentSection === passages.length - 1

  return (
    <StepWrapper>
      {generating ? (
        <p className="text-stone-400 text-sm text-center py-8">
          <LoadingDots label="The glass begins to cloud, then clear" />
        </p>
      ) : currentPassage ? (
        <>
          <p className="text-stone-600 text-xs uppercase tracking-widest">
            {WINDOW_LABELS[currentWindow ?? '']?.title ?? currentWindow} — {currentSection + 1} of 3
          </p>

          <div className="prose prose-sm prose-invert max-w-none">
            <p className="text-stone-200 leading-relaxed whitespace-pre-wrap">
              {currentPassage.content}
            </p>
          </div>

          {showFeedback ? (
            <div className="space-y-3">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What should change?"
                rows={3}
                className="w-full bg-stone-900 border border-stone-700 rounded px-4 py-3 text-stone-200 text-sm placeholder-stone-600 focus:outline-none focus:border-stone-500 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCorrection}
                  disabled={!feedback.trim()}
                  className="flex-1 py-2 text-sm rounded border border-stone-700 text-stone-300 hover:bg-stone-800 disabled:opacity-30 transition-colors"
                >
                  Revise
                </button>
                <button
                  onClick={() => setShowFeedback(false)}
                  className="px-4 py-2 text-sm rounded border border-stone-800 text-stone-500 hover:border-stone-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              {!isLastSection ? (
                <button
                  onClick={handleGoOn}
                  className="flex-1 py-3 text-sm rounded border border-stone-700 text-stone-300 hover:bg-stone-800 transition-colors"
                >
                  Go on…
                </button>
              ) : (
                <button
                  onClick={handleAcceptWindow}
                  className="flex-1 py-3 text-sm rounded border border-stone-700 text-stone-300 hover:bg-stone-800 transition-colors"
                >
                  Step back
                </button>
              )}
              <button
                onClick={() => setShowFeedback(true)}
                className="px-4 py-3 text-sm rounded border border-stone-800 text-stone-500 hover:border-stone-700 hover:text-stone-400 transition-colors"
              >
                That&apos;s not quite right…
              </button>
            </div>
          )}
        </>
      ) : null}
    </StepWrapper>
  )
}