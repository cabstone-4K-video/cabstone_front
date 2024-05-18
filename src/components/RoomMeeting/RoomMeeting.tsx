import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store'; 
import classes from './RoomMeeting.module.css';
import UtilBar from './UtilBar/UtilBar';
import ParticipantsBox from './ParticipantsBox/ParticipantsBox';
import Chatting from './WebSocketChatting/Chatting';

const RoomMeeting: React.FC = () => {
  
  const connectionInfo = useSelector((state: RootState) => state.connectionInfo);

  const [visibleChat, setVisibleChat] = useState<boolean>();


  return (
    <div className={classes.container}>
			<div className={classes.callBox}>
        <ParticipantsBox/>
        <UtilBar/>
      </div>
      <div className={classes.chatting}>
        <button
          className={classes.chatting_visibleButton}
          onClick={()=>setVisibleChat(!visibleChat)}
        >
          {visibleChat ? '<<' : '>>'}
        </button>
        {visibleChat && <Chatting/>}
        
      </div>
      
      
    </div>
  );
};

export default RoomMeeting;
