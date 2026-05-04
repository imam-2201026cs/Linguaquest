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

// ── Gutenberg book library by level ──────────────────────────────────────────
const BOOK_LIBRARY = {
  beginner: [
    { id: 'gb_11339', gutenbergId: 11339, title: "Aesop's Fables", author: 'Aesop', emoji: '🐰', genre: 'Fables', description: 'Classic moral stories with animals as characters' },
    { id: 'gb_2591',  gutenbergId: 2591,  title: "Grimm's Fairy Tales", author: 'Brothers Grimm', emoji: '🏰', genre: 'Fairy Tales', description: 'Classic fairy tales from the Brothers Grimm' },
    { id: 'gb_16',    gutenbergId: 16,    title: 'Peter Pan', author: 'J.M. Barrie', emoji: '🧚', genre: 'Fantasy', description: 'The boy who never grew up and his adventures in Neverland' },
  ],
  elementary: [
    { id: 'gb_11',    gutenbergId: 11,    title: "Alice's Adventures in Wonderland", author: 'Lewis Carroll', emoji: '🐇', genre: 'Fantasy', description: 'A girl who falls into a magical world full of strange creatures' },
    { id: 'gb_35',    gutenbergId: 35,    title: 'The Jungle Book', author: 'Rudyard Kipling', emoji: '🐯', genre: 'Adventure', description: 'A boy raised by wolves in the Indian jungle' },
    { id: 'gb_74',    gutenbergId: 74,    title: 'The Adventures of Tom Sawyer', author: 'Mark Twain', emoji: '🚣', genre: 'Adventure', description: 'A mischievous boy growing up along the Mississippi River' },
    { id: 'gb_76',    gutenbergId: 76,    title: 'Adventures of Huckleberry Finn', author: 'Mark Twain', emoji: '🏞️', genre: 'Adventure', description: 'Huck Finn runs away and travels down the Mississippi River' },
  ],
  intermediate: [
    { id: 'gb_120',   gutenbergId: 120,   title: 'Treasure Island', author: 'R.L. Stevenson', emoji: '🏴‍☠️', genre: 'Adventure', description: 'A young boy discovers a treasure map and goes on a pirate adventure' },
    { id: 'gb_103',   gutenbergId: 103,   title: 'Around the World in 80 Days', author: 'Jules Verne', emoji: '🌍', genre: 'Adventure', description: 'A gentleman bets he can travel around the world in just 80 days' },
    { id: 'gb_70',    gutenbergId: 70,    title: 'Robinson Crusoe', author: 'Daniel Defoe', emoji: '🏝️', genre: 'Survival', description: 'A man stranded alone on a deserted island for 28 years' },
    { id: 'gb_46',    gutenbergId: 46,    title: 'A Christmas Carol', author: 'Charles Dickens', emoji: '🎄', genre: 'Classic', description: 'A miserly old man is visited by three ghosts on Christmas Eve' },
  ],
  upper_intermediate: [
    { id: 'gb_1661',  gutenbergId: 1661,  title: 'The Adventures of Sherlock Holmes', author: 'Arthur Conan Doyle', emoji: '🔍', genre: 'Mystery', description: 'The world\'s greatest detective solves baffling crimes' },
    { id: 'gb_84',    gutenbergId: 84,    title: 'Frankenstein', author: 'Mary Shelley', emoji: '⚡', genre: 'Gothic', description: 'A scientist creates life and must face the consequences' },
    { id: 'gb_174',   gutenbergId: 174,   title: 'The Picture of Dorian Gray', author: 'Oscar Wilde', emoji: '🎨', genre: 'Gothic', description: 'A man sells his soul to remain young and beautiful forever' },
    { id: 'gb_2413',  gutenbergId: 2413,  title: 'Dr Jekyll and Mr Hyde', author: 'R.L. Stevenson', emoji: '🧪', genre: 'Thriller', description: 'A scientist\'s experiment creates a terrifying alter ego' },
  ],
  advanced: [
    { id: 'gb_1342',  gutenbergId: 1342,  title: 'Pride and Prejudice', author: 'Jane Austen', emoji: '💐', genre: 'Classic', description: 'A witty exploration of love, class, and marriage in Regency England' },
    { id: 'gb_345',   gutenbergId: 345,   title: 'Dracula', author: 'Bram Stoker', emoji: '🧛', genre: 'Horror', description: 'A Transylvanian vampire terrorises Victorian England' },
    { id: 'gb_2701',  gutenbergId: 2701,  title: 'Moby Dick', author: 'Herman Melville', emoji: '🐳', genre: 'Epic', description: 'A ship captain\'s obsessive quest to hunt a great white whale' },
    { id: 'gb_1400',  gutenbergId: 1400,  title: 'Great Expectations', author: 'Charles Dickens', emoji: '🎩', genre: 'Classic', description: 'An orphan boy\'s journey from poverty to wealth in Victorian England' },
  ],
  expert: [
    { id: 'gb_100',   gutenbergId: 100,   title: 'Shakespeare\'s Complete Works', author: 'William Shakespeare', emoji: '🎭', genre: 'Literature', description: 'The complete plays and sonnets of the world\'s greatest writer' },
    { id: 'gb_2554',  gutenbergId: 2554,  title: 'Crime and Punishment', author: 'Dostoyevsky', emoji: '⚖️', genre: 'Literary Fiction', description: 'A student commits a murder and is tormented by guilt and paranoia' },
    { id: 'gb_1080',  gutenbergId: 1080,  title: 'The Republic', author: 'Plato', emoji: '🏛️', genre: 'Philosophy', description: 'Plato\'s masterwork on justice, the ideal state, and the philosopher-king' },
  ],
};

const ARTICLE_GENRES = ['General Knowledge', 'Science & Technology', 'History', 'Environment', 'Health', 'Culture & Arts', 'Business', 'Space & Universe', 'Psychology', 'Sports'];

// ── Get book library for user level ──────────────────────────────────────────
router.get('/books', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('level');
    const userLevel = user?.level || 1;
    const tier = getLevelTier(userLevel);

    const tierOrder = ['beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced', 'expert'];
    const tierUnlockLevels = { beginner: 1, elementary: 3, intermediate: 5, upper_intermediate: 8, advanced: 11, expert: 15 };

    const library = {};
    tierOrder.forEach(t => {
      library[t] = {
        books: BOOK_LIBRARY[t] || [],
        unlocked: userLevel >= tierUnlockLevels[t],
        requiredLevel: tierUnlockLevels[t],
        label: { beginner: '🟢 Beginner', elementary: '🟡 Elementary', intermediate: '🟠 Intermediate', upper_intermediate: '🔴 Upper Intermediate', advanced: '🔥 Advanced', expert: '💎 Expert' }[t]
      };
    });

    res.json({ library, userLevel, userTier: tier });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Generate reading from a Gutenberg book ────────────────────────────────────
router.post('/book-passage', auth, async (req, res) => {
  try {
    const { bookId } = req.body;
    const user = await User.findById(req.user._id).select('level');
    const tier = getLevelTier(user?.level || 1);

    // Find book
    let book = null;
    for (const tier_ of Object.values(BOOK_LIBRARY)) {
      book = tier_.find(b => b.id === bookId);
      if (book) break;
    }
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Fetch from Gutenberg
    let rawText = '';
    try {
      const urls = [
        `https://www.gutenberg.org/files/${book.gutenbergId}/${book.gutenbergId}-0.txt`,
        `https://www.gutenberg.org/files/${book.gutenbergId}/${book.gutenbergId}.txt`,
        `https://gutenberg.org/cache/epub/${book.gutenbergId}/pg${book.gutenbergId}.txt`,
      ];
      for (const url of urls) {
        try {
          const res2 = await fetch(url, { signal: AbortSignal.timeout(8000) });
          if (res2.ok) { rawText = await res2.text(); break; }
        } catch { continue; }
      }
    } catch (e) {
      console.error('Gutenberg fetch error:', e.message);
    }

    // Clean and extract passage
    let passage = '';
    if (rawText && rawText.length > 500) {
      const cleaned = rawText
        .replace(/\r\n/g, '\n')
        .replace(/_{5,}/g, '')
        .replace(/\*{3,}/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      // Skip the Gutenberg header (first 3000 chars usually)
      const startPos = Math.max(cleaned.indexOf('\n\n', 3000), 3000);
      const usable = cleaned.slice(startPos, startPos + 8000);
      passage = usable.slice(0, 2500);
    }

    const wordTarget = tier === 'beginner' ? 120 : tier === 'elementary' ? 180 : tier === 'intermediate' ? 250 : tier === 'upper_intermediate' ? 320 : 400;

    const aiPrompt = passage.length > 100
      ? `You are an English teacher. From the following text of "${book.title}" by ${book.author}, extract and if necessary simplify a self-contained passage of approximately ${wordTarget} words suitable for a ${tier.replace('_', ' ')} English learner. The passage should make sense on its own and be engaging.

Raw text: "${passage.slice(0, 2000)}"

Then generate 4 comprehension questions. Return ONLY JSON:
{
  "passage": "<the extracted/simplified passage>",
  "chapterHint": "<which part of the book this seems to be from>",
  "questions": [
    {"id": 1, "question": "<comprehension question>", "options": ["<A>","<B>","<C>","<D>"], "correct": 0, "explanation": "<why correct>"},
    {"id": 2, "question": "<inference question>", "options": ["<A>","<B>","<C>","<D>"], "correct": 1, "explanation": "<explanation>"},
    {"id": 3, "question": "<vocabulary question>", "options": ["<A>","<B>","<C>","<D>"], "correct": 2, "explanation": "<explanation>"},
    {"id": 4, "question": "<theme/main idea question>", "options": ["<A>","<B>","<C>","<D>"], "correct": 3, "explanation": "<explanation>"}
  ],
  "vocabulary": [
    {"word": "<word from passage>", "definition": "<clear definition>", "level": "<beginner|intermediate|advanced>"}
  ],
  "summary": "<2-sentence summary of this passage>"
}`
      : `Generate an engaging passage of approximately ${wordTarget} words from "${book.title}" by ${book.author} for a ${tier.replace('_', ' ')} level English learner. Make it authentic to the book's style and self-contained.

Then generate 4 comprehension questions. Return ONLY JSON:
{
  "passage": "<authentic passage from the book>",
  "chapterHint": "<which part of the book this is from>",
  "questions": [
    {"id": 1, "question": "<comprehension question>", "options": ["<A>","<B>","<C>","<D>"], "correct": 0, "explanation": "<why correct>"},
    {"id": 2, "question": "<inference question>", "options": ["<A>","<B>","<C>","<D>"], "correct": 1, "explanation": "<explanation>"},
    {"id": 3, "question": "<vocabulary question>", "options": ["<A>","<B>","<C>","<D>"], "correct": 2, "explanation": "<explanation>"},
    {"id": 4, "question": "<theme question>", "options": ["<A>","<B>","<C>","<D>"], "correct": 3, "explanation": "<explanation>"}
  ],
  "vocabulary": [
    {"word": "<word>", "definition": "<definition>", "level": "<beginner|intermediate|advanced>"}
  ],
  "summary": "<2-sentence summary>"
}`;

    const exercise = await generateJSON(aiPrompt);
    res.json({ ...exercise, book, tier });
  } catch (err) {
    console.error('Book passage error:', err);
    res.status(500).json({ message: 'Failed to generate book passage. Try again.' });
  }
});

// ── Generate AI article ───────────────────────────────────────────────────────
router.post('/generate', auth, async (req, res) => {
  try {
    const { genre = 'general knowledge' } = req.body;
    const user = await User.findById(req.user._id).select('level');
    const tier = getLevelTier(user?.level || 1);
    const wordTarget = tier === 'beginner' ? 120 : tier === 'elementary' ? 160 : tier === 'intermediate' ? 220 : tier === 'upper_intermediate' ? 280 : 350;

    const prompt = `Create an English reading comprehension article about "${genre}" for a ${tier.replace('_', ' ')} level learner. The article should be ${wordTarget} words, informative and engaging.

Return ONLY JSON:
{
  "title": "<article title>",
  "passage": "<well-structured article with 2-3 paragraphs, ${wordTarget} words>",
  "questions": [
    {"id": 1, "question": "<comprehension question>", "options": ["<A>","<B>","<C>","<D>"], "correct": 0, "explanation": "<why correct>"},
    {"id": 2, "question": "<inference question>", "options": ["<A>","<B>","<C>","<D>"], "correct": 2, "explanation": "<explanation>"},
    {"id": 3, "question": "<vocabulary in context question>", "options": ["<A>","<B>","<C>","<D>"], "correct": 1, "explanation": "<explanation>"},
    {"id": 4, "question": "<main idea question>", "options": ["<A>","<B>","<C>","<D>"], "correct": 3, "explanation": "<explanation>"}
  ],
  "vocabulary": [{"word": "<key word>", "definition": "<clear definition>", "level": "<beginner|intermediate|advanced>"}],
  "summary": "<2-sentence summary>",
  "difficulty": "${tier}"
}`;

    const exercise = await generateJSON(prompt);
    res.json(exercise);
  } catch (err) {
    console.error('Reading Generation Error:', err);
    res.status(500).json({ message: 'Failed to generate exercise' });
  }
});

// ── Get genres and user info ──────────────────────────────────────────────────
router.get('/genres', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('level');
    const tier = getLevelTier(user?.level || 1);
    res.json({ genres: ARTICLE_GENRES, tier, level: user?.level || 1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Submit answers ────────────────────────────────────────────────────────────
router.post('/submit', auth, async (req, res) => {
  try {
    const { answers, questions, topic, timeSpent, wpm } = req.body;
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correct) correct++; });
    const score = Math.round((correct / questions.length) * 100);

    // WPM bonus XP
    let xpEarned = Math.floor(score / 10) * 5 + 10;
    if (wpm >= 200) xpEarned += 15;
    else if (wpm >= 150) xpEarned += 8;
    if (score === 100) xpEarned += 20;
    const coinsEarned = Math.floor(xpEarned / 2);

    const activity = new Activity({ userId: req.user._id, type: 'reading', topic, score, maxScore: 100, xpEarned, coinsEarned, timeSpent: timeSpent || 0, details: { correct, total: questions.length, wpm: wpm || 0 } });
    await activity.save();
    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: xpEarned, coins: coinsEarned, 'stats.readingCompleted': 1 } });
    await updateStreak(req.user._id);
    res.json({ score, correct, total: questions.length, xpEarned, coinsEarned });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
