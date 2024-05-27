import React, { useState, useCallback } from 'react';
import './StreamComponent.css';
import OvVideoComponent from './OvVideo';

import MicOff from '@mui/icons-material/MicOff';
import VideocamOff from '@mui/icons-material/VideocamOff';
import VolumeUp from '@mui/icons-material/VolumeUp';
import VolumeOff from '@mui/icons-material/VolumeOff';
import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import HighlightOff from '@mui/icons-material/HighlightOff';
import FormHelperText from '@mui/material/FormHelperText';

interface StreamManager {
    addVideoElement: (element: HTMLVideoElement) => void;
    session: {
        on: (event: string, callback: (event: any) => void) => void;
    };
    stream: {
        streamId: string;
    };
}

interface User {
    streamManager: StreamManager;
    getStreamManager: () => StreamManager;
    getNickname: () => string;
    isLocal: () => boolean;
    isVideoActive: () => boolean;
    isAudioActive: () => boolean;
}

interface Props {
    user: User;
    handleNickname: (nickname: string) => void;
}

const StreamComponent: React.FC<Props> = ({ user, handleNickname }) => {
    const [nickname, setNickname] = useState<string>(user.getNickname());
    const [showForm, setShowForm] = useState<boolean>(false);
    const [mutedSound, setMutedSound] = useState<boolean>(false);
    const [isFormValid, setIsFormValid] = useState<boolean>(true);

    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setNickname(event.target.value);
    }, []);

    const toggleNicknameForm = useCallback(() => {
        if (user.isLocal()) {
            setShowForm(!showForm);
        }
    }, [user, showForm]);

    const toggleSound = useCallback(() => {
        setMutedSound(!mutedSound);
    }, [mutedSound]);

    const handlePressKey = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            if (nickname.length >= 3 && nickname.length <= 20) {
                handleNickname(nickname);
                toggleNicknameForm();
                setIsFormValid(true);
            } else {
                setIsFormValid(false);
            }
        }
    }, [nickname, handleNickname, toggleNicknameForm]);

    return (
        <div className="OT_widget-container">
            <div className="pointer nickname">
                {showForm ? (
                    <FormControl id="nicknameForm">
                        <IconButton id="closeButton" onClick={toggleNicknameForm}>
                            <HighlightOff />
                        </IconButton>
                        <InputLabel htmlFor="name-simple" id="label">
                            Nickname
                        </InputLabel>
                        <Input
                            id="input"
                            value={nickname}
                            onChange={handleChange}
                            onKeyPress={handlePressKey}
                            required
                        />
                        {!isFormValid && nickname.length < 3 && (
                            <FormHelperText id="name-error-text">Nickname is too short!</FormHelperText>
                        )}
                        {!isFormValid && nickname.length > 20 && (
                            <FormHelperText id="name-error-text">Nickname is too long!</FormHelperText>
                        )}
                    </FormControl>
                ) : (
                    <div onClick={toggleNicknameForm}>
                        <span id="nickname">{user.getNickname()}</span>
                        {user.isLocal() && <span id=""> (edit)</span>}
                    </div>
                )}
            </div>

            {user !== undefined && user.getStreamManager() !== undefined ? (
                <div className="streamComponent">
                    <OvVideoComponent user={user} mutedSound={mutedSound} />
                    <div id="statusIcons">
                        {!user.isVideoActive() ? (
                            <div id="camIcon">
                                <VideocamOff id="statusCam" />
                            </div>
                        ) : null}

                        {!user.isAudioActive() ? (
                            <div id="micIcon">
                                <MicOff id="statusMic" />
                            </div>
                        ) : null}
                    </div>
                    <div>
                        {!user.isLocal() && (
                            <IconButton id="volumeButton" onClick={toggleSound}>
                                {mutedSound ? <VolumeOff color="secondary" /> : <VolumeUp />}
                            </IconButton>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default StreamComponent;
