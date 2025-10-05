// State management
import { useState, useCallback } from "react";

// Import the backend url 
const SERVER_URL = import.meta.env.VITE_SERVER_URL;


// In order to display the buttons from VF responses need to extract them from the json first
const extractButtons = (traces) => {
    // Check if traces is an array and default to empty if not
    const list = Array.isArray(traces) ? traces : [];
    const out = [];
    
    // Loop through each trace to find choice traces
    for (const t of list) {
        // Only process traces of type choice
        if (t?.type !== "choice") continue;
        const p = t.payload || {};

        // Set each button to the buttons array
        const buttons = 
            (Array.isArray(p.buttons) && p.buttons) ||
            [];

        // Extract button data from the array
        for (const b of buttons) {
            out.push({
                label: b.name || b.request?.payload?.label,  // Display text for the button
                value: b.request?.payload?.label || b.name   // Value sent when button is clicked
            });
        } 
    }
    return out;
};



// Hook for interacting with Voiceflow Dialog Manager API
// Sends user messages, launches the flow, and resets it
export default function useVoiceflow () {

    // State for tracking loading status and errors
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("");


    // useCallBack to memorize the function between renders until the dependencies change
    // Send a message to voiceflow with user id to interact with the flow and recieve response
    const sendMessage = useCallback(async ({ email, text }) => {

        setIsLoading(true);
        setError("");

        try {
           // Send POST request to with user ID and message to voiceflow
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

            // Extract messages and buttons from response
            const messages  = Array.isArray(data.messages) ? data.messages: [];
            const buttons = extractButtons(data.raw);

            return { messages, buttons } ; // Return messages and buttons

        } catch (e) {
            setError(e.message || "Voiceflow request failed");
            throw e;
          } finally {
            setIsLoading(false);
        }

    }, []);


    // Start a new conversation flow with user ID by sending the /interact API call with launch set to true
    const launch = useCallback(async ({ email }) => {

        setIsLoading(true);
        setError("");

        try {
            // Send launch request to backend
            const res = await fetch(`${SERVER_URL}/voiceflow/interact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_email: email, launch: true }),
            }); 

            const data = await res.json();
            
            // Debug logging
            console.log(email);
            console.log(data.messages);

            // Extract messages from response
            const messages  = Array.isArray(data.messages) ? data.messages: [];

            return { messages } ; // Return messages

        } catch (e) {
            setError(e.message || "Voiceflow request failed");
            throw e;
          } finally {
            setIsLoading(false);
        }
    }, []);


    // Reset the voiceflow flow with Reset so user starts fresh after logout
    const reset = useCallback(async ({ email}) => {

        setIsLoading(true);
        setError("");

        try {
            // Send reset request to backend
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