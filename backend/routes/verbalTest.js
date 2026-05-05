import express from 'express';
import auth from '../middleware/auth.js';
import { generateJSON as generateGeminiJSON } from '../middleware/gemini.js';
import { generateJSON as generateGroqJSON } from '../middleware/groq.js';

const router = express.Router();

const TOPICS = [
  "Antonyms", "Synonyms", "Spelling Errors", "One Word Substitution", "Verbs", "Adverbs", "Tenses",
  "Subject-Verb Agreement", "Idioms & Phrases", "Agreement", "Articles", "Error Detection",
  "Fill in the Blanks", "Sentence Correction", "Rearrangement", "Vocabulary", "Unseen Passage",
  "Narration (Direct & Indirect Speech)", "Active & Passive Voice"
];

router.post('/generate', auth, async (req, res) => {
  const { topic } = req.body;
  
  try {
    let promptTopic = topic === 'Mixed' ? `a mixture of these topics: ${TOPICS.join(', ')}` : topic;
    
    // We'll ask for 30 questions. To handle potential JSON size limits, 
    // we'll instruct the AI to be concise but thorough.
    const randomSeed = Math.random().toString(36).substring(7);
    const prompt = `
      Generate a professional 20-question English Verbal Ability Test for the topic: "${promptTopic}".
      PATTERN: Competitive Exams (SSC, Banking, GRE style).
      RANDOM SEED: ${randomSeed}.
      
      Requirements:
      1. EXACTLY 20 questions in the array.
      2. Exactly 4 options (A, B, C, D) for every question.
      3. Format: Return ONLY a JSON object with a "questions" key.
      
      Format example:
      {
        "questions": [
          {
            "question": "...",
            "options": ["A", "B", "C", "D"],
            "correct": 0,
            "explanation": "..."
          }
        ]
      }
    `;

    let result;
    try {
      console.log(`[VerbalTest] Attempting generation with Primary AI (Gemini)...`);
      result = await generateGeminiJSON(prompt);
    } catch (geminiError) {
      console.warn(`[VerbalTest] Primary AI (Gemini) failed or hit quota. Falling back to Backup AI (Groq)...`);
      try {
        // Fallback to Groq if Gemini fails
        result = await generateGroqJSON(prompt);
        console.log(`[VerbalTest] Successfully generated using Backup AI (Groq).`);
      } catch (groqError) {
        console.error(`[VerbalTest] Both AI providers failed.`);
        throw new Error('Both AI providers are currently busy. Please try again in a moment.');
      }
    }

    if (!result || !Array.isArray(result.questions)) {
      throw new Error('Invalid response format from AI');
    }

    res.json({
      topic,
      questions: result.questions.slice(0, 20)
    });
  } catch (err) {
    console.error('Verbal Test Generation Error:', err);
    res.status(500).json({ 
      message: 'Failed to generate test questions', 
      error: err.message
    });
  }
});

export default router;
