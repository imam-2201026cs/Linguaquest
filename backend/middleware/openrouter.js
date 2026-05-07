/**
 * OpenRouter AI Middleware
 * Uses OpenRouter API which is highly reliable and OpenAI-compatible.
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5173", // Optional, for OpenRouter rankings
    "X-Title": "LinguaQuest", // Optional
  }
});

/**
 * Generate text content
 */
export const generateContent = async (prompt) => {
  try {
    const completion = await openrouter.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        { role: "user", content: prompt }
      ],
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter generateContent Error:', error.message);
    throw error;
  }
};

/**
 * Generate and parse JSON
 */
export const generateJSON = async (prompt) => {
  try {
    const completion = await openrouter.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('OpenRouter generateJSON Error:', error.message);
    
    // Fallback parsing
    try {
      const text = await generateContent(prompt + "\nRespond ONLY with raw JSON.");
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        return JSON.parse(text.substring(start, end + 1));
      }
    } catch (e) {}

    throw new Error('Failed to generate AI analysis');
  }
};
