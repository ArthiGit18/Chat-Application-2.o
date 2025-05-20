import React, { useState } from 'react';
import axios from 'axios';

export const Home = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (input.trim() !== '') {
      const userMessage = { text: input, type: 'user' };
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setTimeout(() => getBotReply(input), 500);
    }
  };

  const getBotReply = async (userText) => {
    try {
      const response = await axios.get('http://api.wit.ai/message', {
        params: { q: userText },
        headers: {
          Authorization: `LZ7IPSZ6FP5GKRP6ZS7KJQWXEBKIHWN4`, // 🔁 Replace this
        },
      });

      const intent = response.data.intents?.[0]?.name || 'unknown';

      let reply = "Sorry, I didn't understand.";
      if (intent === 'greet') reply = "Hello! How can I help you today?";
      else if (intent === 'goodbye') reply = "Goodbye! Have a nice day!";
      else if (intent === 'thanks') reply = "You're welcome!";
      // Add more intent-reply pairs as needed

      const botMessage = { text: reply, type: 'bot' };
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error('Wit.ai API error:', error);
      setMessages((prev) => [
        ...prev,
        { text: "Sorry, something went wrong with the bot.", type: 'bot' },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="home_container">
      <div className="boxes_row">
        <div className="box">"Believe in yourself!"</div>
        <div className="box">"Every day is a new beginning."</div>
        <div className="box">"Dream big, work hard!"</div>
      </div>

      <div className="chat_messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat_bubble ${msg.type}`}>
            {msg.text}
          </div>
        ))}
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
  );
};
