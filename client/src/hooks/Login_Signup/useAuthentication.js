// State management
import { useState } from "react";

// Import the backend url 
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

/*
 * The authentication function handles user sign in
 * Sends to API call to the DB to check if the login credentials of the user exist in the DB
 * Returns isAuthenticated state so app.jsx knows to toggle to the chatbot component or not
 * Returns login which makes the API call
*/

export default function authentication() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async ({ email, password }) => {
    // Send authentcation request to backend
    const res = await fetch(`${SERVER_URL}/mongo_user/authentication`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_email: email, user_password: password }),
    });

    // Parse response and handle result
    const data = await res.json();
    console.log(data.message)

    if (data.success) {
        setIsAuthenticated(true); // Set authenicated to true if successful
    } else {
        throw new Error(data.message); // Throw error for failed login
    }
  };

  // Set isAuthenticated state to false so user has a way to log out
  const logout = () => setIsAuthenticated(false);

  return { isAuthenticated, login, logout };
}