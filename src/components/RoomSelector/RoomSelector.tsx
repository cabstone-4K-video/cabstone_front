import classes from './RoomSelector.module.css';
import generateRandomName from './RandomNameGenerator/RandomNameGenerator';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateConnectionInfo } from '../../store/connectionSlice';
import { AppDispatch } from '../../store/store';

const RoomSelector: React.FC = () => {
    const [roomName, setRoomName] = useState<string>('');
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        randomGenerate();
    }, []);

    const randomGenerate = () => {
        const randomName = generateRandomName();
        setRoomName(randomName);
    }

    const handleJoinButton = async () => {
			dispatch(updateConnectionInfo({ roomName }));
			navigate('/setting/roomReady');
    }

    return (
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
                    새로고침 버튼
                </button>
            </div>
            <button 
                className={classes.joinButton} 
                onClick={handleJoinButton}
            >JOIN</button>
        </div>
    )
};

export default RoomSelector;
