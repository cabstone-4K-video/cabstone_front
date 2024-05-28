import React, { useEffect, useRef } from 'react';
import './StreamComponent.css';

interface StreamManager {
  addVideoElement: (element: HTMLVideoElement) => void;
  session: {
    on: (event: string, callback: (event: any) => void) => void;
  };
  stream: {
    streamId: string;
  };
}

interface User {
  streamManager: StreamManager;
  getStreamManager: () => StreamManager;
}

interface Props {
  user: User;
  mutedSound: boolean;
}

const OvVideoComponent: React.FC<Props> = ({ user, mutedSound }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const streamManager = user.getStreamManager();
    if (streamManager && videoRef.current) {
      streamManager.addVideoElement(videoRef.current);
    }

    const handleUserChanged = (event: any) => {
      const data = JSON.parse(event.data);
      if (data.isScreenShareActive !== undefined && videoRef.current) {
        streamManager.addVideoElement(videoRef.current);
      }
    };

    if (streamManager.session) {
      streamManager.session.on('signal:userChanged', handleUserChanged);
    }
  }, [user]);

  return (
    <video
      autoPlay={true}
      id={'video-' + user.getStreamManager().stream.streamId}
      ref={videoRef}
      muted={mutedSound}
    />
  );
};

export default OvVideoComponent;
