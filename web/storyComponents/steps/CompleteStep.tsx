'use client'

import { useEffect, useState } from 'react'
import { getSession } from '@/lib/session'
import { Participant } from '@/types/database'
import StepWrapper from '@/storyComponents/StepWrapper'

interface Props {
  participant: Participant
  pid: string
  onAdvance: () => void
}

export default function CompleteStep({ participant }: Props) {
  const [name, setName] = useState('')

  useEffect(() => {
    getSession(participant.id).then((s) => {
      if (s?.participant_name) setName(s.participant_name)
    })
  }, [participant.id])

  return (
    <StepWrapper>
      <p className="text-stone-400 text-sm leading-relaxed">
        &ldquo;There,&rdquo; the gatekeeper says, stepping back to admire his work. Your
        name is carved into the stone, in the place you chose.
      </p>
      <p className="text-stone-200 text-sm leading-relaxed">
        The sky is beginning to lighten at the edges. The house behind you is
        quiet now—most of the windows dark, a few still glowing. You have the
        feeling, not unpleasant, of someone who has stayed up much later than
        they intended and gotten more than they bargained for.
      </p>
      {name && (
        <p className="text-stone-400 text-sm">
          &ldquo;Safe travels, {name}.&rdquo;
        </p>
      )}

      <div className="w-full h-px bg-stone-800 my-4" />

      <div className="space-y-3 text-stone-500 text-xs leading-relaxed">
        <p>
          This experience is part of an ongoing research project at the Alan
          Turing Institute, exploring how narrative reframing shapes the meaning
          we find in our own life stories.
        </p>
        <p>
          Your responses have been stored anonymously and will be used for
          academic research purposes only. You may request deletion of your data
          at any time by contacting the research team at{' '}
          <span className="text-stone-400">[contact email]</span>.
        </p>
        <p>
          Thank you for taking part.
        </p>
      </div>
    </StepWrapper>
  )
}
