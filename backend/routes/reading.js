import express from 'express';
import auth from '../middleware/auth.js';
import { generateJSON } from '../middleware/groq.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { updateStreak } from '../middleware/streak.js';

const router = express.Router();

router.post('/generate', auth, async (req, res) => {
  try {
    const { level = 'intermediate', genre = 'general knowledge' } = req.body;

    const prompt = `Create an English reading comprehension exercise about "${genre}" for ${level} learners.

Return ONLY JSON:
{
  "title": "<article title>",
  "passage": "<informative article of 150-200 words, well structured with 2-3 paragraphs>",
  "questions": [
    {"id": 1, "question": "<comprehension question>", "options": ["<A>","<B>","<C>","<D>"], "correct": 0, "explanation": "<why this is correct>"},
    {"id": 2, "question": "<inference question>", "options": ["<A>","<B>","<C>","<D>"], "correct": 2, "explanation": "<explanation>"},
    {"id": 3, "question": "<vocabulary in context question>", "options": ["<A>","<B>","<C>","<D>"], "correct": 1, "explanation": "<explanation>"},
    {"id": 4, "question": "<main idea question>", "options": ["<A>","<B>","<C>","<D>"], "correct": 3, "explanation": "<explanation>"}
  ],
  "summary": "<2-sentence summary of the passage>",
  "difficulty": "${level}"
}
Return ONLY the JSON.`;

    const exercise = await generateJSON(prompt);
    res.json(exercise);
  } catch (err) {
    console.error('Reading Generation Error:', err);
    res.status(500).json({ message: 'Failed to generate exercise' });
  }
});

router.post('/submit', auth, async (req, res) => {
  try {
    const { answers, questions, topic, timeSpent } = req.body;
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);
    const xpEarned = Math.floor(score / 10) * 5 + 10;
    const coinsEarned = Math.floor(xpEarned / 2);

    const activity = new Activity({
      userId: req.user._id,
      type: 'reading',
      topic,
      score,
      maxScore: 100,
      xpEarned,
      coinsEarned,
      timeSpent: timeSpent || 0,
      details: { correct, total: questions.length }
    });
    await activity.save();

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { xp: xpEarned, coins: coinsEarned, 'stats.readingCompleted': 1 }
    });
    await updateStreak(req.user._id);

    res.json({ score, correct, total: questions.length, xpEarned, coinsEarned });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
