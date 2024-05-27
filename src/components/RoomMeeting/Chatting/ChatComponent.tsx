import React, { useState, useEffect, useRef } from 'react';
import IconButton from '@mui/material/IconButton';
import Fab from '@mui/material/Fab';
import HighlightOff from '@mui/icons-material/HighlightOff';
import Send from '@mui/icons-material/Send';
import Tooltip from '@mui/material/Tooltip';
import './ChatComponent.css';

interface ChatComponentProps {
    user: any;
    chatDisplay: string;
    messageReceived: () => void;
    close: (param: any) => void;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ user, chatDisplay, messageReceived, close }) => {
    const [messageList, setMessageList] = useState<any[]>([]);
    const [message, setMessage] = useState('');
    const chatScroll = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleSignalChat = (event: any) => {
            const data = JSON.parse(event.data);
            setMessageList((prevMessageList) => [
                ...prevMessageList,
                { connectionId: event.from.connectionId, nickname: data.nickname, message: data.message }
            ]);
            setTimeout(() => {
                const userImg = document.getElementById('userImg-' + (messageList.length - 1)) as HTMLCanvasElement;
                const video = document.getElementById('video-' + data.streamId) as HTMLVideoElement;
                const avatar = userImg.getContext('2d');
                if (avatar && video) {
                    avatar.drawImage(video, 200, 120, 285, 285, 0, 0, 60, 60);
                }
                messageReceived();
            }, 50);
            scrollToBottom();
        };

        user.getStreamManager().stream.session.on('signal:chat', handleSignalChat);
        return () => {
            user.getStreamManager().stream.session.off('signal:chat', handleSignalChat);
        };
    }, [user, messageList, messageReceived]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(event.target.value);
    };

    const handlePressKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    };

    const sendMessage = () => {
        if (user && message) {
            let trimmedMessage = message.replace(/ +(?= )/g, '');
            if (trimmedMessage !== '' && trimmedMessage !== ' ') {
                const data = {
                    message: trimmedMessage,
                    nickname: user.getNickname(),
                    streamId: user.getStreamManager().stream.streamId
                };
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
            try {
                if (chatScroll.current) {
                    chatScroll.current.scrollTop = chatScroll.current.scrollHeight;
                }
            } catch (err) {}
        }, 20);
    };

    const handleClose = () => {
        close(undefined);
    };

    const styleChat = { display: chatDisplay };

    return (
        <div id="chatContainer">
            <div id="chatComponent" style={styleChat}>
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