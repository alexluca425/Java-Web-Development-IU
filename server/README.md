# Flask Server #

# Prerequisites
- PowerShell
- Python 3.12+
- Submission document to set up API keys

# 1) Create and activate a virtual environment
cd server
py -3 -m venv .venv
\.venv\Scripts\Activate.ps1


# 2) Install dependencies
pip install -r requirements.txt


# 3) Configure environment variables (server/.env)
Create a file named .env in the server directory with the following keys:
MONGODB_URI = ...
RESEND_API_KEY = ...
VOICEFLOW_API_KEY = ...
VOICEFLOW_VERSION_ID = ...
BACKEND_ENDPOINT = ...

Get the keys from the submission document.

# 4) Run the server
cd app
python main.py

This starts Flask at http://127.0.0.1:5000

# 5) API endpoint overview
Users
- POST /mongo_user/get_user_info – Retrieve info about a user
- POST /mongo_user/authentication – Verify user email and password match
- POST /mongo_user/updates – Updates to the users document
- POST /mongo_user/signup – Create a temporary pending user until user provides the OTP code sent to their email
- POST /mongo_user/verification – Verify that the OTP code provided by the user is the same one sent in the email
- PATCH /mongo_user/resend_otp – Resends the OTP code to th email

Grammar
- POST /get_uncompleted_grammar_day - Retrieve a set of grammar questions that user hasn't completed yet
- POST /get_random_question - Retrieve a random question from the set that hasn't been answered correctly yet
- POST /updates - Makes the required updates to the users document for anything grammar related
- POST /grammar_success - When user has successfully completed the set of questions, the "grammar day" is completed and "streak" is incremented
- POST /grammar_reset - Runs once a day automatically. If users haven't completed a set of questions, streak is reset to 0. This is managed by a CRON 

Voiceflow
- POST /voiceflow/interact – Interacts with the voiceflow chat flow created
- POST /voiceflow/reset – When user logouts, the state is reset for the user in voiceflow


# Files needed to run server on Railway 
- Procfile
- runtime.txt
- railway.toml (for cron job configuration)
- cron_job.py (daily grammar resset script)


# Notes
- CORS is enabled
- Voiceflow doesn't allow https://localhost:5000 to run API calls. The link needs to be public so I've deployed the server to Railway in order to make sure the voiceflow workflow fucntions as it should.
- Refer to the voiceflow read me file for a comprehensive understanding of what it does.

