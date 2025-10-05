// State management
import { useState, useCallback } from "react";

// Import the backend url 
const SERVER_URL = import.meta.env.VITE_SERVER_URL;



const extractButtons = (traces) => {
    const list = Array.isArray(traces) ? traces : [];
    const out = [];
    for (const t of list) {
        if (t?.type !== "choice") continue;
        const p = t.payload || {};

        const arr = 
            (Array.isArray(p.buttons) && p.buttons) ||
            (Array.isArray(p.choices) && p.choices) ||
            [];

        for (const b of arr) {
            out.push({
                label: b.name || b.request?.payload?.label,
                value: b.request?.payload?.label || b.name
            });
        } 
        
    }
    return out;
};



export default function useVoiceflow () {

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("");


    // useCallBack to memorize the function between renders until the dependencies change
    // Send a message to voiceflow with user id to interact with the flow
    const sendMessage = useCallback(async ({ email, text }) => {

        setIsLoading(true);
        setError("");

        try {
           const res = await fetch(`${SERVER_URL}/voiceflow/interact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_email: email, message: text }),
            });
        
            // Parse response and handle result
            const data = await res.json();

            // Log response for error handling
            console.log(data.messages)
            console.log(data.raw?.[4]?.payload?.buttons)

            const messages  = Array.isArray(data.messages) ? data.messages: [];
            const buttons = extractButtons(data.raw);

            return { messages, buttons } ; // return messages to caller

        } catch (e) {
            setError(e.message || "Voiceflow request failed");
            throw e;
          } finally {
            setIsLoading(false);
        }

    }, []);


    // Restart the flow with Launch, do this on logout or browser refresh so user starts from the beginning of the voiceflow flow
    const launch = useCallback(async ({ email }) => {

        setIsLoading(true);
        setError("");

        try {
            const res = await fetch(`${SERVER_URL}/voiceflow/interact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_email: email, launch: true }),
            }); 

            const data = await res.json();
            console.log(email);
            console.log(data.messages);

            const messages  = Array.isArray(data.messages) ? data.messages: [];

            return { messages } ; // return messages to caller

        } catch (e) {
            setError(e.message || "Voiceflow request failed");
            throw e;
          } finally {
            setIsLoading(false);
        }
    }, []);


    // Reset the voiceflow flow with Reset so user starts fresh
    const reset = useCallback(async ({ email}) => {

        setIsLoading(true);
        setError("");

        try {
            await fetch(`${SERVER_URL}/voiceflow/reset`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_email: email }),
              })
        } catch (e) {
            setError(e.message || "Voiceflow request failed");
            throw e;
          } finally {
            setIsLoading(false);
        }
    }, []);


    return { isLoading, error, sendMessage, launch, reset };
}