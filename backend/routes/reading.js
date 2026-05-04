import express from 'express';
import auth from '../middleware/auth.js';
import { generateJSON } from '../middleware/groq.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { updateStreak } from '../middleware/streak.js';

const router = express.Router();

const getLevelTier = (level) => {
  if (level <= 2)  return 'beginner';
  if (level <= 4)  return 'elementary';
  if (level <= 7)  return 'intermediate';
  if (level <= 10) return 'upper_intermediate';
  if (level <= 14) return 'advanced';
  return 'expert';
};

// ── 180-Book Structured Roadmap (30 per Level) ──────────────────────────────
// Categorized by CEFR levels with 10 Beginner, 10 Intermediate, 10 Advanced each
const READING_ROADMAP = {
  beginner: Array.from({ length: 30 }, (_, i) => ({
    id: `r_a1_${i + 1}`,
    title: i < 10 ? `Basic Story ${i + 1}` : i < 20 ? `Daily Life ${i - 9}` : `Park Adventures ${i - 19}`,
    author: 'LinguaQuest',
    emoji: i < 10 ? '🌱' : i < 20 ? '🏠' : '🌳',
    genre: 'Simplified',
    tier: i < 10 ? 'beginner' : i < 20 ? 'intermediate' : 'advanced',
    description: `A short A1-level story focusing on ${i < 10 ? 'basic nouns' : i < 20 ? 'present tense' : 'simple descriptions'}.`,
    gutenbergId: null // Custom generated
  })),
  elementary: Array.from({ length: 30 }, (_, i) => ({
    id: `r_a2_${i + 1}`,
    title: i < 10 ? `Fairy Tale ${i + 1}` : i < 20 ? `Travel Diary ${i - 9}` : `City Life ${i - 19}`,
    author: 'LinguaQuest',
    emoji: i < 10 ? '🏰' : i < 20 ? '✈️' : '🏙️',
    genre: 'Stories',
    tier: i < 10 ? 'beginner' : i < 20 ? 'intermediate' : 'advanced',
    description: `A2-level reading about ${i < 10 ? 'mythical creatures' : i < 20 ? 'new places' : 'urban environments'}.`,
    gutenbergId: null
  })),
  intermediate: Array.from({ length: 30 }, (_, i) => ({
    id: `r_b1_${i + 1}`,
    title: i < 10 ? `Mystery Case ${i + 1}` : i < 20 ? `History Fact ${i - 9}` : `Tech World ${i - 19}`,
    author: 'LinguaQuest',
    emoji: i < 10 ? '🔍' : i < 20 ? '📜' : '💻',
    genre: 'Educational',
    tier: i < 10 ? 'beginner' : i < 20 ? 'intermediate' : 'advanced',
    description: `B1-level text exploring ${i < 10 ? 'clues and puzzles' : i < 20 ? 'past events' : 'digital trends'}.`,
    gutenbergId: null
  })),
  upper_intermediate: Array.from({ length: 30 }, (_, i) => ({
    id: `r_b2_${i + 1}`,
    title: i < 10 ? `Social Issue ${i + 1}` : i < 20 ? `Business Case ${i - 9}` : `Nature Report ${i - 19}`,
    author: 'LinguaQuest',
    emoji: i < 10 ? '🌍' : i < 20 ? '💼' : '🌿',
    genre: 'Articles',
    tier: i < 10 ? 'beginner' : i < 20 ? 'intermediate' : 'advanced',
    description: `B2-level article discussing ${i < 10 ? 'global problems' : i < 20 ? 'market strategies' : 'ecosystems'}.`,
    gutenbergId: null
  })),
  advanced: Array.from({ length: 30 }, (_, i) => ({
    id: `r_c1_${i + 1}`,
    title: i < 10 ? `Classic Lit ${i + 1}` : i < 20 ? `Philo Essay ${i - 9}` : `Modern Novel ${i - 19}`,
    author: 'Classic Authors',
    emoji: i < 10 ? '🎩' : i < 20 ? '🤔' : '📖',
    genre: 'Literature',
    tier: i < 10 ? 'beginner' : i < 20 ? 'intermediate' : 'advanced',
    description: `C1-level analysis of ${i < 10 ? '19th century prose' : i < 20 ? 'existentialism' : 'contemporary fiction'}.`,
    gutenbergId: null
  })),
  expert: Array.from({ length: 30 }, (_, i) => ({
    id: `r_c2_${i + 1}`,
    title: i < 10 ? `Scientific Paper ${i + 1}` : i < 20 ? `Legal Doc ${i - 9}` : `Masterwork ${i - 19}`,
    author: 'Scholarly Source',
    emoji: i < 10 ? '🧬' : i < 20 ? '⚖️' : '💎',
    genre: 'Academic',
    tier: i < 10 ? 'beginner' : i < 20 ? 'intermediate' : 'advanced',
    description: `C2-level mastery of ${i < 10 ? 'complex data' : i < 20 ? 'jurisprudence' : 'advanced rhetoric'}.`,
    gutenbergId: null
  })),
};

// Add real Gutenberg books to fill the library for variety
READING_ROADMAP.beginner[0] = { id: 'gb_11339', gutenbergId: 11339, title: "Aesop's Fables", author: 'Aesop', emoji: '🐰', genre: 'Fables', tier: 'beginner', description: 'Classic moral stories' };
READING_ROADMAP.elementary[0] = { id: 'gb_11', gutenbergId: 11, title: "Alice in Wonderland", author: 'Lewis Carroll', emoji: '🐇', genre: 'Fantasy', tier: 'beginner', description: 'A magical world' };
READING_ROADMAP.intermediate[0] = { id: 'gb_120', gutenbergId: 120, title: 'Treasure Island', author: 'R.L. Stevenson', emoji: '🏴‍☠️', genre: 'Adventure', tier: 'beginner', description: 'Pirate adventure' };

const ARTICLE_GENRES = ['General Knowledge', 'Science & Technology', 'History', 'Environment', 'Health', 'Culture & Arts', 'Business', 'Space & Universe', 'Psychology', 'Sports'];

// ── Get Roadmap Library ─────────────────────────────────────────────────────
router.get('/books', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('level completedReadingLessons');
    const userLevel = user?.level || 1;
    const completed = user?.completedReadingLessons || [];

    const levels = ['beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced', 'expert'];
    const levelLabels = { beginner: 'A1 Beginner', elementary: 'A2 Elementary', intermediate: 'B1 Intermediate', upper_intermediate: 'B2 Upper', advanced: 'C1 Advanced', expert: 'C2 Expert' };

    const library = {};
    levels.forEach(lvl => {
      const books = READING_ROADMAP[lvl] || [];
      
      // Unlocking Logic
      const processedBooks = books.map((b, index) => {
        const isCompleted = completed.includes(b.id);
        let isUnlocked = false;
        
        // 1. If the book is already completed, it MUST be unlocked (re-readability)
        if (isCompleted) {
          isUnlocked = true;
        }
        // 2. The very first book of the whole curriculum is ALWAYS unlocked
        else if (lvl === 'beginner' && index === 0) {
          isUnlocked = true;
        } 
        // 3. Any book is unlocked if the one immediately before it is completed
        else if (index > 0) {
          isUnlocked = completed.includes(books[index - 1].id);
        } 
        // 4. First book of a new level is unlocked if the last book of the previous level is completed
        else {
          const prevLvlIndex = levels.indexOf(lvl) - 1;
          if (prevLvlIndex >= 0) {
            const prevLvlBooks = READING_ROADMAP[levels[prevLvlIndex]];
            isUnlocked = completed.includes(prevLvlBooks[prevLvlBooks.length - 1].id);
          }
        }

        return { ...b, isCompleted, isUnlocked };
      });

      library[lvl] = {
        label: levelLabels[lvl],
        books: processedBooks,
        progress: Math.round((processedBooks.filter(b => b.isCompleted).length / processedBooks.length) * 100)
      };
    });

    res.json({ library, userLevel, completedCount: completed.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get Passage ──────────────────────────────────────────────────────────────
router.post('/book-passage', auth, async (req, res) => {
  try {
    const { bookId } = req.body;
    const user = await User.findById(req.user._id).select('level');
    const tier = getLevelTier(user?.level || 1);

    let book = null;
    for (const lvlBooks of Object.values(READING_ROADMAP)) {
      book = lvlBooks.find(b => b.id === bookId);
      if (book) break;
    }
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const wordTarget = tier === 'beginner' ? 120 : tier === 'elementary' ? 180 : 250;
    const prompt = `Create an engaging ${book.genre} story titled "${book.title}" for a ${tier} level English learner. Topic: ${book.description}. Length: ${wordTarget} words.
Return ONLY JSON:
{
  "title": "${book.title}",
  "passage": "<engaging story/text with 3 paragraphs>",
  "illustrationPrompt": "<a cartoon-style description for an image of this scene>",
  "questions": [
    {"id": 1, "question": "<question>", "options": ["A","B","C","D"], "correct": 0, "explanation": "<why>"},
    {"id": 2, "question": "<question>", "options": ["A","B","C","D"], "correct": 1, "explanation": "<why>"},
    {"id": 3, "question": "<question>", "options": ["A","B","C","D"], "correct": 2, "explanation": "<why>"},
    {"id": 4, "question": "<question>", "options": ["A","B","C","D"], "correct": 3, "explanation": "<why>"}
  ],
  "vocabulary": [{"word": "<word>", "definition": "<def>", "level": "A1"}],
  "summary": "<short summary>"
}`;

    const exercise = await generateJSON(prompt);
    res.json({ ...exercise, book });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate content' });
  }
});

// ── Submit Answers ────────────────────────────────────────────────────────────
router.post('/submit', auth, async (req, res) => {
  try {
    const { answers, questions, bookId, timeSpent, wpm } = req.body;
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correct) correct++; });
    const score = Math.round((correct / questions.length) * 100);

    let xpEarned = Math.floor(score / 10) * 5 + 10;
    if (score >= 70) xpEarned += 20;
    const coinsEarned = Math.floor(xpEarned / 2);

    await User.findByIdAndUpdate(req.user._id, { 
      $inc: { xp: xpEarned, coins: coinsEarned, 'stats.readingCompleted': 1 },
      ...(score >= 70 && bookId ? { $addToSet: { completedReadingLessons: bookId } } : {})
    });

    const activity = new Activity({ userId: req.user._id, type: 'reading', topic: bookId, score, maxScore: 100, xpEarned, coinsEarned, timeSpent });
    await activity.save();
    await updateStreak(req.user._id);

    res.json({ score, correct, total: questions.length, xpEarned, coinsEarned });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/genres', auth, (req, res) => res.json({ genres: ARTICLE_GENRES }));

export default router;
