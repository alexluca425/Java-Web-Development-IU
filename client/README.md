# React Client #

React + Vite frontend application for the Try Study Agent web app. Implements user authentication, chatbot interface, and Voiceflow integration.

# Prerequisites

- Node.js (v18 or higher)
- npm
- Backend server running (see /server/README.md)

# Quick Start

1. Install dependencies:
In bash:
cd client
npm install

2. Configure environment variables:
Create a .env in the client directory
VITE_SERVER_URL=http://127.0.0.1:5000 (to run locally)

3. Start the server
npm run dev


# Structure

client/src/Components/Auth - handle the login, signup, and password reset
client/src/Components/Chatbot - chatbot components
client/src/hooks/Login_Signup - all the auth hooks are here
client/src/hooks/Chatbot - voiceflow hook
client/src/app - main app component
client/public - stores the logo.png file


# Key Features

- Login/Signup
- Password reset
- Session management, automatic logout and state cleanup

- Voiceflow integration
- Interactive buttons
- Auto scrol
- Mobile friendly


# API Integration

The client communicates with the Flask backend through these endpoints:

Auth:
- POST /mongo_user/authentication - User login
- POST /mongo_user/signup - User sign up and send OTP code via Resend API
- POST /mongo_user/verification - OTP verification
- PATCH /mongo_user/resend_otp - Resend OTP code via Resend API

Chatbot:
- POST /voiceflow/interact - Send messages to Voiceflow
- POST /voiceflow/reset - Reset conversation state

