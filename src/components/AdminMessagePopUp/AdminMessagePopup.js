import React from 'react';
import { useSocket } from '../SocketContext/SocketContext.js';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminMessagePopup.css';

const AdminMessagePopup = () => {
    const { adminMessage, setAdminMessage } = useSocket();
    const navigate = useNavigate();
    const location = useLocation();

    // Don't show the popup if we're on the userchat page
    if (!adminMessage || location.pathname === '/chat') return null;

    const handleClick = () => {
        navigate('/chat');
        setAdminMessage(null); // Clear the message after navigating
    };

    return (
        <div className="admin-message-popup">
            <p>New message from admin: {adminMessage.text}</p>
            <button onClick={handleClick}>Go to Chat</button>
        </div>
    );
};

export default AdminMessagePopup;