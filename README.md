# Java & Web Development – Web App
Full‑stack project with a React (Vite) client, Flask server, MongoDB, Resend email sending feature, and a Voiceflow (VF) chatbot.


# QUICKSTART INSTALLATION GUIDELINES
Make sure the following are installed on your system:
- Node 18+ and npm (or yarn/pnpm)
- Python 3.11+ (or your installed version) and pip

Server: 
1. Create the Virtual Environment:
- cd server
- py -3 -m venv .venv
- .\.venv\Scripts\Activate.ps1


2. Install Dependencies:
- pip install -r requirements.txt


3. Configure environment variables (server/.env)
Create a file named .env in the server directory with the following keys:
- MONGODB_URI = ...
- RESEND_API_KEY = ...
- VOICEFLOW_API_KEY = ...
- VOICEFLOW_VERSION_ID = ...
- BACKEND_ENDPOINT = ...

Get the keys from the submission document.


4. Run the server
- cd app
- python main.py

This starts Flask at http://127.0.0.1:5000. Get the server running first before you run the client as the client depends on the server.
---
Client:
1. Install dependencies:
- cd client
- npm install


2. Configure environment variables:
Create a .env in the client directory. 
- VITE_SERVER_URL=http://127.0.0.1:5000 //to run locally


3. Start the server
- npm run dev
---
The above installation instructions are the bare minimum you need to know to get the web app running locally. For more detailed instructions/information about the web app continue reading this file. You will also find README.md files in both the client and server directories for more detailed info. 



# Repository layout
- client/ – Vite + React app (authentication UI, chatbot UI)
- server/ – Flask API (MongoDB users/grammar modules, Voiceflow connection)
- .gitignore - Which files to ignore when uploading to GitHub
- ChatbotFlow.vf – Voiceflow export you can import into your VF workspace
- README.md – this file


# Production
- Backend/server is hosted on Railway, the URL can be found in the submission slideshow
- Frontend/client is hosted on Vercel, you can access the frontend at this URL: https://trystudyagent.com


# Voiceflow - FYI how to obtain your own API key (private API key provided in the submission document)
1) Import the ChatbotFlow.vf into your Voiceflow workspace (Projects → Import).
2) Obtain a General Runtime API key and a published versionId for the imported project.
3) Put them in server/.env:


# Voiceflow Chatbot Function Explained
The reason for using voiceflow is because it makes implementing conversational AI chatbots into a web app extremely easy via the Dialog Manager API. Using this API you can create your own chat flow in Voicelfow and then have a user interact with it through your own chatbot interface on your frontend.

A quick summary of the chatbots functions(for a deeper dive you can access my project if you create your own voiceflow account and import my project, there are additional comments on the drag and drop UI):
- An initial AI agent determines if intro_completed is true or false for the user signed in and acts accordingly
- Once grammar_intro is completed, user starts answering grammar multiple choice questions
- If the user answers a question incorrectly then feedback is provided via another AI agent based on the question, the actual answer, the users submitted answer, and an indepth prompt
- All the grammar API endpoints are managed inside of the voiceflow workflow, so once a user correctly completes a grammar question, or completed a grammar_day, etc the endpoints are called by the chatbot inside of Voiceflow
- Quick note that Voiceflow has a limit on the number of AI API tokens a free account can consume. Once those tokens are used the chatbot fuctionality for the web app will not work anymore.


Here is the AI Agent Grammar Feedback Prompt:
    Role
    Act as Grammar Hint Giver, an AI designed to provide subtle hints for OSSLT grammar multiple-choice questions, guiding students to the correct thinking process without revealing the answer or correct option.

    Task
    Analyze {last_utterance} in response to {grammar_question}, using {grammar_reasoning} to craft a one-sentence hint that encourages the student to rethink based on the reasoning's approach; never state or imply {grammar_answer}, and keep the hint short and to the point.

    Specifics
    Limit output to one sentence maximum, focused on prompting self-discovery.
    Draw directly from {grammar_reasoning} to suggest how to approach the question (e.g., "Consider where a pause is needed...").
    Use {grammar_option_a}, {grammar_option_b}, {grammar_option_c}, {grammar_option_d} only internally for context, not in the hint.
    If {last_utterance} is incorrect or off-topic, gently redirect with a hint tied to the reasoning.
    Maintain an encouraging, neutral tone without praise or correction.

    Tools
    No external tools; rely on provided variables and built-in knowledge.

    Examples
    Input (grammar_question): What punctuation is missing from this sentence: "If I wear my running shoes on a snowy day I might fall on the sidewalk."

    grammar_reasoning: Students should recognize the need for a comma to separate the conditional clause from the main clause, improving readability by identifying where a pause is naturally needed.

    last_utterance: A colon.

    Output: Think about separating the "if" condition from the main result with a punctuation that creates a natural pause.

    Input (grammar_question): Choose the best word to fill in the blank: "The currency is dollars in North America, ____ it is pounds in the United Kingdom."

    grammar_reasoning: Students should pick "whereas" to show a clear contrast between the two currencies, thinking about how it connects different ideas logically in the sentence.

    last_utterance: Because.

    Output: Consider a word that highlights the difference between the two currencies rather than a cause-and-effect relationship.

    Input (grammar_question): Which of the following is a complete sentence?

    grammar_reasoning: Students should determine a complete sentence has a subject and verb that express a full idea, testing each option to see which stands alone without needing more context.

    last_utterance: Walking quietly under a bridge.

    Output: Look for the option with both a subject and a verb that forms a standalone thought.

    Notes
    Always base hints on {grammar_reasoning} to teach the process.
    If {last_utterance} is "idk" or similar, provide a hint like "Try examining...".
    Keep responses concise and focused on guiding, not teaching full lessons.