import mongoose from 'mongoose';

const errorSchema = new mongoose.Schema({
  original: { type: String, default: '' },
  correction: { type: String, default: '' },
  explanation: { type: String, default: '' },
  type: { type: String, default: 'Grammar' }
}, { _id: false });

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  errors: [errorSchema],
  analysis: {
    grammarScore: { type: Number, default: 85 },
    vocabularyScore: { type: Number, default: 80 },
    formalityScore: { type: Number, default: 80 },
    relevanceScore: { type: Number, default: 85 }
  }
});

const conversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scenarioId: { type: String, required: true },
  scenarioTitle: String,
  scenarioCategory: String,
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'challenge'], default: 'intermediate' },
  mode: { type: String, enum: ['guided', 'free', 'correction', 'silent'], default: 'free' },
  messages: [messageSchema],
  status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' },
  duration: { type: Number, default: 0 },
  reportCard: {
    overallScore: Number,
    grammarScore: Number,
    vocabularyScore: Number,
    fluencyScore: Number,
    formalityScore: Number,
    confidenceScore: Number,
    relevanceScore: Number,
    strengths: [String],
    improvements: [String],
    corrections: [{ original: String, correction: String, explanation: String }],
    cefrLevel: String,
    scenarioOutcome: String,
    tips: [String],
    totalErrors: Number,
    totalMessages: Number
  },
  xpEarned: { type: Number, default: 0 },
  coinsEarned: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  completedAt: Date,
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
});

export default mongoose.model('Conversation', conversationSchema);
