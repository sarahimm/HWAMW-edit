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


export default function PostNarrativeStep({ participant, onAdvance }: Props) {
  const [narrative, setNarrative] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isRecallOpen, setIsRecallOpen] = useState(false); 
  const [recallIndex, setRecallIndex] = useState(0);
  const wordCount = narrative.trim().split(/\s+/).filter(Boolean).length

  const handleSubmit = async () => {
    if (!narrative.trim() || wordCount > 350) return
    setSubmitting(true)
    await updateSession(participant.id, { t2_narrative: narrative })
    await updateParticipantStatus(participant.pid, nextStep('post_narrative'))
    onAdvance()
  }
  
  const passages: string[] = ["","",""];


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

      <button
        onClick={() => setIsRecallOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-xs rounded border border-stone-800 text-stone-500 hover:border-stone-700 hover:text-stone-400 transition-colors self-start"
      >
        {/* Column/panel icon */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
          aria-hidden="true"
        >
          <rect x="1" y="1" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <rect x="7" y="1" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        Recall what the House showed you
      </button>

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

      {/* Recall drawer */}
      <>
        {/* Backdrop */}
        {isRecallOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setIsRecallOpen(false)}
          />
        )}

        {/* Drawer */}
        <div
          className={`fixed top-0 right-0 h-full w-96 bg-stone-900 border-l border-stone-800 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
            isRecallOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 shrink-0">
            <span className="text-stone-400 text-xs uppercase tracking-widest">
              The Windows
            </span>
            <button
              onClick={() => setIsRecallOpen(false)}
              className="text-stone-600 hover:text-stone-400 transition-colors text-lg leading-none"
              aria-label="Close recall drawer"
            >
              ✕
            </button>
          </div>

          {/* Tab navigation */}
          <div className="flex border-b border-stone-800 shrink-0">
            {passages.map((_, i) => (
              <button
                key={i}
                onClick={() => setRecallIndex(i)}
                className={`flex-1 py-3 text-xs transition-colors ${
                  recallIndex === i
                    ? "text-stone-200 border-b-2 border-stone-400 -mb-px"
                    : "text-stone-600 hover:text-stone-400"
                }`}
              >
                Window {i + 1}
              </button>
            ))}
          </div>

          {/* Scrollable passage content */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <p className="text-stone-300 text-sm leading-relaxed whitespace-pre-wrap">
              {passages[recallIndex]}
            </p>
          </div>

          {/* Footer navigation */}
          <div className="flex justify-between items-center px-5 py-4 border-t border-stone-800 shrink-0">
            <button
              onClick={() => setRecallIndex((i) => Math.max(0, i - 1))}
              disabled={recallIndex === 0}
              className="text-xs text-stone-500 hover:text-stone-300 disabled:opacity-30 transition-colors"
            >
              ← Previous
            </button>
            <span className="text-stone-700 text-xs">
              {recallIndex + 1} of {passages.length}
            </span>
            <button
              onClick={() => setRecallIndex((i) => Math.min(passages.length - 1, i + 1))}
              disabled={recallIndex === passages.length - 1}
              className="text-xs text-stone-500 hover:text-stone-300 disabled:opacity-30 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </>
    </StepWrapper>
  )
}
