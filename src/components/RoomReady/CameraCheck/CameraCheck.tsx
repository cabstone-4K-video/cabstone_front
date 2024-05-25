import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store'; // 경로는 실제 구조에 맞게 조정하세요.
import classes from './CameraCheck.module.css';

const CameraCheck: React.FC = () => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const { videoDevice } = useSelector((state: RootState) => state.connectionInfo);

	useEffect(() => {
		let stream: MediaStream;
		if (videoDevice) {
			const constraints = {
			video: { deviceId: { exact: videoDevice } },
		};

		navigator.mediaDevices.getUserMedia(constraints)
			.then(mediaStream => {
				stream = mediaStream;
				if (videoRef.current) {
					videoRef.current.srcObject = stream;
				}
			})
			.catch(error => {
				console.error('Error accessing the camera.', error);
			});
		}

		return () => {
			if (stream) {
				stream.getTracks().forEach(track => track.stop());
			}
		};
}, [videoDevice]);

	return (
		<>
			{
				videoDevice ? (
					<video
						ref={videoRef} 
						autoPlay 
						playsInline
						muted
						className={classes.video}
					/>
				) : <p className={classes.noVideo}>비디오 연결기기를 설정해주세요.</p>
			}
		</>
	);
}

export default CameraCheck;