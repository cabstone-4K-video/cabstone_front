import { useState } from 'react';
import CameraCheck from './CameraCheck/CameraCheck';
import DeviceCheck from './DeviceCheck/DeviceCheck';
import classes from './RoomReady.module.css'
import { useNavigate } from 'react-router-dom';
import AudioTest from './AudioTest/AudioTest';

const RoomReady : React.FC = () => {

	const navigate = useNavigate();

	const handleJoinButton = () => {
		navigate('/main/meetingRoom')
	}

  return (
    <div className={classes.container}>
       <div className={classes.videoContainer}>
					<CameraCheck/>
				</div>
				<div className={classes.checkContainer}>
					<DeviceCheck />
					<AudioTest/>
					<button className={classes.joinSessionButton} onClick={handleJoinButton}>Join session</button>
				</div>
				
    </div>
  )
}

export default RoomReady;