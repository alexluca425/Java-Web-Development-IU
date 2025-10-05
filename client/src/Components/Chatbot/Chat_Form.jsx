import { useState } from "react";
import "./Styling/Chat_Form.css";

// Chat input form with textarea and send button
export default function ChatForm({ onSend }) {
  const [inputValue, setInputValue] = useState("");

  // Send message and clear input
  const handleSubmit = (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;
    onSend?.(text);
    setInputValue("");
  };

  return (
    <form className="chat-form" onSubmit={handleSubmit}>
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Chat here..."
        className="message-input"
        rows="1"
        style={{ resize: 'none' }}
        required
      />
      <button className="material-symbols-rounded" type="submit">↑</button>
    </form>
  );
}
