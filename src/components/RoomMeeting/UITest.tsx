import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { OpenViduSession } from 'openvidu-react';
import { Session, SignalOptions } from 'openvidu-browser';
import styles from './UITest.module.css';

const APPLICATION_SERVER_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-production-server.com/api'
  : 'https://localhost:8443/api';

const UITest: React.FC = () => {
  const sessionId = "chat-panel-directive-example";
  const [tokens, setTokens] = useState<{ webcam: string; screen: string }>({ webcam: '', screen: '' });
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      const webcamToken = await getToken();
      const screenToken = await getToken();
      setTokens({ webcam: webcamToken, screen: screenToken });
    };
    fetchTokens();
  }, []);

  useEffect(() => {
    if (session) {
      session.on('signal:chat', (event: any) => {
        const msg = JSON.parse(event.data).message;
        setMessages((prevMessages) => [...prevMessages, msg]);
      });
    }
  }, [session]);

  const getToken = async (): Promise<string> => {
    const sessionId = await createSession(sessionId);
    return await createToken(sessionId);
  };

  const createSession = async (sessionId: string): Promise<string> => {
    const response = await axios.post(
      `${APPLICATION_SERVER_URL}/sessions`,
      { customSessionId: sessionId },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data; // The sessionId
  };

  const createToken = async (sessionId: string): Promise<string> => {
    const response = await axios.post(
      `${APPLICATION_SERVER_URL}/sessions/${sessionId}/connections`,
      {},
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data; // The token
  };

  const onButtonClicked = () => {
    alert('button clicked');
  };

  const handleSessionCreated = (session: Session) => {
    setSession(session);
  };

  const sendMessage = () => {
    if (inputRef.current && session) {
      const message = inputRef.current.value;
      const signalOptions: SignalOptions = {
        data: JSON.stringify({ message }),
        type: 'chat',
        to: undefined,
      };
      session.signal(signalOptions);
      inputRef.current.value = '';
    }
  };

  return (
    <div>
      <OpenViduSession 
        tokens={tokens} 
        toolbarDisplaySessionName={false} 
        onSessionCreated={handleSessionCreated}
      >
        <div className={styles.chatPanel} id="my-panel">
          <h3>Chat</h3>
          <div>
            <ul>
              {messages.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          </div>
          <input ref={inputRef} defaultValue="Hello" />
          <button onClick={sendMessage}>Send</button>
        </div>
      </OpenViduSession>
    </div>
  );
};

export default UITest;
