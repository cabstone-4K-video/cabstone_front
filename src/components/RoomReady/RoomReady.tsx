
import CameraCheck from './CameraCheck/CameraCheck';
import DeviceCheck from './DeviceCheck/DeviceCheck';
import classes from './RoomReady.module.css'
import { useLocation, useNavigate } from 'react-router-dom';
import AudioTest from './AudioTest/AudioTest';
import { useEffect } from 'react';
import axios from '../../apis/axios';
import { RootState } from '../../store/store';
import { useSelector } from 'react-redux';
// import { useSelector, useDispatch } from 'react-redux';
// import { RootState } from '../../store/store'; 


const RoomReady : React.FC = () => {

	const location = useLocation();
	const navigate = useNavigate();

	if (!location.state) {
		navigate('/setting/roomSelect');
		return null; // 추가적인 렌더링을 방지
}

	const { roomName } = location.state as { roomName: string };
	const userName = useSelector((state : RootState) => state.connectionInfo.userName);


	const handleJoinButton = async(e : React.FormEvent) => {
		e.preventDefault();

		const body = { roomName, userName };
		try{
			const response = await axios.post('/chat/createroom', body);
			navigate('/main/roomMeeting');
		}
		catch(error){
			console.log('Failed to join room', error);
			alert('방에 참가하던 중 오류가 발생했습니다.');
			
		}
		
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