import { generateJSON } from './middleware/openrouter.js';

const test = async () => {
  try {
    console.log('Testing Puter AI JSON generation...');
    const result = await generateJSON('Generate a list of 2 English words and their meanings in JSON format.');
    console.log('Result:', JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Test Failed:', err);
    process.exit(1);
  }
};

test();
