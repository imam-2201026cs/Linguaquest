/**
 * puter.js AI Middleware
 * Replaces Groq / Gemini.
 * Uses official @heyputer/puter.js library initialized with PUTER_AUTH_TOKEN.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { init } = require("@heyputer/puter.js/src/init.cjs");

import dotenv from 'dotenv';
dotenv.config();

// Initialize puter with the token from .env
const puter = init(process.env.PUTER_AUTH_TOKEN);

const MODEL = 'claude-3-5-sonnet'; 

/**
 * Call puter.ai chat completion
 */
async function callPuterAI(prompt, { temperature = 0.7, jsonMode = false } = {}) {
  try {
    if (!process.env.PUTER_AUTH_TOKEN) {
      throw new Error('PUTER_AUTH_TOKEN is missing in .env');
    }

    const finalPrompt = jsonMode
      ? `${prompt}\n\nIMPORTANT: Respond ONLY with a valid JSON object. No markdown, no explanations.`
      : prompt;

    const response = await puter.ai.chat(finalPrompt, {
      model: MODEL,
      temperature: temperature,
      stream: false
    });

    const content = typeof response === 'string' ? response : response?.message?.content || response?.toString() || '';

    if (!content) throw new Error('Empty response from Puter AI');
    return content;
  } catch (err) {
    console.error('Puter AI Call Error:', err.message || err);
    throw err;
  }
}

/**
 * Generate text content
 */
export const generateContent = async (prompt) => {
  return await callPuterAI(prompt, { temperature: 0.7 });
};

/**
 * Generate and parse JSON
 */
export const generateJSON = async (prompt) => {
  try {
    const text = await callPuterAI(prompt, { temperature: 0.1, jsonMode: true });

    const clean = text.replace(/```json|```/gi, '').trim();

    const startObj = clean.indexOf('{');
    const startArr = clean.indexOf('[');
    const start = (startObj !== -1 && (startArr === -1 || startObj < startArr)) ? startObj : startArr;

    const endObj = clean.lastIndexOf('}');
    const endArr = clean.lastIndexOf(']');
    const end = (endObj !== -1 && (endArr === -1 || endObj > endArr)) ? endObj : endArr;

    if (start === -1 || end === -1) throw new Error('No JSON structure found in response');

    return JSON.parse(clean.substring(start, end + 1));
  } catch (error) {
    console.error('Puter generateJSON Error:', error.message || error);
    throw new Error('Failed to generate AI analysis');
  }
};

export const getGeminiModel = () => {
  return { generateContent: async (prompt) => ({ response: { text: () => generateContent(prompt) } }) };
};
