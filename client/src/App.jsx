// State management
import { useState } from 'react'

// Authentication and user management hooks
import useAuthentication from "./hooks/Login_Signup/useAuthentication";
import useResendOTP from "./hooks/Login_Signup/useResendOTP"
import useVerification from "./hooks/Login_Signup/useVerification";
import usePasswordReset from "./hooks/Login_Signup/usePasswordReset";
import useSignup from "./hooks/Login_Signup/useSignup";

// Login and Signup component
import Login_Signup from './Components/Auth/Login_Signup'

// Chatbot component
import Chatbot from './Components/Chatbot/Chatbot'

/*
 * The Login_Signup component is visible if the user is not authenticated, otherwise shows the chatbot component
 */
export default function App() {
  // Initialize login and signup hooks
  const { isAuthenticated, login, logout } = useAuthentication();
  const { resend } = useResendOTP();
  const { verifyOTP } = useVerification();
  const { reset } = usePasswordReset();
  const { signup } = useSignup();

  // Initialize user email which will be used to send api calls from the chatbot component as well
  const [ userEmail, setUserEmail] = useState("");

  // Set the userEmail when the user logs in with their email
  const handleLogin = async ({ email, password }) => {
    await login ({ email, password });
    setUserEmail(email);
  };

  // Intitialize all chatbot hooks
  //const { logout } = useAuthentication();

  // Conditional rendering depending on authentication status
  return isAuthenticated ? (
    // Takes in logout prop to reset user VF flow
    <Chatbot 
      onLogout = {logout}
      userEmail = {userEmail}
    />
  ) : (
    <Login_Signup 
      // Login form submission
      onSubmit = {handleLogin} 
      // Forgot password flow, resend OTP to user
      onForgotPassword = {({email}) => resend({email})}
      // Forgot password flow, once OTP is confirmed reset the password in the DB
      onForgotPasswordVerify = {async ({ email, otp, password }) => {
        await verifyOTP({ email, otp });
        await reset({ email, password })
      }}
      // Signup flow, sends the OTP first
      onSignup = {({email, password, name}) => signup({ email, password, name})}
      // Signup flow, once OTP is verified create the users account
      onSignupVerify = {async ({ email, password, name, otp }) => {
        await verifyOTP({ email, otp, password, name })
      }}
    />
  );
}
