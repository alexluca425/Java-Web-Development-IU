import ChatbotIcon from "./Chat_Icon";
import "./Styling/Chat_Header.css";

// Chat header component with logo and logout button
export default function ChatHeader ({ onLogout }) {

    return (
        <div>
            <div className="header">
                <div className="logo">
                    <span className="chatbot-icon"><ChatbotIcon /></span>
                    <h1 className="logo-text">Try Study Agent</h1>
                </div>
                <button className="logout-btn" onClick={onLogout}>Logout</button>
            </div>
        </div>
    )

}