'use client'

import { useState, useEffect } from 'react'
import { updateParticipantStatus, updateSession, getSession } from '@/lib/session'
import { nextStep } from '@/lib/steps'
import { Participant } from '@/types/database'
import StepWrapper from '@/storyComponents/StepWrapper'

interface Props {
  participant: Participant
  pid: string
  onAdvance: () => void
}

export default function PreNarrativeStep({ participant, onAdvance }: Props) {
  const [qualities, setQualities] = useState<string[]>([])
  const [narrative, setNarrative] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [approached, setApproaching] = useState(false)

  const wordCount = narrative.trim().split(/\s+/).filter(Boolean).length

  useEffect(() => {
      getSession(participant.id).then((s) => {
         let q = s?.qualities
        if (typeof q === 'string') {
          try { q = JSON.parse(q) } catch { q = [] }
        }
        if (Array.isArray(q)) setQualities(q)
      })
    }, [participant.id])
    const qualityList = qualities.join(' and ')
  
  const handleApproach = () => {
    setApproaching(true)
  }
  const handleSubmit = async () => {
    if (!narrative.trim() || wordCount > 350) return
    setSubmitting(true)
    await updateSession(participant.id, { t1_narrative: narrative })
    await updateParticipantStatus(participant.pid, nextStep('pre_narrative'))
    onAdvance()
  }

  if(!approached){
    return (<StepWrapper>
            <p className="text-stone-200 text-sm leading-relaxed">
        It’s nice to know so much about yourself, to have this nice evening walk to realize that you’re {' '}
        {qualityList ? (
          <span className="text-stone-100">{qualityList}</span>
        ) : (
          <span>thoughtful and self-aware</span>
        )}{' '} and… definitely trespassing on someone’s private property.
      </p>
      <p className="text-stone-200 text-sm leading-relaxed">
        In front of you rises a grand house—sprawling and a little worn, mosses
        creeping up elegant, classical walls that might have stood there,
        uninhabited, for a century. Except that the windows are lit. All of them.
      </p>
      <p className="text-stone-200 text-sm leading-relaxed">
        Not a chance, you think, and turn to leave. Except… you can&apos;t at all remember where you came from, or how to get back.
      </p>
      <button onClick={handleApproach} className="w-full py-3 text-sm font-medium rounded border border-stone-700 text-stone-300 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Approach the House</button>
    </StepWrapper>
    )
  }

  return (
    <StepWrapper>
      <p className="text-stone-200 text-sm leading-relaxed">Steeling your nerves, you step onto the overgrown lawn and approach the wrought iron gate.</p>
      <p className="text-stone-200 text-sm leading-relaxed">A man emerges from the stone gatehouse--of middling age, with a strong frame and kindly eyes, he seems like a friendly sort. Embarrassed, you explain your plight.</p>
      <p className="text-stone-200 text-sm leading-relaxed">“You're very welcome to stay the night,” the gatekeeper says. “Plenty of space, and the view is lovely. But I'll need a story from you, first. Something true. Think of it as a character reference.”</p>
      <p className="text-stone-200 text-sm leading-relaxed">Grateful that you’ve just had a good long walk to put your thoughts in order, you decide to tell the mysterious figure about one of your troubles.</p>
      <p className="text-stone-200 text-sm leading-relaxed">“Hmm, very interesting,” he replies. “That's good--I'd hate to fall asleep and leave you stranded out here. <b>So keep it snappy, okay? No more than 300 words. Beginning, middle, end--make sure you fit it all in there.</b>”</p>
      <p className="text-xs">
        [NOTE: For this study, we ask that you tell the Gatekeeper something true--a story from your life that might benefit from some fresh perspective]
      </p>

      <textarea
        value={narrative}
        onChange={(e) => setNarrative(e.target.value)}
        placeholder="Tell your story here…"
        rows={10}
        className="w-full bg-stone-900 border border-stone-700 rounded px-4 py-3 text-stone-200 text-sm placeholder-stone-600 focus:outline-none focus:border-stone-500 resize-none leading-relaxed"
      />

      <div className="flex justify-between items-center">
        <span className={`text-sm ${wordCount > 300 ? 'text-amber-600' : 'text-stone-500'}`}>
          {wordCount} / 300 words
        </span>
        <button
          onClick={handleSubmit}
          disabled={!narrative.trim() || wordCount > 350 || submitting}
          className="px-6 py-2 text-sm rounded border border-stone-700 text-stone-200 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? '...' : 'Hand it over'}
        </button>
      </div>
    </StepWrapper>
  )
}
