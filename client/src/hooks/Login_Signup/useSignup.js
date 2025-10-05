// State management
import { useState } from "react";

// Import the backend url 
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

/*
 * The userSignup function is meant to make a post request 
 * to the DB and create the pending user state with users email
 * and OTP code.
 * Sends an email with the OTP code to the user.
 * Returns the state of isSignedup
 * And signup which makes the API call
*/

export default function userSignup() {

    const [ isSignedUp, setSignedUp ] = useState(false);

    const signup = async ({email, password, name}) => {

        // Send signup request to backend
        const res = await fetch(`${SERVER_URL}/mongo_user/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_email: email, password, name }),
        });
        
        // Parse response and handle result
        const data = await res.json();
        console.log(data.message);
        
        if (data.success) {
            setSignedUp(true); // Set signup as initiated
        } else {
            throw new Error(data.message); // Throw error for failed signup
        }
    };

    return { isSignedUp, signup };
}