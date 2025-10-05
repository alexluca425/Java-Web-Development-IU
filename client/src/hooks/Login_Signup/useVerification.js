// State management
import { useState } from "react";

// Import the backend url 
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

/*
 * The verification function verifies if the OTP code the user inputs matches the OTP code created by the server
 * Handles verification for both verified users and pending users
 * If user provides the correct OTP code then the "verified" value in the user doc is set to true via the /update endpoint
 * Returns the status of isVerified
 * Returns verifyOTP which checks to make sure the OTP code is correct
*/

export default function verification() {

    const [isVerified, setIsVerified] = useState(false);

    const verifyOTP = async ({ email, otp, password, name }) => {

        // Set the payload for the /verification endpoint
        // If a pending user is verifiying then include name and password in the JSON request body in order to create the verified user doc
        const payload = { user_email: email, input_otp: otp };
        if (password)
            payload.user_password = password;
        if (name)
            payload.user_name = name;

        // Send verification request to backend
        const res = await fetch (`${SERVER_URL}/mongo_user/verification`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });                       
        
        // Parse response and handle result
        const data = await res.json();
        console.log(data.message)

        if (data.success) {
            // Send update request to backend for the verified value
            const res = await fetch (`${SERVER_URL}/mongo_user/updates`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_email: email, verified: true }),
            });

            // Parse response and handle result
            const data = await res.json();
            console.log(data.message)

            if (data.success) setIsVerified(true); // If successful set as verified 

        } else {
            throw new Error(data.message); // Throw error for failed verification
        }
    }

    return {isVerified, verifyOTP};

}