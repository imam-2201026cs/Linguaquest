import { init } from "@heyputer/puter.js/src/init.cjs";
import dotenv from 'dotenv';
dotenv.config();

// Initialize Puter.js for Node.js environment
// NOTE: PUTER_AUTH_TOKEN should be added to your .env file
const puter = init(process.env.PUTER_AUTH_TOKEN);

/**
 * Generate AI content using Puter.js v2
 * High-performance AI processing for LinguaQuest
 */
export const generateAI = async (prompt, isJson = false) => {
  try {
    const systemPrompt = isJson 
      ? "You are a professional AI content generator for LinguaQuest. Return ONLY raw, valid JSON. No markdown formatting. No conversational text." 
      : "You are a helpful English teacher at LinguaQuest.";

    // Call Puter.js AI Chat
    // Model choices on Puter: 'claude-3-5-sonnet', 'gpt-4o', etc.
    const response = await puter.ai.chat(
      `${systemPrompt}\n\nUser Request: ${prompt}`,
      { model: 'claude-3-5-sonnet' } 
    );

    let content = response?.toString() || "";

    if (isJson) {
      try {
        // Deep Clean: Remove markdown code blocks and find the first { and last }
        let cleanJson = content.replace(/```json|```/g, '').trim();
        const firstBrace = cleanJson.indexOf('{');
        const lastBrace = cleanJson.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
        }

        return JSON.parse(cleanJson);
      } catch (parseErr) {
        console.warn("Puter JSON Parse Attempt 1 failed. Trying aggressive cleanup...");
        try {
            // Aggressive fallback: just find anything between braces
            const fallbackMatch = content.match(/\{[\s\S]*\}/);
            if (fallbackMatch) {
                return JSON.parse(fallbackMatch[0]);
            }
            throw new Error("No JSON structure found in response");
        } catch (finalErr) {
            console.error("AI Response was not JSON:", content);
            throw new Error("AI returned invalid data format");
        }
      }
    }

    return content;
  } catch (error) {
    console.error('PUTER AI ERROR:', error.message);
    
    // Fallback logic using an alternative Puter model
    try {
        const fallback = await puter.ai.chat(prompt, { model: 'gpt-4o' });
        const fallbackText = fallback.toString();
        if (isJson) {
           const jsonMatch = fallbackText.match(/\{[\s\S]*\}/);
           return JSON.parse(jsonMatch ? jsonMatch[0] : fallbackText);
        }
        return fallbackText;
    } catch (fallbackErr) {
        throw new Error(`Puter AI System Unavailable: ${error.message}`);
    }
  }
};

export const generateJSON = (prompt) => generateAI(prompt, true);
export const generateContent = (prompt) => generateAI(prompt, false);
