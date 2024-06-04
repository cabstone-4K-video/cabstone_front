import React, { useRef, useEffect } from 'react';
import './StreamComponent.css';

interface OvVideoComponentProps {
  user: any; // 정확한 타입을 알고 있다면 해당 타입으로 변경하세요
  mutedSound?: boolean;
}

const OvVideoComponent: React.FC<OvVideoComponentProps> = ({ user, mutedSound }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (user.streamManager && videoRef.current) {
      console.log('PROPS: ', user);
      user.getStreamManager().addVideoElement(videoRef.current);
    }

    if (user.streamManager.session && user && videoRef.current) {
      const handleUserChanged = (event: any) => {
        const data = JSON.parse(event.data);
        if (data.isScreenShareActive !== undefined) {
          user.getStreamManager().addVideoElement(videoRef.current);
        }
      };

      user.streamManager.session.on('signal:userChanged', handleUserChanged);

      return () => {
        user.streamManager.session.off('signal:userChanged', handleUserChanged);
      };
    }
  }, [user]);

  useEffect(() => {
    if (videoRef.current) {
      user.getStreamManager().addVideoElement(videoRef.current);
    }
  }, [user, videoRef]);

  return(
		<video
			autoPlay={true}
			id={'video-' + user.getStreamManager().stream.streamId}
			ref={videoRef}
			muted={mutedSound}
		/>
	)

};

export default OvVideoComponent;
