
import { Leapfrog } from 'ldrs/react'
import 'ldrs/react/Leapfrog.css'

// Individual chat message component with loading state
export default function ChatMessage({ chat }) {
  // Determine styling based on message sender (either bot or user)
  const roleClass = chat.role === "model" ? "bot" : "user";

  // Show loading animation while waiting for the API response from Voiceflow
  if (chat.loading) {
    return (
      <div className={`message ${roleClass}-message`}>
        <Leapfrog size="28" speed="2.0" color="white" />
      </div>
    );
  }

  // Render message text with appropriate styling
  return (
    <div className={`message ${roleClass}-message`}>
      <p className="message-text">{chat.text}</p>
    </div>
  );
}
