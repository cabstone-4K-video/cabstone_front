import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import classes from './RoomMeeting.module.css';
import UtilBar from './UtilBar/UtilBar';
import ParticipantsBox from './ParticipantsBox/ParticipantsBox';
import Chatting from './WebSocketChatting/Chatting';

const RoomMeeting: React.FC = () => {
  const connectionInfo = useSelector((state: RootState) => state.connectionInfo);
  const [visibleChat, setVisibleChat] = useState<boolean>(false);

  return (
    <div className={`${classes.container} ${visibleChat ? classes.containerSpaceBetween : classes.containerCentered}`}>
      <div className={`${classes.callBox} ${!visibleChat ? classes.callBoxCentered : ''}`}>
        <ParticipantsBox />
        <UtilBar />
        <button
          className={classes.chatting_visibleButton}
          onClick={() => setVisibleChat(!visibleChat)}
        >
          {visibleChat ? '<<' : '>>'}
        </button>
      </div>
      <div className={`${classes.chatting} ${visibleChat ? classes.chatting_visible : classes.chatting_hidden}`}>
        <Chatting />
      </div>
    </div>
  );
};

export default RoomMeeting;
