import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash, faShareSquare, faPhone, faComment } from '@fortawesome/free-solid-svg-icons'; // faComment 추가
import styles from './ToolBar.module.css';
import { RootState } from '../../../store/store';
import { toggleMicrophone, toggleCamera } from '../../../store/connectionSlice';
import { useNavigate } from 'react-router-dom';

interface ToolBarProps {
  switchCamera: () => void;
  leaveSession: () => void;
  shareScreen: () => void;
  roomName: string;
  toggleChat: () => void; // toggleChat 추가
}

const ToolBar: React.FC<ToolBarProps> = ({ switchCamera, leaveSession, shareScreen, roomName, toggleChat }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const microphoneEnabled = useSelector((state: RootState) => state.connectionInfo.microphoneEnabled);
  const cameraEnabled = useSelector((state: RootState) => state.connectionInfo.cameraEnabled);

  const handleMicrophoneToggle = () => {
    dispatch(toggleMicrophone());
  };

  const handleCameraToggle = () => {
    dispatch(toggleCamera());
  };

  const handleLeaveSession = () => {
    leaveSession();
    navigate('/setting/roomSelect');
  };

  return (
    <div className={styles.toolBar}>
      <span className={styles.roomName}>{roomName}</span>
			<div className={styles.center_content}>
				<button className={styles.iconButton} onClick={handleMicrophoneToggle}>
					<FontAwesomeIcon icon={microphoneEnabled ? faMicrophone : faMicrophoneSlash} />
				</button>
				<button className={styles.iconButton} onClick={switchCamera}>
					<FontAwesomeIcon icon={cameraEnabled ? faVideo : faVideoSlash} />
				</button>
				<button className={styles.iconButton} onClick={shareScreen}>
					<FontAwesomeIcon icon={faShareSquare} />
				</button>
				<button className={styles.iconButton} onClick={handleLeaveSession}>
					<FontAwesomeIcon icon={faPhone} />
				</button>
			</div>
      
      <button className={styles.iconButton} onClick={toggleChat}>
        <FontAwesomeIcon icon={faComment} />
      </button>
    </div>
  );
};

export default ToolBar;
