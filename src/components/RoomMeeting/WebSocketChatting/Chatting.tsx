import React, { useEffect, useState } from 'react';
import axios from '../../../apis/axios';
import classes from './Chatting.module.css';
import MyChatting from './MyChatting/MyChatting';
import OtherChatting from './OtherChatting/OtherChatting';
import WebSocketService from './WebSocketService/WebSocketService';

const Chatting: React.FC = () => {
  const [messages, setMessages] = useState<{ user: string, text: string }[]>([]);
  const [input, setInput] = useState<string>('');
  const userName = localStorage.getItem('userName') || ''; // connectionInfo에서 가져온 유저 이름으로 변경하기

  useEffect(() => {
    WebSocketService.connect('ws://localhost:8080/ws');

    WebSocketService.on('message', (data: any) => {
      setMessages(prevMessages => [...prevMessages, data]);
    });

    return () => {
      WebSocketService.off('message', (data: any) => {
        setMessages(prevMessages => [...prevMessages, data]);
      });
    };
  }, []);

  const sendMessage = async () => {
    if (input.trim() === '') return;
    const message = { user: userName, text: input };
    try {
      await axios.post('/chat/sendMessage', message);
      WebSocketService.send({ type: 'message', ...message });
      setMessages(prevMessages => [...prevMessages, message]);
      setInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className={classes.chattingBox}>
      {messages.map((msg, index) => (
        msg.user === userName ? 
          <MyChatting key={index}>{msg.text}</MyChatting> : 
          <OtherChatting key={index}>{msg.text}</OtherChatting>
      ))}
      <input 
        type="text" 
        value={input} 
        onChange={(e) => setInput(e.target.value)} 
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()} 
        className={classes.input} 
      />
      <button onClick={sendMessage} className={classes.sendButton}>Send</button>
    </div>
  );
};

export default Chatting;
