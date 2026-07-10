const ELM_BASE_URL = process.env.ELM_BASE_URL || 'https://elm.edina.ac.uk'
const ELM_API_KEY = process.env.ELM_API_KEY

export async function getCompletions(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  model = 'meta-llama/Llama-3.3-70B-Instruct'
): Promise<string> {
  const res = await fetch(`${ELM_BASE_URL}/api/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ELM_API_KEY}`},
    body: JSON.stringify({
      model: model,
      messages: messages,
      stream: false,
    }),
  })

  if (!res.ok) {
    throw new Error(`ELM error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  return data.choices[0].message.content
}
