
import CameraCheck from './CameraCheck/CameraCheck';
import DeviceCheck from './DeviceCheck/DeviceCheck';
import classes from './RoomReady.module.css'
import { useLocation, useNavigate } from 'react-router-dom';
import AudioTest from './AudioTest/AudioTest';
// import { useSelector, useDispatch } from 'react-redux';
// import { RootState } from '../../store/store'; 


const RoomReady : React.FC = () => {

	const location = useLocation();
	const navigate = useNavigate();

	if (!location.state) {
		navigate('/main/roomSelect');
		return null; // 추가적인 렌더링을 방지
}

	// const { roomName } = location.state as { roomName: string };

	// const connectionInfo = useSelector((state : RootState) => state.connectionInfo);

	const handleJoinButton = (e : React.FormEvent) => {
		e.preventDefault();
		
		navigate('/main/roomMeeting');
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