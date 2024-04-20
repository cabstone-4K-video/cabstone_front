import { useState } from "react";
import classes from './ScreenShare.module.css';

const ScreenShare : React.FC = () => {
	const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

	const startScreenShare = async () => {
		const constraints = { video : true }
		try{
			const mediaStream = await navigator.mediaDevices.getDisplayMedia(constraints);
			setScreenStream(mediaStream);
		}catch(error){
			console.error('화면 공유에 실패했습니다.', error)
		}
	}
	

	return (
		<>
			<button onClick={startScreenShare}>화면 공유 시작</button>
			{screenStream && (
				<div className={classes.videoContainer}>
					<video autoPlay playsInline ref={video => {
						if (video) video.srcObject = screenStream;
					}} />
				</div>
				
			)}
		</>
	)
}

export default ScreenShare;