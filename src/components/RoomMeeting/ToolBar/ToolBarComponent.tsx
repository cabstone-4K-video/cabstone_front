import React, { useState } from 'react';
import './ToolbarComponent.css';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Mic from '@mui/icons-material/Mic';
import MicOff from '@mui/icons-material/MicOff';
import Videocam from '@mui/icons-material/Videocam';
import VideocamOff from '@mui/icons-material/VideocamOff';
import Fullscreen from '@mui/icons-material/Fullscreen';
import FullscreenExit from '@mui/icons-material/FullscreenExit';
import SwitchVideoIcon from '@mui/icons-material/SwitchVideo';
import PictureInPicture from '@mui/icons-material/PictureInPicture';
import ScreenShare from '@mui/icons-material/ScreenShare';
import StopScreenShare from '@mui/icons-material/StopScreenShare';
import Tooltip from '@mui/material/Tooltip';
import PowerSettingsNew from '@mui/icons-material/PowerSettingsNew';
import QuestionAnswer from '@mui/icons-material/QuestionAnswer';
import IconButton from '@mui/material/IconButton';
import logo from '../../../assets/logo.png';

interface ToolbarComponentProps {
    sessionId: string;
    user: any; // 정확한 타입을 알고 있다면 any 대신 그 타입을 사용하세요
    micStatusChanged: () => void;
    camStatusChanged: () => void;
    screenShare: () => void;
    stopScreenShare: () => void;
    toggleFullscreen: () => void;
    switchCamera: () => void;
    leaveSession: () => void;
    toggleChat: () => void;
    showNotification: boolean;
}

const ToolbarComponent: React.FC<ToolbarComponentProps> = ({
    sessionId,
    user,
    micStatusChanged,
    camStatusChanged,
    screenShare,
    stopScreenShare,
    toggleFullscreen,
    switchCamera,
    leaveSession,
    toggleChat,
    showNotification,
}) => {
    const [fullscreen, setFullscreen] = useState<boolean>(false);

    const handleMicStatusChanged = () => {
        micStatusChanged();
    };

    const handleCamStatusChanged = () => {
        camStatusChanged();
    };

    const handleScreenShare = () => {
        screenShare();
    };

    const handleStopScreenShare = () => {
        stopScreenShare();
    };

    const handleToggleFullscreen = () => {
        setFullscreen(!fullscreen);
        toggleFullscreen();
    };

    const handleSwitchCamera = () => {
        switchCamera();
    };

    const handleLeaveSession = () => {
        leaveSession();
    };

    const handleToggleChat = () => {
        toggleChat();
    };

    return (
        <AppBar className="toolbar" id="header">
            <Toolbar className="toolbar">
                <div id="navSessionInfo">
                    <img id="header_img" alt="OpenVidu Logo" src={logo} />
                    {sessionId && (
                        <div id="titleContent">
                            <span id="session-title">{sessionId}</span>
                        </div>
                    )}
                </div>

                <div className="buttonsContent">
                    <IconButton color="inherit" className="navButton" id="navMicButton" onClick={handleMicStatusChanged}>
                        {user && user.isAudioActive() ? <Mic /> : <MicOff color="secondary" />}
                    </IconButton>

                    <IconButton color="inherit" className="navButton" id="navCamButton" onClick={handleCamStatusChanged}>
                        {user && user.isVideoActive() ? <Videocam /> : <VideocamOff color="secondary" />}
                    </IconButton>

                    <IconButton color="inherit" className="navButton" onClick={handleScreenShare}>
                        {user && user.isScreenShareActive() ? <PictureInPicture /> : <ScreenShare />}
                    </IconButton>

                    {user && user.isScreenShareActive() && (
                        <IconButton onClick={handleStopScreenShare} id="navScreenButton">
                            <StopScreenShare color="secondary" />
                        </IconButton>
                    )}

                    <IconButton color="inherit" className="navButton" onClick={handleSwitchCamera}>
                        <SwitchVideoIcon />
                    </IconButton>
                    <IconButton color="inherit" className="navButton" onClick={handleToggleFullscreen}>
                        {user && fullscreen ? <FullscreenExit /> : <Fullscreen />}
                    </IconButton>
                    <IconButton color="secondary" className="navButton" onClick={handleLeaveSession} id="navLeaveButton">
                        <PowerSettingsNew />
                    </IconButton>
                    <IconButton color="inherit" onClick={handleToggleChat} id="navChatButton">
                        {showNotification && <div id="point" className="" />}
                        <Tooltip title="Chat">
                            <QuestionAnswer />
                        </Tooltip>
                    </IconButton>
                </div>
            </Toolbar>
        </AppBar>
    );
};

export default ToolbarComponent;
