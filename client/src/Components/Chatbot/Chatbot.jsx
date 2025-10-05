import React, { useState, useRef, useEffect } from "react";
import ChatHeader from "./Chat_Header";
import ChatMessage from "./Chat_Messages";
import ChatForm from "./Chat_Form";
import ChatButtons from "./Chat_Buttons"

import useVoiceflow from "../../hooks/Chatbot/useVoiceflow";

import "./Styling/Chatbot.css";


export default function Chatbot({ onLogout, userEmail }) {

  const { sendMessage, launch, reset } = useVoiceflow();
  const [ isLoading, setIsLoading ] = useState(false);
  const [ buttons, setButtons ] = useState([]);

  const [messages, setMessages] = useState([
    { role: "model", text: "Say Hello to get started!" },
  ]);

  // For messages to autoscroll to the bottom of the container everytime there is a bot message
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [ messages, isLoading, buttons]);


  // useEffect for there is no email for user start with launch
  useEffect(() => {
    if (!userEmail) return;
    (async () => {
      try {
        await reset?.({ email: userEmail }); // optional
        const { messages: hello, buttons: btns } = await launch({ email: userEmail });
        const first = (hello && hello.length ? hello
                     : ["Say Hello to get started!"]);
        setMessages(first.map(t => ({ role: "model", text: t })));
        setButtons(btns ?? []);
      } catch {
        setMessages([{ role: "model", text: "Say Hello to get started!" }]);
        setButtons([]);
      }
    })();
  }, [userEmail, launch, reset]);

  const handleSend = async (text) => {

    setMessages(prev => [...prev, { role: "user", text}]);
    setIsLoading(true);
    setButtons([]);

    try {
      const { messages: replies, buttons: btns } = await sendMessage({ email: userEmail, text });
      setMessages(prev => [
        ...prev,
        ...replies.map(t => ({ role: "model", text: t }))
      ]);
      setButtons( btns ?? []);
    } catch (e) {
      console.error("[handleSend] error:", e);
      setMessages(prev => [
        ...prev, 
        { role: "model", text: "Unable to reply."}
      ]);
      setButtons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = async (value) => {
    setButtons([]); //hide buttons
    await handleSend(value); // button click is user message
  }   

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
