/**
 * LinguaQuest – puter.js AI Service (frontend)
 *
 * Use this for any AI calls made directly from the browser.
 * puter.js is loaded via <script> in index.html, so `window.puter` is available.
 *
 * Usage:
 *   import { aiChat, aiJSON } from '../services/puterAI';
 *   const reply = await aiChat('Explain past perfect tense.');
 *   const data  = await aiJSON('Return a JSON quiz...');
 */

const MODEL = 'claude-sonnet-4-5'; // Best free model on puter

function getPuter() {
  if (typeof window !== 'undefined' && window.puter) return window.puter;
  throw new Error('puter.js is not loaded. Make sure the <script> tag is in index.html.');
}

/**
 * Generate text via puter.ai.chat
 * @param {string} prompt
 * @param {object} [opts]
 * @param {string} [opts.system] System prompt
 * @param {number} [opts.temperature]
 * @returns {Promise<string>}
 */
export async function aiChat(prompt, { system = '', temperature = 0.7 } = {}) {
  const puter = getPuter();
  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: prompt });

  const response = await puter.ai.chat(messages, { model: MODEL, temperature });
  return response?.message?.content ?? response?.content ?? String(response);
}

/**
 * Generate and parse JSON via puter.ai.chat
 * @param {string} prompt
 * @returns {Promise<object>}
 */
export async function aiJSON(prompt) {
  const system =
    'You are a JSON-only assistant. Respond ONLY with a valid JSON object. No markdown, no code fences, no explanation.';
  const text = await aiChat(prompt, { system, temperature: 0.2 });

  const clean = text.replace(/```json|```/gi, '').trim();
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON in puter AI response');
  return JSON.parse(clean.substring(start, end + 1));
}

/**
 * Multi-turn conversation helper
 * @param {Array<{role: string, content: string}>} history
 * @param {string} newMessage
 * @returns {Promise<string>}
 */
export async function aiConversation(history, newMessage) {
  const puter = getPuter();
  const messages = [...history, { role: 'user', content: newMessage }];
  const response = await puter.ai.chat(messages, { model: MODEL });
  return response?.message?.content ?? String(response);
}
