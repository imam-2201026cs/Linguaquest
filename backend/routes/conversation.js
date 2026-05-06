import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import auth from '../middleware/auth.js';
import { generateContent, generateJSON } from '../middleware/ai.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import { SCENARIOS, getScenarioById } from '../data/scenarios.js';

const router = express.Router();

// Multer: store resume in memory for parsing (no disk writes needed)
const resumeUpload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/octet-stream' // Some browsers send PDF as octet-stream
    ];
    // Also allow by extension as fallback
    const ext = file.originalname.toLowerCase().split('.').pop();
    const allowedExts = ['pdf', 'txt', 'doc', 'docx'];
    cb(null, allowed.includes(file.mimetype) || allowedExts.includes(ext));
  }
});

// Upload & parse resume — extract key skills/experience summary via AI
router.post('/resume/parse', auth, resumeUpload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    let resumeText = '';

    const ext = req.file.originalname.toLowerCase().split('.').pop();
    const isPDF = req.file.mimetype === 'application/pdf' || ext === 'pdf';
    const isText = req.file.mimetype === 'text/plain' || ext === 'txt';
    
    if (isPDF) {
      // Use pdf-parse to extract clean text from binary PDF
      console.log('Parsing PDF, buffer size:', req.file.buffer.length);
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text;
      console.log('PDF text extracted, length:', resumeText.length);
    } else if (isText) {
      resumeText = req.file.buffer.toString('utf-8');
    } else {
      // DOC/DOCX — try to extract readable strings from the buffer
      resumeText = req.file.buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ');
    }

    if (!resumeText || resumeText.trim().length < 30) {
      return res.status(422).json({ message: 'Could not extract readable text from this file. Please try a .txt or PDF version.' });
    }

    // Trim to first 6000 chars to stay within token limits
    resumeText = resumeText.trim().slice(0, 6000);

    const prompt = `You are a resume parser. Extract key information from the resume text below.
Return ONLY a valid JSON object with these keys:
{
  "name": "candidate name or empty string",
  "skills": ["skill1", "skill2", ...],
  "experience": "brief summary of work experience",
  "level": "junior/mid/senior based on experience",
  "summary": "2-3 sentence professional summary of the candidate"
}

Resume text:
${resumeText}`;

    const parsed = await generateJSON(prompt);
    res.json({ success: true, data: parsed, fileName: req.file.originalname });
  } catch (err) {
    console.error('Resume parse error:', err);
    res.status(500).json({ message: 'Failed to parse resume. Please try a plain text (.txt) version.' });
  }
});

// Start a Professional Mock Interview session
router.post('/professional/start', auth, async (req, res) => {
  try {
    const { role, round, duration, interviewerId, resumeData, difficulty = 'intermediate' } = req.body;

    if (!role) return res.status(400).json({ message: 'Role is required' });
    if (!resumeData) return res.status(400).json({ message: 'Resume is required for professional interviews. Please upload your resume first.' });

    const roundDescriptions = {
      warmup: 'a warm-up, non-technical round to ease into the interview — ask casual introductory questions about background and motivation',
      coding: 'a coding/technical programming round — ask about algorithms, data structures, system design, or coding challenges relevant to this role',
      technical: 'a role-related technical round — ask in-depth questions about technical skills, tools, and domain expertise required for this role',
      behavioral: 'a behavioral/HR round — ask STAR-method questions about past experiences, teamwork, conflict resolution, and soft skills',
    };

    const interviewerPersonas = {
      payal: 'Payal, a warm and encouraging Indian interviewer who makes candidates feel comfortable while being thorough',
      emma: 'Emma, a professional US-based HR specialist known for in-depth behavioral questions and keen eye for communication skills',
      john: 'John, a senior technical lead from the US who asks precise, challenging questions and values clear, structured answers',
      kapil: 'Kapil, an experienced Indian hiring manager who blends technical and cultural fit questions to find the right candidate',
    };

    const resumeContext = resumeData 
      ? `The candidate has provided their resume. Key details: ${resumeData.summary || ''}. Skills: ${(resumeData.skills || []).join(', ')}.`
      : 'No resume was provided by the candidate.';

    const openingPrompt = `You are ${interviewerPersonas[interviewerId] || 'a professional interviewer'}.
You are conducting ${roundDescriptions[round] || 'a general interview'} for the position of: ${role}.
Duration: approximately ${duration} minutes.
${resumeContext}

RULES:
1. Stay completely in character as the interviewer at all times
2. Ask ONE clear question at a time
3. Keep responses professional, concise, and focused
4. React naturally to candidate answers before asking the next question
5. Be realistic — this is a real interview simulation
6. Tailor questions specifically to the role: ${role}

Start the interview with a professional greeting and your first question. Be natural and engaging.`;

    const openingMessage = await generateContent(openingPrompt);

    // Store the context in a generic conversation record
    const conversation = new Conversation({
      userId: req.user._id,
      scenarioId: `professional-${round}-${role.toLowerCase().replace(/\s+/g, '-')}`,
      scenarioTitle: `${role} — ${round.charAt(0).toUpperCase() + round.slice(1)} Interview`,
      scenarioCategory: 'Professional',
      difficulty,
      mode: 'free',
      messages: [{ role: 'assistant', content: openingMessage, errors: [] }],
      status: 'active',
      metadata: { role, round, duration, interviewerId, isProfessional: true, resumeData }
    });

    await conversation.save();
    res.json({ conversationId: conversation._id, openingMessage });
  } catch (err) {
    console.error('Professional start error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get all scenarios
router.get('/scenarios', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('level');
    const scenariosWithStatus = SCENARIOS.map(s => ({
      ...s,
      unlocked: (user?.level || 1) >= s.unlockLevel,
      bestScore: null
    }));

    // Fetch best scores for each scenario
    const completedConvos = await Conversation.find({
      userId: req.user._id,
      status: 'completed'
    }).select('scenarioId reportCard.overallScore');

    const bestScores = {};
    completedConvos.forEach(c => {
      if (!bestScores[c.scenarioId] || c.reportCard?.overallScore > bestScores[c.scenarioId]) {
        bestScores[c.scenarioId] = c.reportCard?.overallScore || 0;
      }
    });

    const result = scenariosWithStatus.map(s => ({
      ...s,
      bestScore: bestScores[s.id] || null,
      timesPlayed: completedConvos.filter(c => c.scenarioId === s.id).length
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start a new conversation
router.post('/start', auth, async (req, res) => {
  try {
    const { scenarioId, difficulty = 'intermediate', mode = 'free' } = req.body;
    const scenario = getScenarioById(scenarioId);
    if (!scenario) return res.status(404).json({ message: 'Scenario not found' });

    // Check user level
    const user = await User.findById(req.user._id).select('level');
    if ((user?.level || 1) < scenario.unlockLevel) {
      return res.status(403).json({ message: `Reach Level ${scenario.unlockLevel} to unlock this scenario.` });
    }

    // Abandon any existing active conversation
    await Conversation.updateMany(
      { userId: req.user._id, status: 'active' },
      { status: 'abandoned' }
    );

    // Generate opening message from AI
    const difficultyInstructions = {
      beginner: 'Use simple vocabulary and short sentences. Speak slowly and clearly. Be very patient and encouraging.',
      intermediate: 'Use natural vocabulary. Maintain realistic pace. Be moderately challenging.',
      advanced: 'Use complex vocabulary, idioms, and natural speech patterns. Be quite challenging.',
      challenge: 'Use advanced vocabulary, interrupt occasionally, use colloquialisms, be very demanding and realistic.'
    };

    const modeInstructions = {
      guided: 'After each user message, give a hint on what to say next in parentheses like: (Tip: Try saying "I would like to...")',
      free: 'Do not give hints. Respond naturally in character.',
      correction: 'After each user message, before responding in character, add a correction note in brackets like: [Correction: "I am boring" should be "I am bored"]. Then continue in character.',
      silent: 'Respond only in character. Secretly note errors but do not mention them.'
    };

    const openingPrompt = `You are playing the role of: ${scenario.role}
Scenario: ${scenario.title}
The user's role: ${scenario.userRole}

Context: ${scenario.context}

Difficulty: ${difficulty} — ${difficultyInstructions[difficulty]}
Mode: ${mode} — ${modeInstructions[mode]}

IMPORTANT RULES:
1. Stay in character at ALL times
2. Keep responses under 5 sentences
3. Move the conversation forward naturally
4. Be realistic and engaging

Start the conversation naturally as your character. This is your opening line to begin the scenario. Be welcoming but stay in character.`;

    const openingMessage = await generateContent(openingPrompt);

    const conversation = new Conversation({
      userId: req.user._id,
      scenarioId,
      scenarioTitle: scenario.title,
      scenarioCategory: scenario.category,
      difficulty,
      mode,
      messages: [{
        role: 'assistant',
        content: openingMessage,
        errors: []
      }],
      status: 'active'
    });

    await conversation.save();
    res.json({ conversationId: conversation._id, openingMessage, scenario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Send a message
router.post('/message', auth, async (req, res) => {
  try {
    const { conversationId, message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message cannot be empty' });

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user._id,
      status: 'active'
    });

    if (!conversation) return res.status(404).json({ message: 'Active conversation not found' });

    let prompt = '';

    if (conversation.metadata?.isProfessional) {
      const { role, round, duration, interviewerId, resumeData } = conversation.metadata;
      
      const roundDescriptions = {
        warmup: 'a warm-up, non-technical round to ease into the interview — ask casual introductory questions about background and motivation',
        coding: 'a coding/technical programming round — ask about algorithms, data structures, system design, or coding challenges relevant to this role',
        technical: 'a role-related technical round — ask in-depth questions about technical skills, tools, and domain expertise required for this role',
        behavioral: 'a behavioral/HR round — ask STAR-method questions about past experiences, teamwork, conflict resolution, and soft skills',
      };

      const interviewerPersonas = {
        payal: 'Payal, a warm and encouraging Indian interviewer who makes candidates feel comfortable while being thorough',
        emma: 'Emma, a professional US-based HR specialist known for in-depth behavioral questions and keen eye for communication skills',
        john: 'John, a senior technical lead from the US who asks precise, challenging questions and values clear, structured answers',
        kapil: 'Kapil, an experienced Indian hiring manager who blends technical and cultural fit questions to find the right candidate',
      };

      const resumeContext = resumeData 
        ? `The candidate has provided their resume. Key details: ${resumeData.summary || ''}. Skills: ${(resumeData.skills || []).join(', ')}.`
        : 'No resume was provided.';

      const historyText = conversation.messages.slice(-8).map(m =>
        `${m.role === 'assistant' ? 'INTERVIEWER' : 'CANDIDATE'}: ${m.content}`
      ).join('\n');

      prompt = `You are ${interviewerPersonas[interviewerId] || 'a professional interviewer'}.
You are conducting ${roundDescriptions[round] || 'a general interview'} for the position of: ${role}.
Duration: approximately ${duration} minutes.
${resumeContext}

Recent conversation:
${historyText}
CANDIDATE: ${message}

RULES:
1. Stay completely in character as the interviewer
2. Ask ONE clear follow-up question based on the candidate's last answer and their resume
3. Keep responses professional, concise, and focused
4. Tailor your response to the role of ${role}

At the VERY END of your response, add a JSON analysis block for the CANDIDATE's last message inside a markdown code block.`;

    } else {
      // Standard Scenario Mode
      const scenario = getScenarioById(conversation.scenarioId);
      if (!scenario) return res.status(404).json({ message: 'Scenario not found' });

      const difficultyInstructions = {
        beginner: 'Use simple vocabulary and short sentences. Be very patient.',
        intermediate: 'Use natural vocabulary. Be moderately challenging.',
        advanced: 'Use complex vocabulary and idioms. Be quite challenging.',
        challenge: 'Be very demanding, use advanced language, can interrupt.'
      };

      const modeInstructions = {
        guided: 'After responding in character, add a hint in parentheses: (Tip: You could say "...")',
        free: 'Respond only in character. No hints.',
        correction: 'FIRST note any grammar errors in [Correction: ...] format, THEN respond in character.',
        silent: 'Respond only in character.'
      };

      const historyText = conversation.messages.slice(-8).map(m =>
        `${m.role === 'assistant' ? 'YOU (in character)' : 'USER'}: ${m.content}`
      ).join('\n');

      prompt = `You are playing: ${scenario.role}
Scenario: ${scenario.title}
Context: ${scenario.context}
Difficulty: ${conversation.difficulty} — ${difficultyInstructions[conversation.difficulty]}
Mode: ${conversation.mode} — ${modeInstructions[conversation.mode]}

Recent conversation:
${historyText}
USER: ${message}

At the VERY END of your response, add a JSON analysis block for the USER's last message inside a markdown code block.`;
    }

    prompt += `
Use this exact JSON structure:
\`\`\`json
{
  "errors": [
    {
      "original": "exact wrong phrase",
      "correction": "correct version",
      "explanation": "brief rule",
      "type": "Grammar|Vocabulary|Style"
    }
  ],
  "grammarScore": 85,
  "vocabularyScore": 80,
  "formalityScore": 75,
  "relevanceScore": 90
}
\`\`\`
If no errors, use "errors": []. Stay in character for the response text.`;

    const rawResponse = await generateContent(prompt);

    // Parse out analysis
    let aiMessage = rawResponse;
    let errors = [];
    let analysis = { grammarScore: 85, vocabularyScore: 80, formalityScore: 80, relevanceScore: 85 };

    // Try to find JSON in markdown code block first, then fallback to ANALYSIS: prefix or raw braces
    const jsonMatch = rawResponse.match(/```json\s*(\{[\s\S]*\})\s*```/) || 
                     rawResponse.match(/ANALYSIS:(\{[\s\S]*\})/) ||
                     rawResponse.match(/(\{[\s\S]*\})/);

    if (jsonMatch) {
      try {
        const jsonStr = jsonMatch[1].trim();
        const parsed = JSON.parse(jsonStr);
        
        // Strictly sanitize and validate errors
        if (parsed.errors && Array.isArray(parsed.errors)) {
          errors = parsed.errors
            .filter(err => err && typeof err === 'object')
            .map(err => ({
              original: String(err.original || err.wrong || '').trim(),
              correction: String(err.correction || err.right || '').trim(),
              explanation: String(err.explanation || err.reason || '').trim(),
              type: String(err.type || 'Grammar').trim()
            }))
            .filter(err => err.original && err.original !== '...');
        }

        analysis = {
          grammarScore: Math.min(100, Math.max(0, Number(parsed.grammarScore) || 85)),
          vocabularyScore: Math.min(100, Math.max(0, Number(parsed.vocabularyScore) || 80)),
          formalityScore: Math.min(100, Math.max(0, Number(parsed.formalityScore) || 80)),
          relevanceScore: Math.min(100, Math.max(0, Number(parsed.relevanceScore) || 85))
        };

        // Clean up aiMessage by removing the JSON block and any prefixes
        aiMessage = rawResponse
          .replace(/```json[\s\S]*```/, '')
          .replace(/ANALYSIS:[\s\S]*$/, '')
          .split(/\{[\s\S]*\}/)[0]
          .trim();
        
        if (!aiMessage) aiMessage = rawResponse.split('\n')[0]; // Fallback if we accidentally stripped everything
      } catch (e) {
        console.error('Analysis parse error:', e.message);
        aiMessage = rawResponse.replace(/```json[\s\S]*```/, '').replace(/ANALYSIS:[\s\S]*$/, '').trim();
      }
    }

    // Save both messages
    conversation.messages.push({
      role: 'user',
      content: message,
      errors,
      analysis
    });
    conversation.messages.push({
      role: 'assistant',
      content: aiMessage,
      errors: []
    });

    await conversation.save();

    res.json({
      reply: aiMessage,
      errors,
      analysis,
      messageCount: conversation.messages.filter(m => m.role === 'user').length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// End conversation and generate report card
router.post('/end', auth, async (req, res) => {
  try {
    const { conversationId, duration } = req.body;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user._id
    });

    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    let scenario = getScenarioById(conversation.scenarioId);
    
    // Fallback for professional interviews which have dynamic IDs not in SCENARIOS data
    if (!scenario && conversation.metadata?.isProfessional) {
      scenario = {
        title: conversation.scenarioTitle || 'Professional Interview',
        userRole: 'Candidate',
        outcomes: {
          good: "Outstanding performance! You've demonstrated all the key qualities we're looking for.",
          average: "Good effort. You have the right foundation, but could refine some of your answers.",
          bad: "We appreciate your time, but we've decided to move forward with other candidates at this stage."
        }
      };
    }

    if (!scenario) return res.status(404).json({ message: 'Scenario details not found' });

    const userMessages = conversation.messages.filter(m => m.role === 'user');

    if (userMessages.length < 2) {
      return res.status(400).json({ message: 'Have at least 2 exchanges before ending.' });
    }

    // Collect all errors
    const allErrors = userMessages.flatMap(m => m.errors || []);

    // Calculate average scores from messages
    const avgGrammar = Math.round(userMessages.reduce((s, m) => s + (m.analysis?.grammarScore || 80), 0) / userMessages.length);
    const avgVocab = Math.round(userMessages.reduce((s, m) => s + (m.analysis?.vocabularyScore || 80), 0) / userMessages.length);
    const avgFormality = Math.round(userMessages.reduce((s, m) => s + (m.analysis?.formalityScore || 80), 0) / userMessages.length);
    const avgRelevance = Math.round(userMessages.reduce((s, m) => s + (m.analysis?.relevanceScore || 80), 0) / userMessages.length);

    // Full transcript for Gemini analysis
    const transcript = conversation.messages.map(m =>
      `${m.role === 'assistant' ? 'AI' : 'USER'}: ${m.content}`
    ).join('\n');

    const reportPrompt = `You are an expert English language assessor. Analyze this conversation and provide a detailed report card.

Scenario: ${scenario.title} (${conversation.difficulty} level)
User Role: ${scenario.userRole}

Full Transcript:
${transcript}

Provide evaluation as JSON:
{
  "overallScore": <0-100>,
  "fluencyScore": <0-100>,
  "confidenceScore": <0-100>,
  "strengths": ["<specific strength from the conversation>", "<another strength>", "<third strength>"],
  "improvements": ["<specific thing to improve>", "<another improvement>"],
  "corrections": [
    {"original": "<exact wrong phrase used>", "correction": "<correct version>", "explanation": "<grammar rule>"}
  ],
  "cefrLevel": "<A1/A2/B1/B2/C1/C2>",
  "scenarioOutcome": "<based on performance: use one of the scenario outcome messages: ${JSON.stringify(scenario.outcomes)}>",
  "tips": ["<specific tip for this scenario>", "<another tip>"]
}

Be specific and reference actual things said in the conversation. Return ONLY JSON.`;

    let reportData;
    try {
      reportData = await generateJSON(reportPrompt);
    } catch {
      reportData = {
        overallScore: Math.round((avgGrammar + avgVocab + avgFormality + avgRelevance) / 4),
        fluencyScore: avgGrammar,
        confidenceScore: avgRelevance,
        strengths: ['Completed the conversation scenario', 'Engaged with the AI character', 'Practiced real-world English'],
        improvements: ['Focus on grammar accuracy', 'Expand vocabulary usage'],
        corrections: allErrors.slice(0, 5),
        cefrLevel: avgGrammar >= 85 ? 'B2' : avgGrammar >= 70 ? 'B1' : 'A2',
        scenarioOutcome: scenario.outcomes.average,
        tips: ['Practice this scenario again at a higher difficulty', 'Focus on formal vocabulary']
      };
    }

    const overallScore = reportData.overallScore || 70;
    const xpEarned = Math.floor(overallScore / 10) * 8 + (userMessages.length * 2) + 20;
    const coinsEarned = Math.floor(xpEarned / 2);

    const reportCard = {
      overallScore,
      grammarScore: avgGrammar,
      vocabularyScore: avgVocab,
      fluencyScore: reportData.fluencyScore || avgGrammar,
      formalityScore: avgFormality,
      confidenceScore: reportData.confidenceScore || avgRelevance,
      relevanceScore: avgRelevance,
      strengths: reportData.strengths || [],
      improvements: reportData.improvements || [],
      corrections: reportData.corrections || allErrors.slice(0, 5),
      cefrLevel: reportData.cefrLevel || 'B1',
      scenarioOutcome: reportData.scenarioOutcome || scenario.outcomes.average,
      tips: reportData.tips || [],
      totalErrors: allErrors.length,
      totalMessages: userMessages.length
    };

    conversation.reportCard = reportCard;
    conversation.status = 'completed';
    conversation.duration = duration || 0;
    conversation.xpEarned = xpEarned;
    conversation.coinsEarned = coinsEarned;
    conversation.completedAt = new Date();
    await conversation.save();

    // Update user XP
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { xp: xpEarned, coins: coinsEarned, 'stats.conversationsCompleted': 1 }
    });

    res.json({ reportCard, xpEarned, coinsEarned, conversationId: conversation._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get conversation history
router.get('/history', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      userId: req.user._id,
      status: 'completed'
    }).select('-messages').sort({ completedAt: -1 }).limit(20);
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single conversation with transcript
router.get('/:id', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!conversation) return res.status(404).json({ message: 'Not found' });
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
