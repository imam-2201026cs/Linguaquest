import express from 'express';
import auth from '../middleware/auth.js';
import { generateJSON } from '../middleware/puter.js';

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
    const prompt = `
      Generate a high-quality 30-question English Verbal Ability Test for the topic: "${promptTopic}".
      Return a JSON object with a "questions" key containing an array of 30 objects.
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
