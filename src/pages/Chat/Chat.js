import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import "./Chat.css";
import { useNavigate } from "react-router-dom";
import { useSocket } from '../../components/SocketContext/SocketContext.js';
import { createPeerConnection, createOffer, createAnswer, addIceCandidate, handleRemoteDescription } from "../../components/WebRTC/WebRTC.js";
import { API_URL, FILE_UPLOAD_URL } from "../../helper/Apihelpers.js";

const admin = "66a87c2125b2b6bad889fb56";

const UserChat = () => {
    const userId = localStorage.getItem("userID");
    const [chatDeactivated, setChatDeactivated] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [file, setFile] = useState(null);
    const navigate = useNavigate();
    const { socket } = useSocket();
    const [inCall, setInCall] = useState(false);
    const [callType, setCallType] = useState(null);
    const [incomingCall, setIncomingCall] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const messageContainerRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [isBroadcastCall, setIsBroadcastCall] = useState(false);

    const initializePeerConnection = useCallback(() => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }

        const configuration = {
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        };

        peerConnectionRef.current = createPeerConnection(configuration);

        peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate && socket) {
                console.log("Sending ICE candidate", event.candidate);
                socket.emit("ice-candidate", {
                    to: admin,
                    candidate: event.candidate,
                });
            }
        };

        peerConnectionRef.current.ontrack = (event) => {
            console.log("Received remote track", event.streams[0]);
            setRemoteStream(event.streams[0]);
        };

        peerConnectionRef.current.onconnectionstatechange = (event) => {
            console.log("Connection state changed:", peerConnectionRef.current.connectionState);
            if (peerConnectionRef.current.connectionState === 'disconnected' ||
                peerConnectionRef.current.connectionState === 'failed' ||
                peerConnectionRef.current.connectionState === 'closed') {
                handleEndCall();
            }
        };
    }, [socket]);

    useEffect(() => {
        initializePeerConnection();

        return () => {
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
        };
    }, [initializePeerConnection]);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const scrollToBottom = () => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    };

    const handleForceLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userID");
        navigate("/login");
        alert("Your account has been deactivated by an administrator. You have been logged out.");
    };

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const [broadcastResponse, privateResponse] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_URL}/api/chat-history/broadcast`),
                    axios.get(`${process.env.REACT_APP_API_URL}/api/chat-history/private/${userId}`)
                ]);
                setMessages([...broadcastResponse.data, ...privateResponse.data]);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();

        const fetchChatDeactivationStatus = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/chat-deactivation-status`);
                setChatDeactivated(response.data.isDeactivated);
            } catch (error) {
                console.error('Error fetching chat deactivation status:', error);
            }
        };

        fetchChatDeactivationStatus();

        if (socket) {
            console.log("Setting up socket event listeners");
            socket.emit("register-user", userId);

            socket.on("chat-deactivation-status", (data) => {
                setChatDeactivated(data.isDeactivated);
            });

            socket.on("admin-toggle-user-chat", (data) => {
                if (data.userId === userId) {
                    setChatDeactivated(!data.isChatActive);
                }
            });

            socket.on("force-logout", handleForceLogout);

            socket.on("admin-private-message", (data) => {
                console.log("UserChat: Received private message", data);
                const formattedMessage = {
                    sender: admin,
                    text: data.message,
                    timestamp: new Date().getTime()
                };
                setMessages(prevMessages => [...prevMessages, formattedMessage].sort((a, b) => a.timestamp - b.timestamp));
            });

            socket.on("admin-broadcast", (data) => {
                console.log("UserChat: Received broadcast message", data);
                const formattedMessage = {
                    ...data,
                    timestamp: new Date().getTime()
                };
                setMessages(prevMessages => [...prevMessages, formattedMessage].sort((a, b) => a.timestamp - b.timestamp));
            });

            socket.on("call-offer", handleCallOffer);
            socket.on("call-answer", handleCallAnswer);
            socket.on("ice-candidate", handleIceCandidate);
            socket.on("end-call", handleEndCall);
            socket.on("call-rejected", handleCallRejected);

            return () => {
                socket.off("chat-deactivation-status");
                socket.off("force-logout");
                socket.off("admin-toggle-user-chat");
                socket.off("admin-private-message");
                socket.off("admin-broadcast");
                socket.off("call-offer");
                socket.off("call-answer");
                socket.off("ice-candidate");
                socket.off("end-call");
                socket.off("call-rejected");
            };
        }
    }, [socket, userId, chatDeactivated, navigate]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!chatDeactivated) {
            const newMessage = {
                sender: userId,
                receiver: admin,
                text: message,
                timestamp: new Date().getTime()
            };
            try {
                await axios.post(API_URL, {
                    sender: userId,
                    receiver: admin,
                    text: message,
                    messageType: "private",
                    timestamp: newMessage.timestamp
                });
                socket.emit("user-to-admin", newMessage);
                setMessages(prevMessages => [...prevMessages, newMessage].sort((a, b) => a.timestamp - b.timestamp));
            } catch (error) {
                console.error('Error saving message:', error);
            }
            setMessage("");
            setFile(null);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append("attachment", file);

            try {
                const response = await axios.post(FILE_UPLOAD_URL, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                const fileUrl = response.data.fileUrl;
                const newMessage = { fileUrl, sender: userId, messageType: 'private' };
                socket.emit("user-to-admin", newMessage);
                setMessages(prevMessages => [...prevMessages, newMessage]);

                await axios.post(API_URL, {
                    sender: userId,
                    receiver: admin,
                    fileUrl,
                    messageType: "private",
                });
            } catch (error) {
                console.error("Error uploading file:", error);
            }
        }
    };

    const startCall = async (type) => {
        try {
            console.log("User initiating call:", type);
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: type === "video",
            });

            setLocalStream(stream);
            setCallType(type);
            setInCall(true);

            stream.getTracks().forEach((track) => {
                console.log("Adding track to peer connection", track);
                peerConnectionRef.current.addTrack(track, stream);
            });

            const offer = await createOffer(peerConnectionRef.current);
            console.log("Created offer", offer);

            await peerConnectionRef.current.setLocalDescription(offer);

            socket.emit("call-offer", { to: admin, offer, type });
        } catch (error) {
            console.error("Error starting call:", error);
        }
    };

    const handleCallOffer = async ({ from, offer, type, isBroadcast }) => {
        console.log(`User received ${isBroadcast ? 'broadcast' : 'private'} call offer from:`, from, "Offer:", offer);
        setIncomingCall({ from, offer, type, isBroadcast });
    };

    const acceptCall = async () => {
        if (!incomingCall) return;

        try {
            if (!peerConnectionRef.current) {
                initializePeerConnection();
            }

            await handleRemoteDescription(peerConnectionRef.current, new RTCSessionDescription(incomingCall.offer));

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: incomingCall.type === "video",
            });

            setLocalStream(stream);
            setRemoteStream(stream);
            setCallType(incomingCall.type);
            setInCall(true);
            setIsBroadcastCall(incomingCall.isBroadcast);

            stream.getTracks().forEach((track) => {
                console.log("Adding track to peer connection", track);
                peerConnectionRef.current.addTrack(track, stream);
            });

            const answer = await createAnswer(peerConnectionRef.current);
            console.log("Created answer", answer);

            await peerConnectionRef.current.setLocalDescription(answer);

            if (socket) {
                if (incomingCall.isBroadcast) {
                    socket.emit("broadcast-call-answer", { answer });
                } else {
                    socket.emit("call-answer", { to: incomingCall.from, answer });
                }
                console.log(`Emitting ${incomingCall.isBroadcast ? 'broadcast' : 'private'} call answer`);
            } else {
                console.error("Socket is not available");
            }

            setIncomingCall(null);
        } catch (error) {
            console.error("Error accepting call:", error);
        }
    };

    const handleCallAnswer = async ({ from, answer }) => {
        console.log("User received call answer from:", from, "Answer:", answer);

        try {
            if (peerConnectionRef.current) {
                await handleRemoteDescription(
                    peerConnectionRef.current,
                    new RTCSessionDescription(answer)
                );
                console.log("User successfully set remote description");
            }
        } catch (error) {
            console.error("User error setting remote description:", error);
        }
    };

    const rejectCall = () => {
        if (!incomingCall) return;
        socket.emit("call-rejected", { to: incomingCall.from });
        setIncomingCall(null);
    };

    const handleIceCandidate = async ({ from, candidate, isBroadcast }) => {
        console.log(`User received ${isBroadcast ? 'broadcast' : 'private'} ICE candidate from:`, from, "Candidate:", candidate);

        try {
            if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
                await addIceCandidate(peerConnectionRef.current, new RTCIceCandidate(candidate));
                console.log("User successfully added ICE candidate");
            } else {
                console.log("Storing ICE candidate");
                // Store the ICE candidate to be added later
            }
        } catch (error) {
            console.error("User error adding ICE candidate:", error);
        }
    };


    const handleEndCall = () => {
        console.log("UserChat: Ending call");
        if (localStream) {
            localStream.getTracks().forEach(track => {
                track.stop();
                console.log("UserChat: Stopped track:", track.kind);
            });
            setLocalStream(null);
        }
        setRemoteStream(null);
        setInCall(false);
        setCallType(null);
        setIsBroadcastCall(false);

        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            console.log("UserChat: Closed peer connection");
        }
        initializePeerConnection();

        if (isBroadcastCall) {
            socket.emit("leave-broadcast-call");
        } else {
            socket.emit("end-call", { to: admin });
        }
    };

    const endCall = () => {
        handleEndCall();
    };
    const handleCallRejected = () => {
        handleEndCall();
    };

    return (
        <div className="chat-container">
            <nav>
                <h1>Chat with Admin</h1>
            </nav>
            <div className="message-container" ref={messageContainerRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender === userId ? "user" : "admin"}`}>
                        {msg.sender === userId ? "You: " : "Admin: "}
                        {msg.text && <p>{msg.text}</p>}
                        {msg.fileUrl && (
                            <div>
                                {msg.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                    <img
                                        src={`${process.env.REACT_APP_API_URL}${msg.fileUrl}`}
                                        alt="attachment"
                                        style={{ width: "300px", height: "auto", objectFit: "cover" }}
                                    />
                                ) : msg.fileUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                                    <video controls style={{ width: "300px", height: "auto", objectFit: "cover" }}>
                                        <source src={`${process.env.REACT_APP_API_URL}${msg.fileUrl}`} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                ) : msg.fileUrl.match(/\.(pdf)$/i) ? (
                                    <iframe
                                        src={`${process.env.REACT_APP_API_URL}${msg.fileUrl}`}
                                        style={{ width: "300px", height: "auto", border: "none" }}
                                        title="PDF Attachment"
                                    />
                                ) : (
                                    <p>
                                        <a href={`${process.env.REACT_APP_API_URL}${msg.fileUrl}`} rel="noopener noreferrer">
                                            Download Attachment
                                        </a>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {chatDeactivated && (
                <div className="chat-deactivated-message">
                    <p>Chat is currently deactivated. You cannot send or receive messages.</p>
                </div>
            )}
            <form className="send-container" onSubmit={handleSubmit}>
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    type="text"
                    placeholder="Type a message..."
                    disabled={chatDeactivated}
                />
                <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={chatDeactivated}
                />
                <button type="submit" disabled={chatDeactivated}>Send</button>
            </form>
            {!inCall && (
                <div className="call-buttons">
                    <button onClick={() => startCall("audio")}>Start Voice Call</button>
                    <button onClick={() => startCall("video")}>Start Video Call</button>
                </div>
            )}
            {incomingCall && (
                <div className="incoming-call">
                    <h3>Incoming {incomingCall.isBroadcast ? 'Broadcast' : 'Private'} {incomingCall.type} call</h3>
                    <button onClick={acceptCall}>Accept</button>
                    <button onClick={rejectCall}>Reject</button>
                </div>
            )}
            {inCall && (
                <div className="call-container">
                    <h3>{isBroadcastCall ? 'Broadcast' : 'Private'} {callType === "audio" ? "Voice" : "Video"} Call in progress</h3>
                    {callType === "video" && (
                        <div className="video-streams">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                                style={{ width: "300px", height: "225px" }}
                            />
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                style={{ width: "300px", height: "225px" }}
                            />
                        </div>
                    )}
                    {callType === "audio" && (
                        <audio ref={remoteVideoRef} autoPlay />
                    )}
                    <button onClick={handleEndCall}>End Call</button>
                </div>
            )}
        </div>
    );
};

export default UserChat;