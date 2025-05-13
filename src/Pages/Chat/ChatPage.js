import { useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import socket from './sockets';


const ChatPage = () => {
    const location = useLocation();
    const { id: receiverId, username } = location.state || {};
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [userData, setUserData] = useState(null);

    const storedUser =
        JSON.parse(sessionStorage.getItem("user")) ||
        JSON.parse(localStorage.getItem("user"));
    const senderEmail = storedUser?.email;


    // Fetch user data
    useEffect(() => {
        if (receiverId) {
            axios.get(`http://localhost:5000/api/auth/users/${receiverId}`)
                .then(res => setUserData(res.data))
                .catch(err => console.error("Failed to fetch user data:", err));
        }
    }, [receiverId]);

    // Poll messages every 3 seconds
   // Fetch messages by email instead of id
useEffect(() => {
    if (senderEmail && userData?.email) {
        const fetchMessages = () => {
            axios.get(`http://localhost:5000/api/chat/conversation/${senderEmail}/${userData.email}`)
                .then(res => setMessages(res.data))
                .catch(err => console.error("Error fetching messages:", err));
        };

        fetchMessages(); // initial fetch
    }
}, [senderEmail, userData]);


 useEffect(() => {
    const handleMessage = (message) => {
        if (
            (message.senderEmail === storedUser.email && message.receiverEmail === userData.email) ||
            (message.senderEmail === userData.email && message.receiverEmail === storedUser.email)
        ) {
            setMessages((prevMessages) => [...prevMessages, message]);
        }
    };

    socket.on('receive_message', handleMessage);

    // Cleanup when component unmounts or re-renders
    return () => {
        socket.off('receive_message', handleMessage);
    };
}, [storedUser, userData]);


   const handleSend = async () => {
    if (input.trim() === '') return;

    try {
        const payload = {
            senderEmail,
            receiverEmail: userData.email,
            text: input
        };

        const res = await axios.post('http://localhost:5000/api/chat/send', payload);

        // Emit the message to the socket server
        socket.emit('send_message', res.data);

        setMessages((prev) => [...prev, res.data]);
        setInput('');
    } catch (err) {
        console.error("Error sending message:", err);
    }
};


    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className='main-chatPage'>
            <div className='container'>
                <div className='chat_header'>
                <h2>Chat with {username}</h2>
                <hr />
                </div>

                <div className="chat_messages">
                    {messages.map((msg, index) => {
                        const isUser = msg.senderEmail === senderEmail;
                        const avatarSrc = isUser
                            ? `http://localhost:5000${storedUser?.avatar || '/assets/default-profile.png'}`
                            : `http://localhost:5000${userData?.avatar || '/assets/default-profile.png'}`;
                        const displayName = isUser ? storedUser?.username : userData?.username;

                        return (
                            <div key={index} className={`chat_bubble_row ${isUser ? 'user' : 'other'}`}>
                                {!isUser && (
                                    <div className="sender_info">
                                        <img className="avatar" src={avatarSrc} alt={displayName} />
                                        {/* <span className="username">{displayName}</span> */}
                                    </div>
                                )}
                                <div className={`chat_bubble ${isUser ? 'user' : 'other'}`}>
                                    {msg.text}
                                </div>
                                {isUser && (
                                    <div className="sender_info">
                                        {/* <span className="username">{displayName}</span> */}
                                        <img className="avatar" src={avatarSrc} alt={displayName} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="chat_input">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                    />
                    <button onClick={handleSend}>➔</button>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
