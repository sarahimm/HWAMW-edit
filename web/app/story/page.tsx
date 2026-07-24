'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getOrCreateParticipant, ensureSession } from '@/lib/session'
import { Participant } from '@/types/database'

import TroublesStep from '@/storyComponents/steps/TroublesStep'
import QualitiesStep from '@/storyComponents/steps/QualitiesStep'
import QualityDescriptionStep from '@/storyComponents/steps/QualityDescriptionStep'
import PreNarrativeStep from '@/storyComponents/steps/PreNarrativeStep'
import CharactersStep from '@/storyComponents/steps/CharactersStep'
import MotivationsStep from '@/storyComponents/steps/MotivationsStep'
import MeaningStep from '@/storyComponents/steps/MeaningStep'
import InHouseStep from '@/storyComponents/steps/InHouseStep'
import PostNarrativeStep from '@/storyComponents/steps/PostNarrativeStep'
import CompleteStep from '@/storyComponents/steps/CompleteStep'
import FirstStep from '@/storyComponents/steps/FirstStep'

export default function StudyPage() {
  const searchParams = useSearchParams()
  const pid = searchParams.get('pid')

  const [participant, setParticipant] = useState<Participant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!pid) return
    getOrCreateParticipant(pid)
      .then(async (p) => {
        await ensureSession(p.id)
        setParticipant(p)
      })
      .catch(() => setError('Something went wrong. Please try your study link again.'))
      .finally(() => setLoading(false))
  }, [pid])

  const refresh = async () => {
    if (!pid) return
    const p = await getOrCreateParticipant(pid)
    setParticipant({ ...p })
  }

  if (!pid) return <ErrorScreen message="No study link detected. Please use the link provided to you." />
  if (loading) return <LoadingScreen />
  if (error) return <ErrorScreen message={error} />
  if (!participant) return null

  const props = { participant, pid, onAdvance: refresh }

  switch (participant.status) {
    case 'first_step':          return <FirstStep {...props} />
    case 'troubles':            return <TroublesStep {...props} />
    case 'qualities':           return <QualitiesStep {...props} />
    case 'quality_description': return <QualityDescriptionStep {...props} />
    case 'pre_narrative':       return <PreNarrativeStep {...props} />
    case 'characters':          return <CharactersStep {...props} />
    case 'motivations':         return <MotivationsStep {...props} />
    case 't1_meaning':          return <MeaningStep {...props} timing="t1" />
    case 'in_house':            return <InHouseStep {...props} />
    case 'post_narrative':      return <PostNarrativeStep {...props} />
    case 't2_meaning':          return <MeaningStep {...props} timing="t2" />
    case 'complete':            return <CompleteStep {...props} />
    default:                    return <ErrorScreen message="Unknown step. Please contact the research team." />
  }
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950">
      <p className="text-stone-500 text-sm">...</p>
    </div>
  )
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950 px-6">
      <p className="text-stone-400 text-sm max-w-sm text-center">{message}</p>
    </div>
  )
}
