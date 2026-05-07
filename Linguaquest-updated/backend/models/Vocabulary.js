import mongoose from 'mongoose';

const vocabularySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  word: { type: String, required: true },
  definition: { type: String, required: true },
  example: { type: String, default: '' },
  source: { type: String, default: 'manual' }, // manual, reading, listening
  
  // Spaced Repetition System fields
  status: { type: String, enum: ['new', 'learning', 'graduated'], default: 'new' },
  interval: { type: Number, default: 0 }, // Interval in days
  easeFactor: { type: Number, default: 2.5 },
  nextReviewDate: { type: Date, default: Date.now },
  
  createdAt: { type: Date, default: Date.now }
});

// Ensure a user can't add the same word twice
vocabularySchema.index({ userId: 1, word: 1 }, { unique: true });

export default mongoose.model('Vocabulary', vocabularySchema);
