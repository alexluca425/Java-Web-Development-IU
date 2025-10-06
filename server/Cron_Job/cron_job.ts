/* 
 * This file is written in typescipt as that is the language required by Railway in order to create CRON job
 * In Railway create a new function and paste the following code as the source code for that function
 * You also need to provide the backend url as a variable for the function
*/

// Get the backend URL in order to run the API call
const backendUrl = process.env.BACKEND_ENDPOINT;

// Function which will make the API call to reset grammar for the users
async function runGrammarReset(): Promise<void> {    
    try {        
        const response = await fetch(`${backendUrl}/mongo_grammar/grammar_reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
                
        // Parse response and handle accordingly
        const data = await response.json();
        
        if (data.success) {
            console.log(`Grammar reset successful: ${data.message}`);
        } else {
            console.error(`Grammar reset failed: ${data.message}`);
        }
        
    } catch (error) {
        // Catch any errors that may occur
        console.error(`Error in cron:`, error);
        process.exit(1);
    }
}

// Run the function
runGrammarReset();