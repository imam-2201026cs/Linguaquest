import express from 'express';
import auth from '../middleware/auth.js';
import { generateJSON } from '../middleware/groq.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { updateStreak } from '../middleware/streak.js';

const router = express.Router();

const TOPICS = [
  // ── Beginner ──
  { id: 1,  title: 'My Favourite Place',       level: 'beginner',     prompt: 'Describe your favourite place and why you love it.' },
  { id: 2,  title: 'A Memorable Journey',       level: 'beginner',     prompt: 'Describe a memorable trip or journey you have taken.' },
  { id: 3,  title: 'My Dream Job',              level: 'beginner',     prompt: 'Describe your dream job and the skills you need for it.' },
  { id: 4,  title: 'My Best Friend',            level: 'beginner',     prompt: 'Write about your best friend — who they are and what makes them special.' },
  { id: 5,  title: 'My Daily Routine',          level: 'beginner',     prompt: 'Describe what a typical day in your life looks like.' },
  { id: 6,  title: 'A Hobby I Love',            level: 'beginner',     prompt: 'Write about a hobby you enjoy and explain why it makes you happy.' },
  { id: 7,  title: 'My Favourite Food',         level: 'beginner',     prompt: 'Describe your favourite food, how it is made, and why you love it.' },
  { id: 8,  title: 'A Person I Admire',         level: 'beginner',     prompt: 'Write about someone you admire and explain the qualities that inspire you.' },
  { id: 9,  title: 'My Hometown',               level: 'beginner',     prompt: 'Describe your hometown — its people, places, and what makes it unique.' },
  { id: 10, title: 'A Childhood Memory',        level: 'beginner',     prompt: 'Describe a happy or interesting memory from your childhood.' },

  // ── Intermediate ──
  { id: 11, title: 'Technology in Daily Life',  level: 'intermediate', prompt: 'How has technology changed our daily lives?' },
  { id: 12, title: 'Future of Education',       level: 'intermediate', prompt: 'How will education look different in 2050?' },
  { id: 13, title: 'Social Media Impact',       level: 'intermediate', prompt: 'Discuss the positive and negative impacts of social media on society.' },
  { id: 14, title: 'City Life vs Village Life', level: 'intermediate', prompt: 'Compare the advantages and disadvantages of living in a city versus a village.' },
  { id: 15, title: 'The Importance of Sports',  level: 'intermediate', prompt: 'Why is sport important for physical and mental well-being? Discuss with examples.' },
  { id: 16, title: 'Online Shopping Trends',    level: 'intermediate', prompt: 'How has online shopping changed consumer behaviour? What are its pros and cons?' },
  { id: 17, title: 'Work-Life Balance',         level: 'intermediate', prompt: 'How important is work-life balance, and how can people achieve it in modern careers?' },
  { id: 18, title: 'Travelling Abroad',         level: 'intermediate', prompt: 'What are the benefits of travelling to other countries? Share your views and experiences.' },
  { id: 19, title: 'Mobile Phones in Schools',  level: 'intermediate', prompt: 'Should mobile phones be allowed in schools? Argue both sides and give your opinion.' },
  { id: 20, title: 'Healthy Lifestyle Choices', level: 'intermediate', prompt: 'What habits contribute to a healthy lifestyle? How can people be encouraged to adopt them?' },

  // ── Advanced ──
  { id: 21, title: 'Climate Change Solutions',       level: 'advanced', prompt: 'What are the most effective solutions to climate change? Evaluate different approaches.' },
  { id: 22, title: 'Artificial Intelligence Ethics', level: 'advanced', prompt: 'What ethical challenges does artificial intelligence present to society?' },
  { id: 23, title: 'Globalisation and Culture',      level: 'advanced', prompt: 'To what extent does globalisation threaten local cultures and identities?' },
  { id: 24, title: 'Universal Basic Income',         level: 'advanced', prompt: 'Critically evaluate the idea of a universal basic income — its feasibility and implications.' },
  { id: 25, title: 'The Future of Democracy',        level: 'advanced', prompt: 'Is democracy under threat in the modern world? What reforms might strengthen it?' },
  { id: 26, title: 'Space Exploration',              level: 'advanced', prompt: 'Should governments invest more in space exploration, or focus resources on Earth\'s problems?' },
  { id: 27, title: 'Mental Health Stigma',           level: 'advanced', prompt: 'How can societies better address the stigma surrounding mental health issues?' },
  { id: 28, title: 'The Role of Media',              level: 'advanced', prompt: 'Analyse the responsibility of the media in shaping public opinion and political outcomes.' },
  { id: 29, title: 'Automation and Employment',      level: 'advanced', prompt: 'How will increasing automation affect the job market, and how should workers and governments respond?' },
  { id: 30, title: 'Biodiversity Crisis',            level: 'advanced', prompt: 'Why is biodiversity loss considered a critical global crisis, and what actions are needed to reverse it?' },
];

router.get('/topics', auth, (req, res) => {
  res.json(TOPICS);
});

router.post('/submit', auth, async (req, res) => {
  try {
    const { text, topicId, timeSpent } = req.body;
    if (!text || text.trim().length === 0)
      return res.status(400).json({ message: 'Please write something.' });

    const topic = TOPICS.find(t => t.id === topicId) || TOPICS[0];

    const prompt = `You are an English language teacher. Evaluate the following writing submission for the topic: "${topic.title}".

Text: "${text}"

Provide a detailed evaluation in JSON format with these exact fields:
{
  "overallScore": <number 0-100>,
  "grammarScore": <number 0-100>,
  "vocabularyScore": <number 0-100>,
  "coherenceScore": <number 0-100>,
  "contentScore": <number 0-100>,
  "feedback": "<overall encouraging feedback in 2-3 sentences>",
  "strengths": ["<list every specific strength found, minimum 3 points, covering grammar, vocabulary, structure, content, coherence>"],
  "improvements": ["<list EVERY specific area needing improvement found in the text — do not limit to 2 or 3. Cover ALL issues: grammar rules, tense consistency, subject-verb agreement, vocabulary range, sentence variety, punctuation, spelling, coherence, paragraph structure, word choice, article usage, prepositions, comparatives, connectives, and any other errors you find. Each point must be specific and actionable.>"],
  "correctedText": "<the corrected version of the text>",
  "sentenceAnalysis": [
    { "sentence": "<exact sentence from text>", "status": "correct|minor|major", "note": "<brief note>" }
  ],
  "modelAnswer": "<a well-written model answer for this topic in 150-200 words>",
  "wordCount": <number>,
  "cefr": "<A1/A2/B1/B2/C1/C2>"
}
Return ONLY the JSON, no markdown.`;

    let evaluation;
    try {
      evaluation = await generateJSON(prompt);
    } catch (err) {
      console.error('Writing Evaluation Error:', err);
      // Fallback in case of parsing error
      evaluation = { 
        overallScore: 70, 
        feedback: "We encountered an issue processing your writing, but here is a default evaluation.", 
        grammarScore: 70, 
        vocabularyScore: 70, 
        coherenceScore: 70, 
        contentScore: 70,
        strengths: ["Attempted the task"],
        improvements: ["Check for consistency"],
        correctedText: text,
        sentenceAnalysis: [],
        modelAnswer: "A model answer could not be generated at this time.",
        wordCount: text.split(' ').length,
        cefr: "B1"
      };
    }

    const xpEarned = Math.floor(evaluation.overallScore / 10) * 5 + 10;
    const coinsEarned = Math.floor(xpEarned / 2);

    const activity = new Activity({
      userId: req.user._id,
      type: 'writing',
      topic: topic.title,
      score: evaluation.overallScore,
      maxScore: 100,
      xpEarned,
      coinsEarned,
      timeSpent: timeSpent || 0,
      feedback: evaluation.feedback,
      details: evaluation
    });
    await activity.save();

    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        xp: xpEarned,
        coins: coinsEarned,
        'stats.writingCompleted': 1,
        'stats.totalScore': evaluation.overallScore
      }
    });
    await updateStreak(req.user._id);

    res.json({ evaluation, xpEarned, coinsEarned });
  } catch (err) {
    console.error('Writing route error:', err);
    res.status(500).json({ message: err.message });
  }
});

// "Improve This" AI endpoint
router.post('/improve', auth, async (req, res) => {
  try {
    const { sentence } = req.body;
    if (!sentence) return res.status(400).json({ message: 'No sentence provided.' });

    const prompt = `You are an expert English writing coach. Improve the following sentence to make it more sophisticated, clear, and grammatically perfect. Return ONLY a JSON object with this format:
{
  "improved": "<the improved sentence>",
  "explanation": "<brief explanation of changes in 1 sentence>"
}
Sentence: "${sentence}"
Return ONLY the JSON, no markdown.`;

    const result = await generateJSON(prompt);
    res.json(result);
  } catch (err) {
    console.error('Improve endpoint error:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
