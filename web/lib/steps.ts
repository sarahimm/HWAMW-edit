// lib/steps.ts
import { ParticipantStatus } from '@/types/database'

export const STEP_ORDER: ParticipantStatus[] = [
  'troubles',
  'qualities',
  'quality_description',
  'pre_narrative',
  'characters',
  'motivations',
  't1_meaning',
  'in_house',
  'post_narrative',
  't2_meaning',
  'complete',
]

export function nextStep(current: ParticipantStatus): ParticipantStatus {
  const idx = STEP_ORDER.indexOf(current)
  return STEP_ORDER[Math.min(idx + 1, STEP_ORDER.length - 1)]
}
