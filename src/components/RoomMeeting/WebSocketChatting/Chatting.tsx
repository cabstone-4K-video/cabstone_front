import { useEffect, useState } from 'react';
import classes from './Chatting.module.css';
import MyChatting from './MyChatting/MyChatting';
import OtherChatting from './OtherChatting/OtherChatting';
import WebSocketService from './WebSocketService/WebSocketService';

const Chatting : React.FC = () => {
  const [messages, setMessages] = useState<{ user: string, text: string }[]>([]);
  const [input, setInput] = useState<string>('');
	const [userName, setUserName] = useState<string>(''); // 이미 connectionInfo를 통해 받아온 유저이름

	useEffect(() => {
    WebSocketService.connect('ws://localhost:8080/chat');
    
    WebSocketService.on('message', (data: any) => {
      setMessages(prevMessages => [...prevMessages, data]);
    });

    return () => {
      WebSocketService.off('message', (data: any) => {
        setMessages(prevMessages => [...prevMessages, data]);
      });
    };
  }, []);

	const sendMessage = () => {
    if (input.trim() === '') return;
    const message = { user: userName, text: input };
    WebSocketService.send({ id: 'message', ...message });
    setMessages(prevMessages => [...prevMessages, message]);
    setInput('');
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
  )
}

export default Chatting;