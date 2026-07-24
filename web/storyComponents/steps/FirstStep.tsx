'use client'

import { useState } from 'react'
import { updateParticipantStatus, updateSession, getSession } from '@/lib/session'
import { nextStep } from '@/lib/steps'
import { Participant } from '@/types/database'
import StepWrapper from '@/storyComponents/StepWrapper'
import { RandomizedTextEffect } from '@/storyComponents/ui/text-randomized'

interface Props {
  participant: Participant
  pid: string
  onAdvance: () => void
}

export default function FirstStep({ participant, onAdvance }: Props) {

  const handleSubmit = async () => {
    await updateParticipantStatus(participant.pid, nextStep('first_step'))
    onAdvance()
  }

  return (
    <StepWrapper>
      <div className="text-stone-200 text-4xl leading-relaxed text-center">
       <RandomizedTextEffect text='The' delay={300} /> &nbsp;
       <RandomizedTextEffect text='House' delay={540} /> &nbsp;
       <RandomizedTextEffect text='with' delay={940}/> &nbsp;
       <RandomizedTextEffect text='a' delay={1260}/> &nbsp;
       <RandomizedTextEffect text='Million' delay={1340}/> &nbsp;
       <RandomizedTextEffect text='Windows' delay={1900}/>&nbsp;
      </div>

      <button 
        onClick={handleSubmit}
        className="w-full py-3 text-sm font-medium rounded border border-stone-700 text-stone-300 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"> 
        ENTER
      </button>

    </StepWrapper>
  )
}
