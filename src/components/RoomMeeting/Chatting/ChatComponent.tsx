import React, { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react';
import IconButton from '@mui/material/IconButton';
import Fab from '@mui/material/Fab';
import HighlightOff from '@mui/icons-material/HighlightOff';
import Send from '@mui/icons-material/Send';
import Tooltip from '@mui/material/Tooltip';
import './ChatComponent.css';

interface ChatComponentProps {
    user: any;
    chatDisplay: string;
    close: (value: undefined) => void;
    messageReceived: () => void;
}

interface Message {
    connectionId: string;
    nickname: string;
    message: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ user, chatDisplay, close, messageReceived }) => {
    const [messageList, setMessageList] = useState<Message[]>([]);
    const [message, setMessage] = useState<string>('');
    const chatScroll = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const session = user.getStreamManager().stream.session;
        const messageHandler = (event: any) => {
            const data = JSON.parse(event.data);
            const newMessageList = [...messageList, { connectionId: event.from.connectionId, nickname: data.nickname, message: data.message }];
            setMessageList(newMessageList);
            const document = window.document;
            setTimeout(() => {
                const userImg = document.getElementById('userImg-' + (newMessageList.length - 1)) as HTMLCanvasElement;
                const video = document.getElementById('video-' + data.streamId) as HTMLVideoElement;
                const avatar = userImg.getContext('2d');
                if (avatar && video) {
                    avatar.drawImage(video, 200, 120, 285, 285, 0, 0, 60, 60);
                }
                messageReceived();
            }, 50);
            scrollToBottom();
        };

        session.on('signal:chat', messageHandler);

        return () => {
            session.off('signal:chat', messageHandler);
        };
    }, [messageList, user, messageReceived]);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setMessage(event.target.value);
    };

    const handlePressKey = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    };

    const sendMessage = () => {
        if (user && message) {
            let trimmedMessage = message.trim();
            if (trimmedMessage !== '') {
                const data = { message: trimmedMessage, nickname: user.getNickname(), streamId: user.getStreamManager().stream.streamId };
                user.getStreamManager().stream.session.signal({
                    data: JSON.stringify(data),
                    type: 'chat',
                });
            }
        }
        setMessage('');
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            if (chatScroll.current) {
                chatScroll.current.scrollTop = chatScroll.current.scrollHeight;
            }
        }, 20);
    };

    const handleClose = () => {
        close(undefined);
    };

    return (
        <div id="chatContainer">
            <div id="chatComponent" style={{ display: chatDisplay }}>
                <div id="chatToolbar">
                    <span>{user.getStreamManager().stream.session.sessionId} - CHAT</span>
                    <IconButton id="closeButton" onClick={handleClose}>
                        <HighlightOff color="secondary" />
                    </IconButton>
                </div>
                <div className="message-wrap" ref={chatScroll}>
                    {messageList.map((data, i) => (
                        <div
                            key={i}
                            id="remoteUsers"
                            className={
                                'message' + (data.connectionId !== user.getConnectionId() ? ' left' : ' right')
                            }
                        >
                            <canvas id={'userImg-' + i} width="60" height="60" className="user-img" />
                            <div className="msg-detail">
                                <div className="msg-info">
                                    <p>{data.nickname}</p>
                                </div>
                                <div className="msg-content">
                                    <span className="triangle" />
                                    <p className="text">{data.message}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div id="messageInput">
                    <input
                        placeholder="Send a message"
                        id="chatInput"
                        value={message}
                        onChange={handleChange}
                        onKeyPress={handlePressKey}
                    />
                    <Tooltip title="Send message">
                        <Fab size="small" id="sendButton" onClick={sendMessage}>
                            <Send />
                        </Fab>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
};

export default ChatComponent;
