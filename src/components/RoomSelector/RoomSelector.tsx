
import classes from './RoomSelector.module.css';
import generateRandomName from './RandomNameGenerator/RandomNameGenerator';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

const RoomSelector: React.FC = () => {
	
	const [roomName, setRoomName] = useState<string>('');
	const navigate = useNavigate();

	useEffect(() => {
		randomGenerate();
		
	}, []);

	const randomGenerate = () => {
		const randomName = generateRandomName();
		setRoomName(randomName);
	}

	const handleJoinButton = async () => {
		navigate('/setting/roomReady' , { state : { roomName }});
	}

	return (
		<>
			<div className={classes.container}>
				<div className={classes.title}>
					임시 타이틀
				</div>
				<div className={classes.inputGroup}>
					<input 
						type="text" 
						className={classes.input} 
						placeholder="Enter room name" 
						value={roomName}
						onChange={(e) => setRoomName(e.target.value)}
					/>
					<button 
						className={classes.nameGenButton} 
						type='button'
						onClick={randomGenerate}
					>
						{/* <img src={refresh} className={classes.icon} alt="refresh"/> */}
						새로고침 버튼
					</button>
				</div>
				<button 
					className={classes.joinButton} 
					onClick={handleJoinButton}
				>JOIN</button>
			</div>

		</>
	)
};

export default RoomSelector;