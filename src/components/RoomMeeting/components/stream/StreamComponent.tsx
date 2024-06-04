import React, { useState, ChangeEvent, KeyboardEvent } from 'react';
import './StreamComponent.css';
import OvVideoComponent from './OvVideo';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophoneSlash, faVideoSlash, faVolumeUp, faVolumeMute, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

interface StreamComponentProps {
  user: any; // 정확한 타입을 알고 있다면 해당 타입으로 변경하세요
  handleNickname: (nickname: string) => void;
}

const StreamComponent: React.FC<StreamComponentProps> = ({ user, handleNickname }) => {
  const [nickname, setNickname] = useState(user.getNickname());
  const [showForm, setShowForm] = useState(false);
  const [mutedSound, setMutedSound] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);

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
          <div id="nicknameForm">
            <button className="icon-button" onClick={toggleNicknameForm}>
              <FontAwesomeIcon icon={faTimesCircle} size="lg" />
            </button>
            <label htmlFor="name-simple" id="label">
              Nickname
            </label>
            <input
              id="input"
              value={nickname}
              onChange={handleChange}
              onKeyPress={handlePressKey}
              required
            />
            {!isFormValid && nickname.length <= 3 && (
              <div id="name-error-text">Nickname is too short!</div>
            )}
            {!isFormValid && nickname.length >= 20 && (
              <div id="name-error-text">Nickname is too long!</div>
            )}
          </div>
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
                <FontAwesomeIcon icon={faVideoSlash} size="lg" />
              </div>
            ) : null}

            {!user.isAudioActive() ? (
              <div id="micIcon">
                <FontAwesomeIcon icon={faMicrophoneSlash} size="lg" />
              </div>
            ) : null}
          </div>
          <div>
            {!user.isLocal() && (
              <button className="icon-button" id="volumeButton" onClick={toggleSound}>
                {mutedSound ? <FontAwesomeIcon icon={faVolumeMute} size="lg" color="red" /> : <FontAwesomeIcon icon={faVolumeUp} size="lg" />}
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default StreamComponent;
