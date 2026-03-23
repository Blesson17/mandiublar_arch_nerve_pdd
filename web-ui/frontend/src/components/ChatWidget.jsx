import React, { useState } from 'react';
import {
    ChatCircleText,
    Robot,
    CaretDown,
    X,
    Sparkle,
    PaperPlaneRight
} from '@phosphor-icons/react';
import { chatService } from '../services/chatService';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(true);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'ai', text: "Hello! I'm your ImplantAI Assistant 🦷. I can help answer questions about dental implant planning, bone assessment, surgical protocols, and more. What would you like to know?" }
    ]);
    const messagesEndRef = React.useRef(null);

    const toggleChat = (open) => {
        setIsOpen(open);
        setIsMinimized(!open);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const data = await chatService.send(userMsg);
            setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { sender: 'ai', text: `Connection error: ${error.message}` }]);
        } finally {
            setLoading(false);
        }
    };

    const chips = [
        "Bone density types",
        "Implant size guide",
        "Nerve safety",
        "Immediate loading",
        "Sinus lift",
        "All-on-4 protocol"
    ];

    return (
        <>
            <div
                className={`chat-widget-btn ${isOpen ? 'hidden' : ''}`}
                onClick={() => toggleChat(true)}
            >
                <ChatCircleText weight="fill" />
            </div>

            <div className={`chat-window ${!isOpen ? 'minimized' : ''}`}>
                <div className="chat-header">
                    <div className="chat-header-left">
                        <div className="header-icon">
                            <Robot weight="fill" />
                        </div>
                        <div className="header-info">
                            <h4>ImplantAI Assistant</h4>
                            <div className="header-status">
                                <div className="status-dot-green"></div>
                                <span>Online</span>
                            </div>
                        </div>
                    </div>
                    <div className="header-controls">
                        <CaretDown weight="bold" onClick={() => toggleChat(false)} />
                        <X weight="bold" onClick={() => toggleChat(false)} />
                    </div>
                </div>

                <div className="chat-body">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`chat-message ${msg.sender === 'user' ? 'user-message' : ''}`}>
                            {msg.sender === 'ai' && (
                                <div className="ai-avatar">
                                    <Sparkle weight="fill" />
                                </div>
                            )}
                            <div className="message-content" style={msg.sender === 'user' ? { background: '#2563EB', color: 'white' } : {}}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {loading && <div className="chat-message"><div className="ai-avatar"><Sparkle /></div><div className="message-content">...</div></div>}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-footer">
                    <div className="input-container">
                        <input
                            type="text"
                            className="chat-input"
                            placeholder="Ask about implants..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button className="send-btn" onClick={handleSend}>
                            <PaperPlaneRight weight="bold" />
                        </button>
                    </div>
                    <div className="disclaimer">AI assistant for educational purposes only</div>
                </div>
            </div>
        </>
    );
}
