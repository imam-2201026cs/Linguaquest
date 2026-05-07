/**
 * puter.js AI Middleware
 * Replaces Groq / Gemini — no API key required.
 * Uses puter.ai REST endpoint (works server-side and client-side).
 *
 * Puter AI docs: https://docs.puter.com/ai/chat/
 * Model used: claude-sonnet-4-5 (free via puter.com)
 */

const PUTER_AI_URL = 'https://api.puter.com/ai/chat';
const MODEL = 'claude-sonnet-4-5'; // Free, high-quality model on puter

/**
 * Call puter.ai chat completion
 * @param {string} prompt
 * @param {object} opts
 * @param {number} [opts.temperature]
 * @param {boolean} [opts.jsonMode]
 * @returns {Promise<string>}
 */
async function callPuterAI(prompt, { temperature = 0.7, jsonMode = false } = {}) {
  const systemPrompt = jsonMode
    ? 'You are a helpful assistant. Respond ONLY with valid JSON and nothing else — no markdown, no code fences, no explanation.'
    : 'You are an expert English language learning assistant.';

  const body = {
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature,
    max_tokens: 1024,
  };

  const res = await fetch(PUTER_AI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Puter AI error ${res.status}: ${errText}`);
  }

  const data = await res.json();

  // Handle both OpenAI-style and puter-style responses
  const content =
    data?.choices?.[0]?.message?.content ||
    data?.message?.content ||
    data?.content ||
    '';

  if (!content) throw new Error('Empty response from Puter AI');
  return content;
}

/**
 * Generate text content (matches old groq/gemini interface)
 * @param {string} prompt
 * @returns {Promise<string>}
 */
export const generateContent = async (prompt) => {
  try {
    return await callPuterAI(prompt, { temperature: 0.7 });
  } catch (error) {
    console.error('Puter generateContent Error:', error.message || error);
    throw error;
  }
};

/**
 * Generate and parse JSON (matches old groq/gemini interface)
 * @param {string} prompt
 * @returns {Promise<object>}
 */
export const generateJSON = async (prompt) => {
  try {
    const text = await callPuterAI(prompt, { temperature: 0.2, jsonMode: true });

    // Strip any accidental markdown fences
    const clean = text.replace(/```json|```/gi, '').trim();

    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON object found in response');

    return JSON.parse(clean.substring(start, end + 1));
  } catch (error) {
    console.error('Puter generateJSON Error:', error.message || error);

    // Fallback: ask again without JSON mode
    try {
      const fallback = await callPuterAI(
        prompt + '\n\nIMPORTANT: Respond ONLY with a raw JSON object.',
        { temperature: 0.1 }
      );
      const start = fallback.indexOf('{');
      const end = fallback.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        return JSON.parse(fallback.substring(start, end + 1));
      }
    } catch (e) {
      console.error('Puter Fallback JSON Error:', e.message);
    }

    throw new Error('Failed to generate AI analysis');
  }
};

// Legacy Gemini-compatible exports (some routes import getGeminiModel)
export const getGeminiModel = () => {
  console.warn('[puter.js] getGeminiModel() is a no-op shim. Use generateContent/generateJSON instead.');
  return { generateContent: async (prompt) => ({ response: { text: () => generateContent(prompt) } }) };
};
