import express from 'express';
import auth from '../middleware/auth.js';
import { generateJSON } from '../middleware/groq.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { updateStreak } from '../middleware/streak.js';

const router = express.Router();

router.post('/generate', auth, async (req, res) => {
  try {
    const { level = 'intermediate', topic = 'daily life' } = req.body;

    const prompt = `Create a short English listening exercise about "${topic}" for ${level} learners.

Return ONLY JSON with this exact format:
{
  "title": "<exercise title>",
  "passage": "<a natural conversational passage of 80-120 words that could be listened to>",
  "questions": [
    {
      "id": 1,
      "question": "<question about the passage>",
      "options": ["<A option>", "<B option>", "<C option>", "<D option>"],
      "correct": 0
    },
    {
      "id": 2,
      "question": "<question>",
      "options": ["<A>", "<B>", "<C>", "<D>"],
      "correct": 1
    },
    {
      "id": 3,
      "question": "<question>",
      "options": ["<A>", "<B>", "<C>", "<D>"],
      "correct": 2
    }
  ],
  "vocabulary": [
    {"word": "<word>", "meaning": "<simple definition>"}
  ]
}
Return ONLY the JSON.`;

    const exercise = await generateJSON(prompt);
    res.json(exercise);
  } catch (err) {
    console.error('Listening Generation Error:', err);
    res.status(500).json({ message: 'Failed to generate exercise, try again.' });
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
    const xpEarned = Math.floor(score / 10) * 4 + 8;
    const coinsEarned = Math.floor(xpEarned / 2);

    const activity = new Activity({
      userId: req.user._id,
      type: 'listening',
      topic,
      score,
      maxScore: 100,
      xpEarned,
      coinsEarned,
      timeSpent: timeSpent || 0,
      details: { correct, total: questions.length, answers }
    });
    await activity.save();

    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        xp: xpEarned,
        coins: coinsEarned,
        'stats.listeningCompleted': 1
      }
    });
    await updateStreak(req.user._id);

    res.json({ score, correct, total: questions.length, xpEarned, coinsEarned });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
