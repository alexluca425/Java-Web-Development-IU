import { useState } from "react";
import "./Styling/Chat_Form.css";



export default function ChatForm({ onSend }) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;
    onSend?.(text);
    setInputValue("");
  };

  const handleEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="chat-form" onSubmit={handleSubmit}>
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleEnter}
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
