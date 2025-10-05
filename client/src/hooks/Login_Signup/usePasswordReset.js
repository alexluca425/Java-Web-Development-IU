// State management
import { useState } from "react";

// Import the backend url 
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

/*
 * The passwordReset function is meant to update the users document in MongoDB with the new password they set
 * Returns the state isPasswordReset if function is successful
 * Returns reset which makes the API call to update the backend
*/

export default function passwordReset() {

    const [isPasswordReset, setPasswordReset] = useState(false);

    const reset = async ({email, password}) => {

        // Send update request to backend with the users new password
        const res = await fetch(`${SERVER_URL}/mongo_user/updates`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_email: email, password }),
        });
        
        // Parse response and handle result
        const data = await res.json();
        console.log(data.message)

        if (data.success) {
            setPasswordReset(true); // Set password reset as complete
        } else {
            throw new Error(data.message); // Throw error for failed signup
        }
    }

    return { isPasswordReset, reset }

}