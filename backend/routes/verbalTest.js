import express from 'express';
import auth from '../middleware/auth.js';
import { generateJSON } from '../middleware/gemini.js';

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

    const result = await generateJSON(prompt);
    let questions = result.questions || [];

    // If result is an array directly
    if (Array.isArray(result)) questions = result;

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('AI failed to generate a valid question array');
    }

    res.json({ 
      topic,
      count: questions.length,
      questions 
    });
  } catch (err) {
    console.error('Verbal Test Generation Error:', err);
    res.status(500).json({ 
      message: 'Failed to generate test questions', 
      error: err.message,
      details: err.response?.data || 'Check backend logs for full error'
    });
  }
});

export default router;
