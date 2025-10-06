// cron_job.ts
import { z } from "zod@3";

const grammarResetResponse = z.object({
  success: z.boolean(),
  message: z.string(),
  "Users updated": z.number().optional(),
});

const backendUrl = process.env.BACKEND_ENDPOINT;

console.log(`[${new Date().toISOString()}] CRON JOB STARTED`);
console.log(`[${new Date().toISOString()}] Using backend URL: ${backendUrl}`);

async function runGrammarReset(): Promise<void> {
    console.log(`[${new Date().toISOString()}] Starting grammar reset function...`);
    
    try {
        console.log(`[${new Date().toISOString()}] Making request to: ${backendUrl}/mongo_grammar/grammar_reset`);
        
        const response = await fetch(`${backendUrl}/mongo_grammar/grammar_reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        
        console.log(`[${new Date().toISOString()}] Response status: ${response.status}`);
        
        const data = grammarResetResponse.parse(await response.json());
        console.log(`[${new Date().toISOString()}] Response data:`, data);
        
        if (data.success) {
            console.log(`[${new Date().toISOString()}] Grammar reset successful: ${data.message}`);
        } else {
            console.error(`[${new Date().toISOString()}] Grammar reset failed: ${data.message}`);
        }
        
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error in cron:`, error);
        process.exit(1);
    }
}

// Run the function
runGrammarReset();