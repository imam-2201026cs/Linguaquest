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

    // We use Gemini 2.0 Flash (Free) via OpenRouter for massive limits and stability
    const model = "google/gemini-2.0-flash-exp:free";

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
        // OpenRouter's free tier handles large responses well
        max_tokens: 4000 
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://linguaquest.vercel.app", // Optional for OpenRouter
          "X-Title": "LinguaQuest",
          "Content-Type": "application/json"
        }
      }
    );

    const content = response.data.choices[0]?.message?.content || "";

    if (isJson) {
      try {
        // Cleanup if model returns markdown
        const cleanJson = content.replace(/```json\n?|```/g, '').trim();
        return JSON.parse(cleanJson);
      } catch (parseErr) {
        console.error('OpenRouter JSON Parse Error:', parseErr.message);
        throw new Error('AI returned malformed data');
      }
    }

    return content;
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    console.error('OPENROUTER ERROR:', errorMsg);
    throw new Error(`AI Error: ${errorMsg}`);
  }
};

// Aliases for compatibility with your existing routes
export const generateJSON = (prompt) => generateAI(prompt, true);
export const generateContent = (prompt) => generateAI(prompt, false);
