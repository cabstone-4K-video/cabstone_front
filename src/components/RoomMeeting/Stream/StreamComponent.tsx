
import React, { useState, ChangeEvent, KeyboardEvent } from 'react';
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

interface StreamComponentProps {
    user: any; // 정확한 타입을 알고 있다면 any 대신 그 타입을 사용하세요
    handleNickname: (nickname: string) => void;
}

const StreamComponent: React.FC<StreamComponentProps> = ({ user, handleNickname }) => {
    const [nickname, setNickname] = useState<string>(user.getNickname());
    const [showForm, setShowForm] = useState<boolean>(false);
    const [mutedSound, setMutedSound] = useState<boolean>(false);
    const [isFormValid, setIsFormValid] = useState<boolean>(true);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setNickname(event.target.value);
        event.preventDefault();
    };

    const toggleNicknameForm = () => {
        if (user.isLocal()) {
            setShowForm(!showForm);
        }
    };

    const toggleSound = () => {
        setMutedSound(!mutedSound);
    };

    const handlePressKey = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            console.log(nickname);
            if (nickname.length >= 3 && nickname.length <= 20) {
                handleNickname(nickname);
                toggleNicknameForm();
                setIsFormValid(true);
            } else {
                setIsFormValid(false);
            }
        }
    };

    return (
        <div className="OT_widget-container">
            <div className="pointer nickname">
                {showForm ? (
                    <FormControl id="nicknameForm">
                        <IconButton color="inherit" id="closeButton" onClick={toggleNicknameForm}>
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
                        {!user.isVideoActive() && (
                            <div id="camIcon">
                                <VideocamOff id="statusCam" />
                            </div>
                        )}
                        {!user.isAudioActive() && (
                            <div id="micIcon">
                                <MicOff id="statusMic" />
                            </div>
                        )}
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
