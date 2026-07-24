'use client'

import { useState, useEffect } from 'react'
import { updateParticipantStatus, updateSession, getSession } from '@/lib/session'
import { nextStep } from '@/lib/steps'
import {WindowConfig} from '@/lib/windows'
import { Participant, LLMPassage } from '@/types/database'
import StepWrapper from '@/storyComponents/StepWrapper'
import LoadingDots from '@/storyComponents/LoadingDots'

interface Props {
  participant: Participant
  pid: string
  onAdvance: () => void
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
  const [isInspirationOpen, setIsInspirationOpen] = useState(false);

  const remainingWindows = participant.assigned_windows.filter(
    (w) => !completedWindows.includes(w)
  )

  const [windowConfigs, setWindowConfigs] = useState<Record<string, WindowConfig>>({});

  useEffect(() => {
    const fetchWindowConfigs = async () => {
      const response = await fetch('/llmFuncs/window-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({windowIds: remainingWindows}),
      });
      const data = await response.json();
      setWindowConfigs(data);
    };
    fetchWindowConfigs();
  }, []);

  useEffect(() => {
    fetch(`/llmFuncs/window-sessions/completed?participantId=${participant.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.windows) setCompletedWindows(data.windows)
      })
      .catch((err) => console.error('Failed to load completed windows:', err))
  }, [participant.id])

  const enterWindow = async (windowId: string) => {
    setCurrentWindow(windowId)
    setPhase('reading')
    setCurrentSection(0)
    setPassages([])
    setGenerating(true)

    await fetch('/llmFuncs/window-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participantId: participant.id,
        windowId,
        orderInSession: completedWindows.length + 1,
      }),
    })

    // Generate all 3 sections
    const session = await getSession(participant.id)
    const res = await fetch('/llmFuncs/generate-window', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        windowId,
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
        windowId: currentWindow,
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

   const renderList = (items: string[]): React.ReactNode => (
     <ul className="space-y-2 list-disc px-4"> 
     {items.map((item, index) => ( <li key={index} className="text-stone-400 text-sm leading-relaxed"> {item} </li> ))} </ul> );

  const handleAcceptWindow = async () => {
    if (!currentWindow) return

    await fetch('/llmFuncs/window-sessions/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participantId: participant.id,
        windowId: currentWindow,
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
            const window = windowConfigs[w];
            let desc = "";
            if (window) {
              desc = window.description;
            }
            return (
              <button
                key={w}
                onClick={() => enterWindow(w)}
                className="w-full text-left px-4 py-4 rounded border border-stone-800 hover:border-stone-600 transition-colors group"
              >
                
                <p className="text-stone-500 text-xs mt-1 leading-relaxed">{desc}</p>
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
            Through the window — {currentSection + 1} of 3
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
            <div className="flex flex-col gap-2">
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

              {isLastSection && (
                <button
                  onClick={() => setIsInspirationOpen(true)}
                  className="w-full py-2 text-sm rounded border border-stone-800 text-stone-500 hover:border-stone-700 hover:text-stone-400 transition-colors"
                >
                  View inspiration
                </button>
              )}
            </div>
          )}
        </>
      ) : null}

      {/* Inspiration drawer */}
      <>
        {isInspirationOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setIsInspirationOpen(false)}
          />
        )}

        {/* Drawer */}
        <div
          className={`fixed top-0 right-0 h-full w-100 bg-stone-900 border-l border-stone-800 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
            isInspirationOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800">
            <span className="text-stone-400 text-xs uppercase tracking-widest">
              Inspiration
            </span>
            <button
              onClick={() => setIsInspirationOpen(false)}
              className="text-stone-600 hover:text-stone-400 transition-colors text-lg leading-none"
              aria-label="Close inspiration drawer"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            This windowpane is inspired by:
            <h2 className="my-6 text-lg">
              <span className="font-semibold">{windowConfigs[currentWindow || "null"].work}</span> &nbsp; by&nbsp;
               <span className="font-bold">{windowConfigs[currentWindow || "null"].writer}</span>
            </h2>

            It uses literary techniques as a lens to reshape your story.

            <div className="px-2 my-4"></div>
              <h3 className="text-sm"> Style: </h3>
                <ul className="list-disc">
                  {renderList(windowConfigs[currentWindow || "null"].styleInterventions)}
                </ul>
              <h3 className="text-sm"> Structure and content: </h3>
                <ul>
                  {renderList(windowConfigs[currentWindow || "null"].structureInterventions)}
                </ul>
              </div>
          </div>
        </>
    </StepWrapper>
  )
}