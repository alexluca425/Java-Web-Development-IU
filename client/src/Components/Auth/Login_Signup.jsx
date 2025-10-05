// State management
import React, { useState } from "react";

// Styling for the component
import "./Login_Signup.css";

/* 
* The Login_Signup component is meant to provide login and signup functionality for the user.
* - onSubmit submits the user email and password for authentication
* - onForgotPassword displays a new popup where user can receive an OTP code to reset their password
* - onSignUp displays a new popup where user can signup for the web app
*/


export default function Login_Signup({ onSubmit, onForgotPassword, onForgotPasswordVerify, onSignup, onSignupVerify }) {

  // Inputs for login/signup from the popups
  const [email, setEmail] = useState("");                           
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [OTP, setOTP] = useState("");

  // Create a loading variable to prevent creating race conditions from double submits
  const [loading, setLoading] = useState(false);  

  // A way to catch any successes and errors that may pop up
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");               

  // Confirm that passwords match on sign up
  const [confirmPassword, setConfirmPassword] = useState("");       

  // To display OTP input form
  const [toggleOTP, setToggleOTP] = useState(false);                

  // Popup toggles
  const [showLogin, setShowLogin] = useState(true)
  const [showForgot, setShowForgot] = useState(false);
  const [showSignup, setShowSignup] = useState(false);


  // Ensures email and password are sent through to the hook for authentication via the backend
  const handleLoginClick = async (e) => {
    e.preventDefault();
    if (loading) return; // prevent double submits
    setLoading(true);
    setError("")
    try {
      await onSubmit({ email, password });
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false);
    } 
  };


  // On the first click ensures that the email, password, and password confirmation are provided
  // On the second click ensures that the correct OTP code is provided before pushing new password to user doc
  const handleForgotPasswordClick = async (e) => {
    e.preventDefault();
    if (loading) return; // prevent double submits
    setLoading(true);
    setError("");

    // Both passwords need to match to continue
    if (password !== confirmPassword) 
      { setError("Passwords do not match!"); return; }
  
    try {
      if (!toggleOTP) {
        // Step 1: Request OTP
        await onForgotPassword?.({ email, password, confirmPassword });
        setToggleOTP(true);  // reveal OTP input
        setSuccess("OTP code sent to email.")
      } else {
        // Step 2: Submit OTP to verify and finalize reset
        await onForgotPasswordVerify?.({ email, otp: OTP, password });
        
        handleLogin() // Go back to login screen once password has been reset
        setSuccess("Password changed, please log in now.") // Announce the user to log in with their new password
      }
    } catch (err) {
      setError(err.message || "Failed"); // Throw any errors that may come up
    } finally {
      setLoading(false);
    }
  };

  // On the first click ensure that email, password, password confirmation, and name are provided
  // On the second click ensure that the correct OTP code is provided before creating new verified user
  const handleSignupClick = async (e) => {
    e.preventDefault();
    if (loading) return; // prevent double submits
    setLoading(true);
    setError("");

    // Both passwords need to match to continue
    if (password !== confirmPassword) {
      setLoading(false);
        setError("Passwords do not match!"); 
        return; 
    }
  
    try {
      if (!toggleOTP) {
        // Step 1: Request OTP
        await onSignup?.({ email, password, confirmPassword, name });
        setToggleOTP(true); // reveal OTP input
        setSuccess("OTP code sent to email.")
      } else {
        // Step 2: Submit OTP to verify and finalize signup
        await onSignupVerify?.({ email, otp: OTP, password, name });

        handleLogin(); // Go back to login screen once password has been reset
        setSuccess("Account created, please log in now.") // Announce the user to log in with their new account

      }
    } catch (err) {
      setError(err.message || "Failed"); // Throw any errors taht may come up
    } finally {
      setLoading(false);
    }
  };



  // Set states when navigating to the login page
  const handleLogin = () => {
    setShowLogin(true);
    setShowSignup(false);
    setShowForgot(false);
    setToggleOTP(false);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setOTP("");
  };

  // Set states when navigating to the forgot password page
  const handleForgot = () => {
    setShowForgot(true);
    setShowSignup(false);
    setShowLogin(false);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setOTP("");
  };

  // Set states when navigating to the signup page
  const handleSignUp = () => {
    setShowSignup(true);
    setShowForgot(false);
    setShowLogin(false);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setOTP("");
  };


  return (
    <div className="page">

      <h1 className="page-title">Try Study Agent</h1>
      <h3 className="page-text">Prepare for the OSSLT English exam!</h3>

      {/* Login Page */}
      {showLogin && (
        <div className="card">
        <h2 className="title">Log in</h2>
          <form onSubmit={handleLoginClick} className="form">
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="input"
            />

            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input"
            />

            <button type="submit" disabled={loading} >
              {loading ? "Signing in..." : "Log in"}
            </button>
          </form>

          {/* Buttons to popup the other two pages */}
          <div className="actions">
            <button type="button" onClick={handleForgot}>
              Forgot password?
            </button>
            <button type="button" onClick={handleSignUp}>
              Sign up
            </button>
          </div>
        </div>
      )}
      

       {/* Forgot Password Page */}
       {showForgot && (
        <div className="card" onClick={() => setShowForgot(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="title">Reset password</h3>
            <form className="form" onSubmit={handleForgotPasswordClick}>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input"
              />

              <label className="label" htmlFor="password">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input"
              />

              {/* OTP Code input only appears after the first submit */}
              {toggleOTP && (
                <>                
                  <label className="label">OTP Code</label>
                  <input
                    id="OTP"
                    type="text"
                    value={OTP}
                    onChange={(e) => setOTP(e.target.value)}
                    required
                    className="input"
                    maxLength={6}
                  />
                </>
              )}
              
              {/* The button below changes after the first submit */}
              <div className="actions">
                <button type="button" onClick={handleLogin}>Cancel</button>
                <button type="submit">{toggleOTP ? "Submit" : "Send OTP"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sign Up Page */}
      {showSignup && (
        <div className="card" onClick={() => setShowSignup(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="title">Create account</h3>
            <form className="form" onSubmit={handleSignupClick}>

              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label className="label">Name</label>
              <input
                type="name"
                className="input"
                placeholder="you"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input"
                minLength={6}
              />

              <label className="label" htmlFor="password">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="input"
              />

              {/* OTP Code input only appears after the first submit */}
              {toggleOTP && (
                <>                
                  <label className="label">OTP Code</label>
                  <input
                    id="OTP"
                    type="text"
                    value={OTP}
                    onChange={(e) => setOTP(e.target.value)}
                    required
                    className="input"
                    maxLength={6}
                  />
                </>
              )}

              {/* The button below changes after the first submit */}
              <div className="actions">
                <button type="button" onClick={handleLogin}>Cancel</button>
                <button type="submit">{toggleOTP ? "Signup" : "Send OTP"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Display any login/signup successes and errors */}
      {(error || success) && (
        <div className={`alert ${error ? "is-error" : "is-success"}`}>
          {error || success}
          <button type="button" className="alert-button" onClick={() => {setError(""); setSuccess("");}}>×</button>
        </div>
      )}
    </div>
  );
}
