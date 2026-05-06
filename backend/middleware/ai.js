import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Generate AI content using OpenRouter (Accesses multiple free models)
 */
export const generateAI = async (prompt, isJson = false) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('CRITICAL: OPENROUTER_API_KEY is missing!');
      throw new Error('API Configuration Missing');
    }

    // We try multiple stable free models to ensure 100% uptime
    const models = [
      "meta-llama/llama-3.1-8b-instruct:free",
      "google/gemini-2.0-flash-exp:free",
      "mistralai/mistral-7b-instruct:free",
      "openchat/openchat-7b:free"
    ];

    let lastError = null;

    for (const model of models) {
      try {
        const response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: model,
            messages: [
              {
                role: "system",
                content: isJson 
                  ? "You are a professional AI content generator. Return ONLY raw, valid JSON. No markdown. No conversational text." 
                  : "You are a helpful English teacher."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 4000 
          },
          {
            headers: {
              "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "HTTP-Referer": "https://linguaquest.vercel.app",
              "X-Title": "LinguaQuest",
              "Content-Type": "application/json"
            },
            timeout: 15000 // 15s timeout per model
          }
        );

        const content = response.data.choices[0]?.message?.content || "";

        if (isJson) {
          // Cleanup markdown
          const cleanJson = content.replace(/```json\n?|```/g, '').trim();
          return JSON.parse(cleanJson);
        }

        return content;
      } catch (err) {
        lastError = err.response?.data?.error?.message || err.message;
        console.log(`Model ${model} failed: ${lastError}. Trying next...`);
        continue;
      }
    }

    throw new Error(`All AI models failed. Last error: ${lastError}`);
  } catch (error) {
    console.error('OPENROUTER FINAL ERROR:', error.message);
    throw error;
  }
};

// Aliases for compatibility with your existing routes
export const generateJSON = (prompt) => generateAI(prompt, true);
export const generateContent = (prompt) => generateAI(prompt, false);
