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
      "google/gemini-2.0-flash-exp:free",
      "meta-llama/llama-3.1-8b-instruct:free",
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
                  ? "You are a professional AI content generator. Return ONLY raw, valid JSON. No markdown formatting (no ```json). No conversational text." 
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
              "HTTP-Referer": "https://linguaquest-plum.vercel.app",
              "X-Title": "LinguaQuest",
              "Content-Type": "application/json"
            },
            timeout: 20000 // Increased to 20s
          }
        );

        let content = response.data.choices[0]?.message?.content || "";

        if (isJson) {
          try {
            // Aggressive JSON cleanup
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              content = jsonMatch[0];
            }
            return JSON.parse(content);
          } catch (parseErr) {
            console.warn(`Model ${model} sent invalid JSON. Retrying with next model...`);
            continue;
          }
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
