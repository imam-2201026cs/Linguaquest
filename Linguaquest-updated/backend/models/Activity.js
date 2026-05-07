import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['writing', 'listening', 'reading', 'grammar'],
    required: true 
  },
  topic: String,
  score: { type: Number, default: 0 },
  maxScore: { type: Number, default: 100 },
  xpEarned: { type: Number, default: 0 },
  coinsEarned: { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 }, // seconds
  feedback: String,
  details: mongoose.Schema.Types.Mixed,
  completedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Activity', activitySchema);
