import { Session, WindowRow } from '@/types/database'
import { db } from '../database/configureDatabase'

export type WindowConfig = {
  id: string
  description: string
  writer: string
  work: string
  styleInterventions: string[]
  structureInterventions: string[]
}

// Safely parse a JSON string that should contain a string[].
function parseStringArray(value: string | null | undefined): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed) && parsed.every((v) => typeof v === 'string')) {
      return parsed
    }
    return []
  } catch {
    return []
  }
}

export function getWindowConfig(windowID: string): WindowConfig | null {
  const row = db
    .prepare(
      `SELECT id, description, writer, work, styleInterventions, structureInterventions
         FROM windows
        WHERE id = ?`
    )
    .get(windowID) as WindowRow | undefined

  if (!row) return null

  return {
    id: row.id,
    description: row.description,
    writer: row.writer,
    work: row.work,
    styleInterventions: parseStringArray(row.styleInterventions),
    structureInterventions: parseStringArray(row.structureInterventions),
  }
}

export function buildSystemPrompt(config: WindowConfig, session: Session): string {
  let characters = session.characters
  if (typeof characters === 'string') {
    try {
      characters = JSON.parse(characters)
    } catch {
      characters = []
    }
  }
  if (!Array.isArray(characters)) characters = []

  const characterList = characters
    .map((c) => `${c.name}: ${c.description}`)
    .join('\n')
  const motivations = [
    ...(session.motivations ?? []),
    session.motivation_description,
  ]
    .filter(Boolean)
    .join('; ')
  let stylePrompt = "**Style Interventions**: \n"
    for (let i=0; i< config.styleInterventions.length; i++){
        stylePrompt += "- " + config.styleInterventions[i]
    }
  let structurePrompt = "**Structure Interventions**: \n"
    for (let i=0; i< config.structureInterventions.length; i++){
        structurePrompt += "- " + config.structureInterventions[i]
    }
  return `Write a story based on the character and events given to you in the style of  ${config.writer}'s ${config.work}. Adhere to the following rules:\n` + stylePrompt +   "\n\n" + structurePrompt + "\n\n" +
  "The story should be fully aligned with the factual information in the summary, but it should feel very different, entirely reframed according to the instructions above. \n\n **Events**" +
  `${session.plot_summary},
  **Protagonist**
  Name: ${session.participant_name} (${session.participant_pronouns})

  **Key Characters**:
  ${characterList || 'None specified.'}

  **Their Motivation**:
  ${session.motivation_description || 'Not specified.'}

  You will generate the new story in three sections, to give the user time to give feedback. Generate **only** the story text for the next section.`
}

const sections = ["Beginning","Middle","End"]

export function buildSectionPrompt(
  config: WindowConfig,
  sectionIndex: number,
  previousSections: string[]
): string {
  const prior = previousSections
    .map((s, i) => `[Section ${i + 1}]\n${s}`)
    .join('\n\n')

  return `${prior ? `Here are the sections written so far:\n\n${prior}\n\nNow continue.` : ''}

Write the ${sections[sectionIndex]}

Write no more than 150 words. Do not add a heading or label.`
}
