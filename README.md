# Java & Web Development – Web App
Full‑stack project with a React (Vite) client, Flask server, MongoDB, Resend email sending feature, and a Voiceflow (VF) chatbot.

# Repository layout
- client/ – Vite + React app (authentication UI, chatbot UI)
- server/ – Flask API (MongoDB users/grammar modules, Voiceflow connection)
- ChatbotFlow.vf – Voiceflow export you can import into your VF workspace
- README.md – this file

Client and server each have their own README for more in depth takes.

# Prerequisites
- Node 18+ and npm (or yarn/pnpm)
- Python 3.11+ (or your installed version) and pip


# Voiceflow - How to obtain your own API key (API key provided in the submission document)
1) Import the ChatbotFlow.vf into your Voiceflow workspace (Projects → Import).
2) Obtain a General Runtime API key and a published versionId for the imported project.
3) Put them in server/.env: