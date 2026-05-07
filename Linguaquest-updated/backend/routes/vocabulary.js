import express from 'express';
import auth from '../middleware/auth.js';
import Vocabulary from '../models/Vocabulary.js';
import User from '../models/User.js';

const router = express.Router();

// Get all vocabulary words
router.get('/all', auth, async (req, res) => {
  try {
    const allWords = await Vocabulary.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(allWords);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get daily queue
router.get('/', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    // Fetch due review words (learning or graduated and nextReviewDate <= today)
    const dueReviews = await Vocabulary.find({
      userId: req.user._id,
      status: { $in: ['learning', 'graduated'] },
      nextReviewDate: { $lte: today }
    });

    // Fetch up to 10 new words
    const newWords = await Vocabulary.find({
      userId: req.user._id,
      status: 'new'
    }).limit(10);

    const stats = {
      total: await Vocabulary.countDocuments({ userId: req.user._id }),
      new: await Vocabulary.countDocuments({ userId: req.user._id, status: 'new' }),
      learning: await Vocabulary.countDocuments({ userId: req.user._id, status: 'learning' }),
      graduated: await Vocabulary.countDocuments({ userId: req.user._id, status: 'graduated' })
    };

    res.json({ newWords, dueReviews, totalDue: dueReviews.length + newWords.length, stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a word to vocabulary
router.post('/add', auth, async (req, res) => {
  try {
    const { word, definition, example, source } = req.body;
    
    // Normalize word
    const normalizedWord = word.toLowerCase().trim();

    const existing = await Vocabulary.findOne({ userId: req.user._id, word: normalizedWord });
    if (existing) {
      return res.status(200).json({ message: 'Word already in vocabulary', word: existing });
    }

    const newVocab = new Vocabulary({
      userId: req.user._id,
      word: normalizedWord,
      definition,
      example,
      source: source || 'manual',
      nextReviewDate: new Date() // ready immediately
    });

    await newVocab.save();
    res.status(201).json({ message: 'Word added to vocabulary', word: newVocab });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit a review (Spaced Repetition SM-2 implementation)
router.post('/review', auth, async (req, res) => {
  try {
    const { wordId, knewIt } = req.body;
    const vocab = await Vocabulary.findOne({ _id: wordId, userId: req.user._id });
    
    if (!vocab) return res.status(404).json({ message: 'Word not found' });

    let { interval, easeFactor, status } = vocab;

    if (knewIt) {
      if (status === 'new') status = 'learning';
      if (interval === 0) {
        interval = 1;
      } else if (interval === 1) {
        interval = 6;
        status = 'graduated';
      } else {
        interval = Math.round(interval * easeFactor);
      }
      easeFactor = Math.min(2.5, easeFactor + 0.1); // slightly increase ease
    } else {
      interval = 0; // Reset interval
      easeFactor = Math.max(1.3, easeFactor - 0.2); // decrease ease, min 1.3
      status = 'learning'; // back to learning
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    vocab.interval = interval;
    vocab.easeFactor = easeFactor;
    vocab.nextReviewDate = nextReview;
    vocab.status = status;

    await vocab.save();

    // Give some XP for reviewing
    const user = await User.findById(req.user._id);
    user.xp += 2; 
    await user.save();

    res.json({ message: 'Review saved', vocab, xpEarned: 2 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
