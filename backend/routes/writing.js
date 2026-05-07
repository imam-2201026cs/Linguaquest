import express from 'express';
import auth from '../middleware/auth.js';
import { generateJSON, generateContent } from '../middleware/puter.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { updateStreak } from '../middleware/streak.js';

const router = express.Router();

const MISSIONS = [
  { word: 'nevertheless', bonus: 50, hint: 'Use it to show contrast.' },
  { word: 'exponentially', bonus: 60, hint: 'Use it to describe rapid growth.' },
  { word: 'serendipity', bonus: 80, hint: 'Use it to describe a happy accident.' },
  { word: 'collaborate', bonus: 40, hint: 'Use it when talking about working together.' },
  { word: 'sustainable', bonus: 50, hint: 'Use it when talking about the environment.' },
  { word: 'perspectives', bonus: 50, hint: 'Use it when discussing different opinions.' }
];

router.get('/daily-mission', auth, (req, res) => {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const mission = MISSIONS[dayOfYear % MISSIONS.length];
  res.json(mission);
});

const getLevelTier = (level) => {
  if (level <= 2)  return 'beginner';
  if (level <= 4)  return 'elementary';
  if (level <= 7)  return 'intermediate';
  if (level <= 10) return 'upper_intermediate';
  if (level <= 14) return 'advanced';
  return 'expert';
};

export const WRITING_MODES = [
  { id: 'story_continuation', label: 'Story Continuation', emoji: '📖', color: 'from-blue-600 to-cyan-500' },
  { id: 'picture_writing',    label: 'Picture Writing',    emoji: '🖼️', color: 'from-purple-600 to-pink-500' },
  { id: 'timed_challenge',    label: 'Timed Challenge',    emoji: '⏱️', color: 'from-red-600 to-orange-500' },
  { id: 'news_article',       label: 'News Article',       emoji: '📰', color: 'from-green-600 to-emerald-500' },
  { id: 'letter_email',       label: 'Letter / Email',     emoji: '✉️', color: 'from-yellow-600 to-amber-500' },
  { id: 'creative_scene',     label: 'Creative Scene',     emoji: '🎭', color: 'from-violet-600 to-purple-500' },
];

// ── 90-Lesson Structured Roadmap (15 per Level) ──────────────────────────────
const CEFR_LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
const LEVEL_LABELS = { a1: 'A1 Beginner', a2: 'A2 Elementary', b1: 'B1 Intermediate', b2: 'B2 Upper', c1: 'C1 Advanced', c2: 'C2 Expert' };

const WRITING_ROADMAP = {};

CEFR_LEVELS.forEach((lvl) => {
  WRITING_ROADMAP[lvl] = Array.from({ length: 15 }, (_, i) => {
    const modeIndex = i % WRITING_MODES.length;
    const mode = WRITING_MODES[modeIndex];
    
    // Custom logic for titles based on level and mode
    let title = '';
    let description = '';
    const num = i + 1;

    if (lvl === 'a1') {
      if (mode.id === 'story_continuation') title = `Little Dog's Day ${num}`;
      else if (mode.id === 'picture_writing') title = `My Room ${num}`;
      else if (mode.id === 'letter_email') title = `A Note to Mum ${num}`;
      else title = `Basic Task ${num}`;
      description = 'Simple sentences and basic vocabulary.';
    } else if (lvl === 'a2') {
      title = `Daily Life ${num}`;
      description = 'Connecting sentences and common topics.';
    } else if (lvl === 'b1') {
      title = `Social Topics ${num}`;
      description = 'Expressing opinions and feelings.';
    } else if (lvl === 'b2') {
      title = `Professional Task ${num}`;
      description = 'Clear and detailed text on various subjects.';
    } else if (lvl === 'c1') {
      title = `Complex Issue ${num}`;
      description = 'Complex subjects with well-structured text.';
    } else {
      title = `Academic Mastery ${num}`;
      description = 'Precise and sophisticated writing.';
    }

    return {
      id: `w_${lvl}_${num}`,
      title,
      modeId: mode.id,
      emoji: mode.emoji,
      description,
      minWords: lvl === 'a1' ? 60 : lvl === 'a2' ? 80 : lvl === 'b1' ? 120 : lvl === 'b2' ? 150 : lvl === 'c1' ? 200 : 250,
      xp: lvl === 'a1' ? 30 : lvl === 'a2' ? 40 : lvl === 'b1' ? 50 : lvl === 'b2' ? 60 : lvl === 'c1' ? 80 : 100
    };
  });
});

router.get('/modes', auth, (req, res) => res.json(WRITING_MODES));

// ── Get Roadmap Library ─────────────────────────────────────────────────────
router.get('/roadmap', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('level completedWritingLessons');
    const completed = user?.completedWritingLessons || [];

    const library = {};
    CEFR_LEVELS.forEach(lvl => {
      const lessons = WRITING_ROADMAP[lvl] || [];
      
      const processedLessons = lessons.map((lesson, index) => {
        const isCompleted = completed.includes(lesson.id);
        let isUnlocked = false;
        
        if (isCompleted) isUnlocked = true;
        else if (lvl === 'a1' && index === 0) isUnlocked = true;
        else if (index > 0) isUnlocked = completed.includes(lessons[index - 1].id);
        else {
          const prevLvlIndex = CEFR_LEVELS.indexOf(lvl) - 1;
          if (prevLvlIndex >= 0) {
            const prevLvlLessons = WRITING_ROADMAP[CEFR_LEVELS[prevLvlIndex]];
            isUnlocked = completed.includes(prevLvlLessons[prevLvlLessons.length - 1].id);
          }
        }

        return { ...lesson, isCompleted, isUnlocked };
      });

      library[lvl] = {
        label: LEVEL_LABELS[lvl],
        lessons: processedLessons,
        progress: Math.round((processedLessons.filter(l => l.isCompleted).length / processedLessons.length) * 100)
      };
    });

    res.json({ library, completedCount: completed.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get Lesson Prompt ────────────────────────────────────────────────────────
router.post('/lesson-prompt', auth, async (req, res) => {
  try {
    const { lessonId } = req.body;
    let lesson = null;
    let cefrLevel = '';
    
    for (const [lvl, lessons] of Object.entries(WRITING_ROADMAP)) {
      lesson = lessons.find(l => l.id === lessonId);
      if (lesson) { cefrLevel = lvl; break; }
    }
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    const mode = WRITING_MODES.find(m => m.id === lesson.modeId);
    
    const promptInstructions = `Create a unique writing prompt for an English learner at ${LEVEL_LABELS[cefrLevel]} level.
Title: "${lesson.title}"
Mode: "${mode.label}"
Description: "${lesson.description}"

Return ONLY valid JSON:
{
  "title": "${lesson.title}",
  "topic": "${lesson.description}",
  "starter": "<first sentence if story, or headline if news, or situation if letter>",
  "task": "<clear instruction for the student, make it engaging and detailed>",
  "minWords": ${lesson.minWords},
  "context": "<additional background info if needed>",
  "characters": "<if creative_scene, else null>",
  "setting": "<if creative_scene, else null>",
  "situation": "<if letter_email, else null>",
  "headline": "<if news_article, else null>",
  "imageUrl": "<if picture_writing, use a high quality Unsplash URL related to the topic, else null>",
  "timeSeconds": ${lesson.modeId === 'timed_challenge' ? 300 : 0}
}`;

    const result = await generateJSON(promptInstructions);
    res.json({ ...result, lesson });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate lesson prompt' });
  }
});

router.post('/vocab-suggest', auth, async (req, res) => {
  try {
    const { word, topic } = req.body;
    const prompt = `Give 4 better synonyms for "${word}" when writing about "${topic}". Return ONLY JSON: {"suggestions": [{"word": "...", "definition": "..."}]}`;
    const result = await generateJSON(prompt);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── NEW: Generate custom AI prompt ───────────────────────────────────────────
router.post('/generate-custom-prompt', auth, async (req, res) => {
  try {
    const { topic, mode } = req.body;
    const user = await User.findById(req.user._id).select('level');
    const tier = getLevelTier(user?.level || 1);

    const prompt = `Create a unique writing prompt for an English learner at ${tier} level.
Topic: "${topic}"
Writing Mode: "${mode.replace('_', ' ')}"

Return ONLY valid JSON:
{
  "title": "<short engaging title>",
  "topic": "${topic}",
  "starter": "<first sentence if story, or headline if news, or situation if letter>",
  "task": "<clear instruction for the student>",
  "minWords": 80,
  "context": "<additional background info if needed>"
}`;

    const result = await generateJSON(prompt);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate custom prompt' });
  }
});

// ── NEW: Suggest next idea (AI Muse) ─────────────────────────────────────────
router.post('/suggest-idea', auth, async (req, res) => {
  try {
    const { text, prompt, mode } = req.body;
    const user = await User.findById(req.user._id).select('level');
    const tier = getLevelTier(user?.level || 1);

    const aiPrompt = `The student is writing a ${mode} about "${prompt}".
Current text: "${text}"
The student is stuck. Give 3 creative ideas or the next possible sentence to help them continue.
Level: ${tier} English.

Return ONLY valid JSON:
{
  "suggestions": ["<idea/sentence 1>", "<idea/sentence 2>", "<idea/sentence 3>"],
  "tip": "<short tip on how to expand the writing>"
}`;

    const result = await generateJSON(aiPrompt);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'The AI Muse is sleeping, try again!' });
  }
});

router.post('/submit', auth, async (req, res) => {
  try {
    const { text, lessonId, mode, promptData, timeSpent } = req.body;
    if (!text || text.trim().length === 0)
      return res.status(400).json({ message: 'Please write something.' });

    const user = await User.findById(req.user._id).select('level');
    const tier = getLevelTier(user?.level || 1);

    let topicLabel = promptData?.title || 'General Writing';

    const prompt = `You are an expert English language teacher. Evaluate this ${mode || 'essay'} writing by a ${tier}-level learner.
Topic: "${topicLabel}"
Text: "${text}"

Return ONLY JSON:
{
  "overallScore": <0-100>,
  "grammarScore": <0-100>,
  "vocabularyScore": <0-100>,
  "coherenceScore": <0-100>,
  "contentScore": <0-100>,
  "creativityScore": <0-100>,
  "feedback": "<2-3 sentences of encouraging specific feedback>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "correctedText": "<fully corrected version>",
  "sentenceAnalysis": [{"sentence": "<exact sentence>", "status": "correct|minor|major", "note": "<brief note>"}],
  "modelAnswer": "<model response 120-180 words>",
  "vocabularyHighlights": [{"word": "<good word>", "note": "<why effective>"}, {"word": "<weak word>", "suggestion": "<better word>"}],
  "wordCount": <number>,
  "cefr": "<A1/A2/B1/B2/C1/C2>",
  "nextLevelTip": "<one specific tip to reach next CEFR level>"
}`;

    let evaluation;
    try {
      evaluation = await generateJSON(prompt);
    } catch (err) {
      evaluation = { overallScore: 70, grammarScore: 70, vocabularyScore: 70, coherenceScore: 70, contentScore: 70, creativityScore: 70, feedback: 'Good effort! Keep practising.', strengths: ['Attempted the task', 'Shows effort', 'Clear ideas'], improvements: ['Improve grammar', 'Expand vocabulary', 'Better structure'], correctedText: text, sentenceAnalysis: [], modelAnswer: '', vocabularyHighlights: [], wordCount: text.split(' ').length, cefr: 'B1', nextLevelTip: 'Use more varied sentence structures.' };
    }

    let xpEarned = Math.floor(evaluation.overallScore / 10) * 5 + 10;
    
    // Check for Mission Word
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const mission = MISSIONS[dayOfYear % MISSIONS.length];
    let missionBonus = 0;
    if (text.toLowerCase().includes(mission.word.toLowerCase())) {
      missionBonus = mission.bonus;
      xpEarned += missionBonus;
    }

    if (mode === 'timed_challenge') xpEarned += 15;
    if (mode === 'creative_scene')  xpEarned += 10;
    if (evaluation.overallScore >= 90) xpEarned += 20;
    const coinsEarned = Math.floor(xpEarned / 2);

    await User.findByIdAndUpdate(req.user._id, { 
      $inc: { xp: xpEarned, coins: coinsEarned, 'stats.writingCompleted': 1, 'stats.totalScore': evaluation.overallScore },
      ...(evaluation.overallScore >= 70 && lessonId ? { $addToSet: { completedWritingLessons: lessonId } } : {})
    });

    const activity = new Activity({ userId: req.user._id, type: 'writing', topic: topicLabel, score: evaluation.overallScore, maxScore: 100, xpEarned, coinsEarned, timeSpent: timeSpent || 0, feedback: evaluation.feedback, details: { ...evaluation, mode, lessonId } });
    await activity.save();
    
    await updateStreak(req.user._id);
    res.json({ evaluation, xpEarned, coinsEarned });
  } catch (err) {
    console.error('Writing submit error:', err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/improve', auth, async (req, res) => {
  try {
    const { sentence } = req.body;
    if (!sentence) return res.status(400).json({ message: 'No sentence provided.' });
    const prompt = `Improve this English sentence: "${sentence}". Return ONLY JSON: {"improved": "<improved sentence>", "explanation": "<what changed and why in 1 sentence>"}`;
    const result = await generateJSON(prompt);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
