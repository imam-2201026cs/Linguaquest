import { generateJSON } from './backend/middleware/gemini.js';

const text = "She don't likes to play tennis, but she enjoy swimming in the pool.";
const prompt = `You are an expert English grammar checker. Analyze this text for grammar mistakes:

"${text}"

Provide a detailed evaluation in JSON format with these exact fields:
{
  "hasErrors": <true/false>,
  "overallScore": <0-100, grammar quality score>,
  "correctedText": "<fully corrected version>",
  "errors": [
    {
      "type": "<Grammar/Spelling/Punctuation/Style>",
      "original": "<wrong phrase>",
      "correction": "<correct phrase>",
      "explanation": "<brief explanation of the rule>",
      "ruleExamples": ["<correct example 1>", "<correct example 2>", "<correct example 3>"],
      "severity": "<high/medium/low>"
    }
  ],
  "tips": ["<grammar tip 1>", "<grammar tip 2>"],
  "analysis": {
    "sentenceCount": <number>,
    "wordCount": <number>,
    "avgSentenceLength": <number>,
    "readabilityLevel": "<Basic/Intermediate/Advanced>"
  }
}
Return ONLY the JSON.`;

async function run() {
  try {
    const res = await generateJSON(prompt);
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(e);
  }
}
run();
