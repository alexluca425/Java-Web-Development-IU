import ChatbotIcon from "./Chat_Icon";
import "./Styling/Chat_Header.css";



export default function ChatHeader ({ layoutValue, onLogout }) {

    return (
        <div>
            <div className="header">
                <div className="logo">
                    <span className="chatbot-icon"><ChatbotIcon /></span>
                    <h1>Try Study Agent</h1>
                </div>
                <button className="logout-btn" onClick={onLogout}>Logout</button>
            </div>
        </div>
    )

}