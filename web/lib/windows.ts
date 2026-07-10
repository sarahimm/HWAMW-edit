import { Session } from '@/types/database'

export type WindowConfig = {
  name: string
  description: string
  internalPrompts: string[]
  sectionStructure: { label: string; instruction: string }[]
}

const WINDOW_CONFIGS: Record<string, WindowConfig> = {
  'heros-journey': {
    name: "Hero's Journey",
    description: "An experience as a quest — departure, trials, and return.",
    internalPrompts: [
      "What makes the protagonist who they are — their identity, values, core qualities?",
      "What change of setting or novel experience prompted their journey?",
      "What overall goal were they striving for?",
      "What challenges or obstacles stood in their way?",
      "In what ways has the journey left an impact — on them or those around them?",
    ],
    sectionStructure: [
      { label: 'Departure', instruction: 'Write Section 1: the ordinary world and what disturbed it. End at the threshold — the point of no return just ahead.' },
      { label: 'Trials', instruction: 'Write Section 2: the struggle toward the goal. Something is lost or transformed here. End at the deepest point of the ordeal — the outcome still uncertain.' },
      { label: 'Return', instruction: 'Write Section 3: the emergence. What was gained, what was left behind, how the world looks different now. Close with a sense of hard-won arrival.' },
    ],
  },
  'redemption-arc': {
    name: "Redemption Arc",
    description: "A fall from grace followed by recovery and renewal.",
    internalPrompts: [
      "What was lost, damaged, or diminished? What went wrong?",
      "What was the lowest point — when things felt most broken or hopeless?",
      "What shifted that allowed forward movement or new meaning?",
      "How did rebuilding or recovery happen?",
      "In what ways is the protagonist stronger or wiser now?",
    ],
    sectionStructure: [
      { label: 'The Fall', instruction: 'Write Section 1: what was lost or broken. Render the descent clearly without softening. End at the edge of the lowest point, not yet inside it.' },
      { label: 'The Lowest Point', instruction: 'Write Section 2: the moment of maximum hopelessness — and the first, fragile shift. End with the protagonist facing forward for the first time.' },
      { label: 'Rebuilding', instruction: 'Write Section 3: the slow, uneven work of recovery. Not triumphant — genuine. Close with a sense of hard-won ground.' },
    ],
  },
  'conversations-with-god': {
    name: "Conversations with God",
    description: "Accounting for experience to a transcendent witness.",
    internalPrompts: [
      "What was the protagonist trying to accomplish or protect?",
      "What values or principles guided their choices?",
      "What decisions might be questioned or judged?",
      "From the perspective of ultimate accountability, what matters most?",
      "What would a higher power understand about the heart beneath the choices?",
    ],
    sectionStructure: [
      { label: 'The Accounting', instruction: 'Write Section 1: what the protagonist was trying to accomplish or protect, rendered as honest testimony. End with the sense that something harder is still to be faced.' },
      { label: 'The Defence', instruction: 'Write Section 2: what must be explained or defended. End with the hardest thing said aloud, hanging in the silence.' },
      { label: 'What Is Seen', instruction: 'Write Section 3: what a higher power would understand about the heart beneath the choices — fear, love, intention. Close with recognition: to be truly known and not condemned.' },
    ],
  },
  'bildungsroman': {
    name: "Bildungsroman",
    description: "Moral and psychological development from naivety to maturity.",
    internalPrompts: [
      "Who was the protagonist before this experience? What did they believe?",
      "What aspects challenged or complicated their previous understanding?",
      "What internal conflict did they grapple with?",
      "What did they come to understand that they hadn't before?",
      "How did this shape their values, beliefs, or sense of self?",
    ],
    sectionStructure: [
      { label: 'Before', instruction: 'Write Section 1: who the protagonist was before — their assumptions, rendered with clarity and tenderness. End at the moment something begins to challenge that understanding.' },
      { label: 'The Conflict', instruction: 'Write Section 2: the old self and new reality in tension. End at maximum uncertainty — identity in flux, no resolution yet.' },
      { label: 'After', instruction: 'Write Section 3: who they became — a gradual settling, values clarified. Close with a quiet sense of arrival at a more honest version of themselves.' },
    ],
  },
  'epiphany': {
    name: "Epiphany",
    description: "A moment of sudden insight that shifted everything.",
    internalPrompts: [
      "What was happening in the moments before the realisation?",
      "What suddenly became clear in the moment of insight?",
      "What triggered or sparked the realisation?",
      "How did understanding shift before and after?",
      "What has this revelation meant since?",
    ],
    sectionStructure: [
      { label: 'The Lead-Up', instruction: 'Write Section 1: the texture of the ordinary before the realisation. End at the threshold of the insight, not yet there.' },
      { label: 'The Moment', instruction: 'Write Section 2: the realisation itself — short, precise, charged. End in the immediate aftermath, still blinking in the new light.' },
      { label: 'The Aftermath', instruction: 'Write Section 3: how the epiphany has lived since — what changed, what it made possible. Close with before and after held together.' },
    ],
  },
  'focalization': {
    name: "Focalization",
    description: "The same experience through three different eyes.",
    internalPrompts: [
      "From the protagonist's perspective, what did this experience mean? What were they trying to achieve?",
      "How might another key person have perceived what was happening?",
      "What might that person have noticed about the protagonist that they couldn't see?",
      "What would a neutral observer have found significant?",
      "What would the outside observer understand that neither person inside could fully see?",
    ],
    sectionStructure: [
      { label: "The Protagonist's View", instruction: "Write Section 1: the experience as the protagonist lived it — their intentions, their partial vision. End with something unresolved or unseen." },
      { label: "The Other's View", instruction: "Write Section 2: the same experience through the eyes of another key person — their needs and interpretations. Make the reader feel the protagonist being seen from outside for the first time." },
      { label: "The Observer's View", instruction: "Write Section 3: a neutral witness who sees both people clearly. Close with an insight visible only from outside the story." },
    ],
  },
  'zoom': {
    name: "Zoom",
    description: "The same story from three different distances in time.",
    internalPrompts: [
      "Before the experience happened, what would the protagonist have expected it to mean?",
      "Immediately after, what did it mean when still fresh?",
      "From the present moment, what does it mean now?",
      "From a few years in the future, what will they see?",
      "From the end of their life, what role does this play in the whole?",
    ],
    sectionStructure: [
      { label: 'The Recent Past', instruction: 'Write Section 1: the experience as it felt shortly after — still raw, meaning not yet settled. End with the unresolved feeling of something not yet understood.' },
      { label: 'The Present', instruction: 'Write Section 2: from where the protagonist stands now — what time has clarified, what it has complicated. End with the story neither closed nor open — held.' },
      { label: 'The Far Future', instruction: 'Write Section 3: looking back from the end of a life — this experience in its place within the whole. Close with the long view.' },
    ],
  },
  'objects-as-metaphors': {
    name: "Objects as Metaphors",
    description: "Three objects that hold the story.",
    internalPrompts: [
      "What object still reminds the protagonist of this experience?",
      "What object played a key role but has since been lost or forgotten?",
      "What object symbolises what was learned or how they changed?",
      "What object captures the emotional core of the experience?",
      "What do these objects reveal together about its deeper meaning?",
    ],
    sectionStructure: [
      { label: 'The Object That Remains', instruction: 'Write Section 1: an object the protagonist still has — specific and real. End with the weight of what is still present, still unresolved.' },
      { label: 'The Object That Was Lost', instruction: 'Write Section 2: something gone — its absence is its own presence. End with what the loss reveals about what the experience cost.' },
      { label: 'The Object That Symbolises Change', instruction: 'Write Section 3: an object — real or imagined — that captures what was learned. Close with the experience distilled into something you could hold in your hands.' },
    ],
  },
  'nonlinear-narrative': {
    name: "Nonlinear Narrative",
    description: "The story told out of order, to reveal what order hides.",
    internalPrompts: [
      "What was the moment of highest tension or intensity?",
      "What earlier moment set that peak in motion?",
      "What happened after the peak that surprised or changed things?",
      "What moment only made sense after everything else happened?",
      "How do these moments connect in ways a linear telling would miss?",
    ],
    sectionStructure: [
      { label: 'The Peak', instruction: 'Write Section 1: begin in the middle of the highest tension — no setup. End mid-consequence, cause still unknown.' },
      { label: 'The Seed', instruction: 'Write Section 2: an earlier moment that set the peak in motion — seemingly small at the time, unmistakable now. End with the thread leading forward again.' },
      { label: 'The Revelation', instruction: 'Write Section 3: what came after, and the moment that only made sense once everything else had happened. Close with the full shape of the story visible at last.' },
    ],
  },
  'sensory-detail': {
    name: "Sensory Detail",
    description: "The story as the body remembers it.",
    internalPrompts: [
      "What visual details stand out in memory?",
      "What sounds are remembered — voices, music, silence?",
      "What smells or tastes are associated with this experience?",
      "What physical sensations or textures are recalled?",
      "How do these sensory details capture the essence of the experience?",
    ],
    sectionStructure: [
      { label: 'What Was Seen and Heard', instruction: 'Write Section 1: the visual and auditory texture — light, colour, voices, sound. End with an image or sound that carries more weight than it should.' },
      { label: 'What Was Smelled, Tasted, Touched', instruction: 'Write Section 2: the intimate senses — smell, taste, texture, temperature. End with a physical sensation that encodes the emotional core.' },
      { label: 'What the Body Held', instruction: 'Write Section 3: how the experience lived in the body — tension, relief, exhaustion. Close with the body as a record: all of it still there.' },
    ],
  },
}

export function getWindowConfig(windowName: string): WindowConfig | null {
  return WINDOW_CONFIGS[windowName] ?? null
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

  return `You are a gifted literary author helping someone see their personal story through a new narrative lens.

Your task is to write a short, vivid narrative passage retelling their experience using the frame described below. Stay faithful to the facts of their story while transforming how those facts are rendered. Write in second person ("you"). Each section should feel emotionally complete and self-contained, while making the next feel necessary — not arbitrary division.

THEIR STORY:
${session.t1_narrative}

KEY CHARACTERS:
${characterList || 'None specified.'}

WHAT THEY WANT:
${motivations || 'Not specified.'}

NARRATIVE FRAME: ${config.name}
${config.description}

Before writing, reason through the following questions internally (do not show this reasoning):
${config.internalPrompts.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Then write the requested section.`
}

export function buildSectionPrompt(
  config: WindowConfig,
  sectionIndex: number,
  previousSections: string[]
): string {
  const section = config.sectionStructure[sectionIndex]
  const prior = previousSections
    .map((s, i) => `[Section ${i + 1}]\n${s}`)
    .join('\n\n')

  return `${prior ? `Here are the sections written so far:\n\n${prior}\n\nNow continue.` : ''}

${section.instruction}

Write 2–3 paragraphs. Do not add a heading or label.`
}
