import express from 'express';
import auth from '../middleware/auth.js';
import { generateJSON } from '../middleware/groq.js';

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
      Generate a unique, high-quality 30-question English Verbal Ability Test for the topic: "${promptTopic}".
      PATTERN: Competitive Exams (SSC CGL, Banking/IBPS, GRE, CAT, and GMAT style).
      RANDOM SEED: ${randomSeed}.
      
      Requirements:
      1. Every question MUST follow the standard competitive exam pattern for that specific topic.
      2. Every single question MUST have exactly 4 options (A, B, C, and D).
      3. Difficulty: Challenging/Competitive level.
      4. Return a JSON object with a "questions" key containing an array of 30 objects.
      5. Include tricky distractors in the options to match exam standards.
      
      Each question object format:
      {
        "question": "The question text (e.g., 'Choose the most appropriate antonym for...', 'Identify the error in the sentence...', etc.)",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct": 0,
        "explanation": "A professional explanation citing the relevant grammar rule or logic."
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
    res.status(500).json({ message: 'Failed to generate test questions', error: err.message });
  }
});

export default router;
