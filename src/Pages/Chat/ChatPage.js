import { useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const ChatPage = () => {
    const location = useLocation();
    const { id: receiverId, username } = location.state || {};
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [userData, setUserData] = useState(null);

    const storedUser =
        JSON.parse(sessionStorage.getItem("user")) ||
        JSON.parse(localStorage.getItem("user"));
    const senderId = storedUser?.id;

    // Fetch user data
    useEffect(() => {
        if (receiverId) {
            axios.get(`http://localhost:5000/api/auth/users/${receiverId}`)
                .then(res => setUserData(res.data))
                .catch(err => console.error("Failed to fetch user data:", err));
        }
    }, [receiverId]);

    // Poll messages every 3 seconds
    useEffect(() => {
        let interval;
        if (senderId && receiverId) {
            const fetchMessages = () => {
                axios.get(`http://localhost:5000/api/chat/conversation/${senderId}/${receiverId}`)
                    .then(res => setMessages(res.data))
                    .catch(err => console.error("Error fetching messages:", err));
            };

            fetchMessages(); // initial fetch
            // interval = setInterval(fetchMessages, 1000); 
        }

        return () => clearInterval(interval); // cleanup on unmount
    }, [senderId, receiverId]);

    useEffect(() => {
        // Listen for incoming messages from other clients
        socket.on('receive_message', (message) => {
          setMessages((prevMessages) => [...prevMessages, message]);
        });
      }, []);

    const handleSend = async () => {
        if (input.trim() === '') return;

        try {
            const payload = { senderId, receiverId, text: input };
            const res = await axios.post('http://localhost:5000/api/chat/send', payload);
            setMessages((prev) => [...prev, res.data]); // optional, since polling will get the message too
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
                <h2>Chat with {username}</h2>
                <hr />

                <div className="chat_messages">
                    {messages.map((msg, index) => {
                        const isUser = msg.senderId === senderId;
                        const avatarSrc = isUser
                            ? `http://localhost:5000${storedUser?.avatar || '/assets/default-profile.png'}`
                            : `http://localhost:5000${userData?.avatar || '/assets/default-profile.png'}`;
                        const displayName = isUser ? storedUser?.username : userData?.username;

                        return (
                            <div key={index} className={`chat_bubble_row ${isUser ? 'user' : 'other'}`}>
                                {!isUser && (
                                    <div className="sender_info">
                                        <img className="avatar" src={avatarSrc} alt={displayName} />
                                        <span className="username">{displayName}</span>
                                    </div>
                                )}
                                <div className={`chat_bubble ${isUser ? 'user' : 'other'}`}>
                                    {msg.text}
                                </div>
                                {isUser && (
                                    <div className="sender_info">
                                        <span className="username">{displayName}</span>
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
