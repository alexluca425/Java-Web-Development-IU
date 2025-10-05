
import { Leapfrog } from 'ldrs/react'
import 'ldrs/react/Leapfrog.css'


export default function ChatMessage({ chat }) {
  const roleClass = chat.role === "model" ? "bot" : "user";

  if (chat.loading) {
    return (
      <div className={`message ${roleClass}-message`}>
        <Leapfrog size="28" speed="2.0" color="white" />
      </div>
    );
  }

  return (
    <div className={`message ${roleClass}-message`}>
      <p className="message-text">{chat.text}</p>
    </div>
  );
}
