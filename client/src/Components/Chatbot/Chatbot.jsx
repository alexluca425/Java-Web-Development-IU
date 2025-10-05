import React, { useState, useRef, useEffect } from "react";
import ChatHeader from "./Chat_Header";
import ChatMessage from "./Chat_Messages";
import ChatForm from "./Chat_Form";
import ChatButtons from "./Chat_Buttons"

import useVoiceflow from "../../hooks/Chatbot/useVoiceflow";

import "./Styling/Chatbot.css";

// Main chatbot container component that handles the entire chat experience
// Manages conversation state, Voiceflow integration, and user interactions

export default function Chatbot({ onLogout, userEmail }) {

  // Voiceflow API integration hook
  const { sendMessage, launch, reset } = useVoiceflow();
  
  // State management
  const [ isLoading, setIsLoading ] = useState(false);  // Loading indicator for API calls
  const [ buttons, setButtons ] = useState([]);         // Interactive buttons from Voiceflow

  // Array of message objects with role and text
  const [messages, setMessages] = useState([
    { role: "model", text: "Say Hello to get started!" },
  ]);

  // Ref for auto-scrolling to bottom when new messages arrive
  const bodyRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [ messages, isLoading, buttons]);

  // Launch Voiceflow conversation when user logs in
  useEffect(() => {
    if (!userEmail) return;
    (async () => {
      try {
        await reset?.({ email: userEmail }); // Clear any existing Voiceflow state
        const { messages: hello, buttons: btns } = await launch({ email: userEmail });
        
        // Use Voiceflow welcome message 
        const first = (hello && hello.length ? hello
                     : ["Say Hello to get started!"]);
        setMessages(first.map(t => ({ role: "model", text: t })));
        setButtons(btns ?? []);
      } catch {
        // Fallback to default message if Voiceflow fails
        setMessages([{ role: "model", text: "Say Hello to get started!" }]);
        setButtons([]);
      }
    })();
  }, [userEmail, launch, reset]);

  // Send user message to Voiceflow and handle response
  // Update UI state, shows loading indicator, and handles errors
  const handleSend = async (text) => {

    // Add user message to conversation
    setMessages(prev => [...prev, { role: "user", text}]);
    setIsLoading(true);
    setButtons([]);

    try {
      // Send message to Voiceflow and get response
      const { messages: replies, buttons: btns } = await sendMessage({ email: userEmail, text });
      setMessages(prev => [
        ...prev,
        ...replies.map(t => ({ role: "model", text: t }))
      ]);
      setButtons( btns ?? []);
    } catch (e) {
      console.error("[handleSend] error:", e);
      // Show error message if API call fails
      setMessages(prev => [
        ...prev, 
        { role: "model", text: "Unable to reply."}
      ]);
      setButtons([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle button clicks from Voiceflow choices
  // Hides buttons and sends the button value as a user message
  const handleButtonClick = async (value) => {
    setButtons([]); // Hide buttons after click
    await handleSend(value); // Send button value as user message
  }   

  // Handle logout with Voiceflow state reset
  const handleHeaderLogout = async () => {
    try {
      if (userEmail) await reset({ email: userEmail });
      console.log("User logged out and VF reset.")
    } catch (e) {
      console.error("Error: ", e);
    } finally {
      onLogout();
    }
  }

  return (
    <div className="chatbot">
      <ChatHeader onLogout={handleHeaderLogout} />
      <main className="chat-body" ref={bodyRef}>
        {messages.map((m, i) => (
          <ChatMessage key={i} chat={m} />
        ))}
        {isLoading && <ChatMessage chat={{ role: "model", loading: true }} />}
        {buttons.length > 0 && <ChatButtons buttons={buttons} onButtonClick={handleButtonClick} />}
      </main>
      <ChatForm onSend={handleSend} />
    </div>
  );
}
