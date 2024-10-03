import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { useLocation } from 'react-router-dom';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [adminMessage, setAdminMessage] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const newSocket = io("http://localhost:4000");
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    useEffect(() => {
        if (socket) {
            const handleNewMessage = (data) => {
                if (location.pathname !== '/chat') {
                    setAdminMessage(data);
                } else {
                    console.log("UserChat is open, message is being handled there.");
                }
            };

            socket.on("admin-broadcast", handleNewMessage);
            socket.on("admin-private-message", handleNewMessage);

            return () => {
                socket.off("admin-broadcast", handleNewMessage);
                socket.off("admin-private-message", handleNewMessage);
            };
        }
    }, [socket, location.pathname]);

    const value = {
        socket,
        adminMessage,
        setAdminMessage,
    };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};