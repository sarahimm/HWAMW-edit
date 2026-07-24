export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type ParticipantStatus =
  | 'first_step'
  | 'troubles'
  | 'qualities'
  | 'quality_description'
  | 'pre_narrative'
  | 'characters'
  | 'motivations'
  | 't1_meaning'
  | 'in_house'
  | 'post_narrative'
  | 't2_meaning'
  | 'complete'


export type Character = {
  name: string
  description: string
}

export type LLMPassage = {
  section: 1 | 2 | 3
  content: string
  corrections: { feedback: string; revised_content: string }[]
}

export type Participant = {
  id: string
  pid: string
  assigned_windows: string[]
  status: ParticipantStatus
  created_at: string
}

export type Session = {
  id: string
  participant_id: string
  participant_pronouns: string
  trouble: string[]
  qualities: string[]
  quality_description: string | null
  t1_narrative: string | null
  plot_summary: string | null
  characters: Character[]
  motivations: string[]
  motivation_description: string | null
  t1_meaning_score: number | null
  participant_name: string | null
  t2_narrative: string | null
  t2_meaning_score: number | null
}

export type WindowSession = {
  id: string
  participant_id: string
  window_name: string
  order_in_session: 1 | 2 | 3
  status: 'not_started' | 'in_progress' | 'complete'
  llm_passages: LLMPassage[]
  created_at: string
  completed_at: string | null
}

// Shape of the raw row as stored in SQLite (interventions are JSON strings).
export type WindowRow = {
  id: string
  description: string
  writer: string
  work: string
  styleInterventions: string
  structureInterventions: string
}


export type FlavorChoice = {
  id: string
  participant_id: string
  fork_id: string
  choice: string
  created_at: string
}

export type QuestionnaireResponse = {
  id: string
  participant_id: string
  questionnaire: 'MEMS' | 'MLQ' | 'PTGI' | 'NISE'
  timing: 'pre' | 'post'
  responses: Record<string, number>
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      participants: {
        Row: Participant
        Insert: {
          pid: string
          assigned_windows: string[]
          status?: ParticipantStatus
        }
        Update: Partial<Participant>
        Relationships: []
      }
      sessions: {
        Row: Session
        Insert: {
          participant_id: string
          participant_pronouns: string
          trouble?: string[]
          qualities?: string[]
          quality_description?: string | null
          t1_narrative?: string | null
          plot_summary?: string | null
          characters?: Character[]
          motivations?: string[]
          motivation_description?: string | null
          t1_meaning_score?: number | null
          participant_name?: string | null
          t2_narrative?: string | null
          t2_meaning_score?: number | null
        }
        Update: Partial<Session>
        Relationships: []
      }
      window_sessions: {
        Row: WindowSession
        Insert: {
          participant_id: string
          window_name: string
          order_in_session: number
          status?: 'not_started' | 'in_progress' | 'complete'
          llm_passages?: LLMPassage[]
        }
        Update: Partial<WindowSession>
        Relationships: []
      }
      flavor_choices: {
        Row: FlavorChoice
        Insert: {
          participant_id: string
          fork_id: string
          choice: string
        }
        Update: Partial<FlavorChoice>
        Relationships: []
      }
      questionnaire_responses: {
        Row: QuestionnaireResponse
        Insert: {
          participant_id: string
          questionnaire: 'MEMS' | 'MLQ' | 'PTGI' | 'NISE'
          timing: 'pre' | 'post'
          responses: Record<string, number>
        }
        Update: Partial<QuestionnaireResponse>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
