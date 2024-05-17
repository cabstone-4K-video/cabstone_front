import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store'; 
import classes from './RoomMeeting.module.css';
import UtilBar from './UtilBar/UtilBar';
import ParticipantsBox from './ParticipantsBox/ParticipantsBox';

const RoomMeeting: React.FC = () => {
  
  const connectionInfo = useSelector((state: RootState) => state.connectionInfo);

  return (
    <div className={classes.container}>
			<ParticipantsBox/>
      <UtilBar/>
    </div>
  );
};

export default RoomMeeting;
