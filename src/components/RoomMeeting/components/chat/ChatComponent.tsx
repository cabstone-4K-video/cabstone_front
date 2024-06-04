import React, { Component, ChangeEvent, KeyboardEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

import './ChatComponent.css';

interface ChatComponentProps {
  user: any; // 정확한 타입을 알고 있다면 해당 타입으로 변경하세요
  chatDisplay: string;
  close: (display: string | undefined) => void;
  messageReceived: () => void;
}

interface ChatComponentState {
  messageList: Array<{ connectionId: string; nickname: string; message: string }>;
  message: string;
}

export default class ChatComponent extends Component<ChatComponentProps, ChatComponentState> {
  chatScroll: React.RefObject<HTMLDivElement>;

  constructor(props: ChatComponentProps) {
    super(props);
    this.state = {
      messageList: [],
      message: '',
    };
    this.chatScroll = React.createRef();

    this.handleChange = this.handleChange.bind(this);
    this.handlePressKey = this.handlePressKey.bind(this);
    this.close = this.close.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  }

  componentDidMount() {
    this.props.user.getStreamManager().stream.session.on('signal:chat', (event: any) => {
      const data = JSON.parse(event.data);
      let messageList = this.state.messageList;
      messageList.push({ connectionId: event.from.connectionId, nickname: data.nickname, message: data.message });
      const document = window.document;
      setTimeout(() => {
        const userImg = document.getElementById('userImg-' + (this.state.messageList.length - 1)) as HTMLCanvasElement;
        const video = document.getElementById('video-' + data.streamId) as HTMLVideoElement;
        if (userImg && video) {
          const avatar = userImg.getContext('2d');
          if (avatar) {
            avatar.drawImage(video, 200, 120, 285, 285, 0, 0, 60, 60);
          }
        }
        this.props.messageReceived();
      }, 50);
      this.setState({ messageList: messageList });
      this.scrollToBottom();
    });
  }

  handleChange(event: ChangeEvent<HTMLInputElement>) {
    this.setState({ message: event.target.value });
  }

  handlePressKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  sendMessage() {
    if (this.props.user && this.state.message) {
      let message = this.state.message.replace(/ +(?= )/g, '');
      if (message !== '' && message !== ' ') {
        const data = { message: message, nickname: this.props.user.getNickname(), streamId: this.props.user.getStreamManager().stream.streamId };
        this.props.user.getStreamManager().stream.session.signal({
          data: JSON.stringify(data),
          type: 'chat',
        });
      }
    }
    this.setState({ message: '' });
  }

  scrollToBottom() {
    setTimeout(() => {
      try {
        if (this.chatScroll.current) {
          this.chatScroll.current.scrollTop = this.chatScroll.current.scrollHeight;
        }
      } catch (err) {}
    }, 20);
  }

  close() {
    this.props.close(undefined);
  }

  render() {
    const styleChat = { display: this.props.chatDisplay };
    return (
      <div id="chatContainer">
        <div id="chatComponent" style={styleChat}>
          <div id="chatToolbar">
            <span>{this.props.user.getStreamManager().stream.session.sessionId} - CHAT</span>
            <button id="closeButton" onClick={this.close} className="icon-button">
              <FontAwesomeIcon icon={faTimesCircle} color="red" size="lg" />
            </button>
          </div>
          <div className="message-wrap" ref={this.chatScroll}>
            {this.state.messageList.map((data, i) => (
              <div
                key={i}
                id="remoteUsers"
                className={
                  'message' + (data.connectionId !== this.props.user.getConnectionId() ? ' left' : ' right')
                }
              >
                <canvas id={'userImg-' + i} width="60" height="60" className="user-img" />
                <div className="msg-detail">
                  <div className="msg-info">
                    <p> {data.nickname}</p>
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
              value={this.state.message}
              onChange={this.handleChange}
              onKeyPress={this.handlePressKey}
            />
            <button className="icon-button" id="sendButton" onClick={this.sendMessage}>
              <FontAwesomeIcon icon={faPaperPlane} size="lg" />
            </button>
          </div>
        </div>
      </div>
    );
  }
}
