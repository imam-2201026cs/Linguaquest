import express from 'express';
import auth from '../middleware/auth.js';
import { generateJSON } from '../middleware/openrouter.js';

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
    
    // Requesting 15 questions for optimal performance and reliability.
    const prompt = `
      Generate a high-quality 15-question English Verbal Ability Test for the topic: "${promptTopic}".
      Return a JSON object with a "questions" key containing an array of 15 objects.
      Each question object format:
      {
        "question": "The question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct": 1, // Index of correct option (0-3)
        "explanation": "A concise explanation of why the answer is correct."
      }
      Difficulty: Intermediate to Advanced (B2-C1).
      Ensure variety and accuracy.
    `;

    const result = await generateJSON(prompt);
    
    // Handle different possible AI response structures
    let questions = [];
    if (result.questions && Array.isArray(result.questions)) {
      questions = result.questions;
    } else if (Array.isArray(result)) {
      questions = result;
    } else if (typeof result === 'object' && result !== null) {
      // Try to find any array inside the object
      const arrays = Object.values(result).filter(v => Array.isArray(v));
      if (arrays.length > 0) questions = arrays[0];
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('AI failed to generate a valid question array');
    }

    res.json({ 
      topic,
      count: questions.length,
      questions: questions.slice(0, 15) // Ensure we don't exceed expectations
    });
  } catch (err) {
    console.error('Verbal Test Generation Error:', err);
    res.status(500).json({ message: 'Failed to generate test questions', error: err.message });
  }
});

export default router;
