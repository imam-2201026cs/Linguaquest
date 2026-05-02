import mongoose from 'mongoose';

const dailyChallengeSchema = new mongoose.Schema({
  dateString: { type: String, required: true, unique: true }, // Format: "YYYY-MM-DD"
  questions: [{
    question: String,
    options: [String],
    correct: Number,
    explanation: String
  }],
  totalCompletions: { type: Number, default: 0 },
  totalStage2Completions: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const DailyChallenge = mongoose.model('DailyChallenge', dailyChallengeSchema);

const challengeSubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'DailyChallenge', required: true },
  dateString: { type: String, required: true },
  score: { type: Number, required: true }, // out of 10
  questionsAnswered: { type: Number, required: true }, // 5 or 10
  completedAt: { type: Date, default: Date.now }
});

// Ensure a user can only submit once per day
challengeSubmissionSchema.index({ userId: 1, dateString: 1 }, { unique: true });

export const ChallengeSubmission = mongoose.model('ChallengeSubmission', challengeSubmissionSchema);
