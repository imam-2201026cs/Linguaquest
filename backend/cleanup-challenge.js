import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { DailyChallenge } from './models/DailyChallenge.js';

dotenv.config();

const getTodayString = () => {
  const now = new Date();
  const istOffset = 330 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().split('T')[0];
};

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const today = getTodayString();
    console.log('Cleaning up challenge for:', today);
    const result = await DailyChallenge.deleteOne({ dateString: today });
    console.log('Deleted:', result.deletedCount, 'documents');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

cleanup();
