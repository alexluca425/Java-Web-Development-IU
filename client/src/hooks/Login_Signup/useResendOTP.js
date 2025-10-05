// State management
import { useState } from "react";

// Import the backend url 
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

/*
 * The resend function is meant to resend the OTP code to the users email to verify the update for new password
 * Returns the state of isResend which determines if the resend email was sent successfully
 * Returns resend which makes the API call to send the email
*/

export default function resend() {

    const [isResend, setResend] = useState(false);

    const resend = async ({email}) => {
        // Send resend request to the backend
        const res = await fetch(`${SERVER_URL}/mongo_user/resend_otp`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_email: email }),
          });

          // Parse response and handle result
          const data = await res.json();
          console.log(data.message)

          if (data.success) {
              setResend(true); // Set isResend as initiated
          } else {
              throw new Error(data.message); // Throw error for failed resend
          }
    }

    return { isResend, resend }

}