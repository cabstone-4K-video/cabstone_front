import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store'; 
import classes from './RoomMeeting.module.css';
import UtilBar from './UtilBar/UtilBar';

const RoomMeeting: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const connectionInfo = useSelector((state: RootState) => state.connectionInfo);

  return (
    <div className={classes.container}>
      <UtilBar/>
    </div>
  );
};

export default RoomMeeting;
