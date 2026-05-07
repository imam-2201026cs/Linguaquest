import { init } from "@heyputer/puter.js/src/init.cjs";
import dotenv from 'dotenv';
dotenv.config();

const puter = init(process.env.PUTER_AUTH_TOKEN);

async function testPuterV2() {
    console.log("🚀 Testing Puter.js v2 Integration...");
    try {
        console.log("📡 Sending test request to Claude 3.5 Sonnet via Puter...");
        const response = await puter.ai.chat("Say 'Puter v2 is Active!' and give me a 1-sentence English tip.");
        console.log("✅ AI Response:", response.toString());
        
        console.log("\n📊 Testing GPT-4o Fallback...");
        const fallback = await puter.ai.chat("Give me a one-word synonym for 'Fast'", { model: 'gpt-4o' });
        console.log("✅ Fallback Response:", fallback.toString());
    } catch (err) {
        console.error("❌ Puter v2 Test Failed:", err.message);
        console.log("\n💡 TIP: Make sure PUTER_AUTH_TOKEN is set in your .env file!");
    }
}

testPuterV2();
