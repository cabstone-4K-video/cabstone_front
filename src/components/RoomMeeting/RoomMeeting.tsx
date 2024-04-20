import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store'; 
import classes from './RoomMeeting.module.css';

const RoomMeeting: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const connectionInfo = useSelector((state: RootState) => state.connectionInfo);

  useEffect(() => {
    const setupMedia = async () => {
      if (connectionInfo.videoDevice) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: connectionInfo.videoDevice } },
            audio: { deviceId: { exact: connectionInfo.audioDevice } }
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error("Failed to get media", error);
        }
      }
    };

    setupMedia();

    // Clean up function to stop media tracks when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [connectionInfo.videoDevice, connectionInfo.audioDevice]);

  return (
    <div className={classes.container}>
      <video ref={videoRef} autoPlay playsInline></video>
    </div>
  );
};

export default RoomMeeting;
