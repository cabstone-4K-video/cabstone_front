import React, { useState } from 'react';
import './ToolbarComponent.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
  faExpand,
  faCompress,
  faVideoCamera,
  faExchangeAlt,
  faChalkboardTeacher,
  faTimesCircle,
  faComments
} from '@fortawesome/free-solid-svg-icons';
import logo from '../../../../assets/logo.png';

interface ToolbarComponentProps {
  sessionId: string;
  user: any;
  showNotification: boolean;
  micStatusChanged: () => void;
  camStatusChanged: () => void;
  screenShare: () => void;
  stopScreenShare: () => void;
  toggleFullscreen: () => void;
  switchCamera: () => void;
  leaveSession: () => void;
  toggleChat: () => void;
}

const ToolbarComponent: React.FC<ToolbarComponentProps> = ({
  sessionId,
  user,
  showNotification,
  micStatusChanged,
  camStatusChanged,
  screenShare,
  stopScreenShare,
  toggleFullscreen,
  switchCamera,
  leaveSession,
  toggleChat,
}) => {
  const [fullscreen, setFullscreen] = useState(false);

  const handleToggleFullscreen = () => {
    setFullscreen(!fullscreen);
    toggleFullscreen();
  };

  return (
    <div className="toolbar" id="header">
      <div id="navSessionInfo">
        <img id="header_img" alt="OpenVidu Logo" src={logo} />
        {sessionId && (
          <div id="titleContent">
            <span id="session-title">{sessionId}</span>
          </div>
        )}
      </div>
      <div className="buttonsContent">
        <button className="icon-button" id="navMicButton" onClick={micStatusChanged}>
          {user !== undefined && user.isAudioActive() ? (
            <FontAwesomeIcon icon={faMicrophone} />
          ) : (
            <FontAwesomeIcon icon={faMicrophoneSlash} color="red" />
          )}
        </button>
        <button className="icon-button" id="navCamButton" onClick={camStatusChanged}>
          {user !== undefined && user.isVideoActive() ? (
            <FontAwesomeIcon icon={faVideo} />
          ) : (
            <FontAwesomeIcon icon={faVideoSlash} color="red" />
          )}
        </button>
        <button className="icon-button" onClick={screenShare}>
          {user !== undefined && user.isScreenShareActive() ? (
            <FontAwesomeIcon icon={faChalkboardTeacher} />
          ) : (
            <FontAwesomeIcon icon={faVideoCamera} />
          )}
        </button>
        {user !== undefined && user.isScreenShareActive() && (
          <button className="icon-button" onClick={stopScreenShare} id="navScreenButton">
            <FontAwesomeIcon icon={faTimesCircle} color="red" />
          </button>
        )}
        <button className="icon-button" onClick={switchCamera}>
          <FontAwesomeIcon icon={faExchangeAlt} />
        </button>
        <button className="icon-button" onClick={handleToggleFullscreen}>
          {user !== undefined && fullscreen ? (
            <FontAwesomeIcon icon={faCompress} />
          ) : (
            <FontAwesomeIcon icon={faExpand} />
          )}
        </button>
        <button className="icon-button" onClick={leaveSession} id="navLeaveButton">
          <FontAwesomeIcon icon={faTimesCircle} color="red" />
        </button>
        <button className="icon-button" onClick={toggleChat} id="navChatButton">
          {showNotification && <div id="point" className="" />}
          <FontAwesomeIcon icon={faComments} />
        </button>
      </div>
    </div>
  );
};

export default ToolbarComponent;
