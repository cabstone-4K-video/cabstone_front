import React, { useEffect, useRef, useState } from 'react';
import { OpenVidu, Publisher, Session, StreamManager } from 'openvidu-browser';

const VideoCall: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [mainStreamManager, setMainStreamManager] = useState<StreamManager | null>(null);
  const [publisher, setPublisher] = useState<Publisher | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const OV = new OpenVidu();
    const newSession = OV.initSession();

    newSession.on('streamCreated', (event: any) => {
      const subscriber = newSession.subscribe(event.stream, undefined);
      setMainStreamManager(subscriber);
    });

    setSession(newSession);

    return () => {
      if (session) {
        session.disconnect();
      }
    };
  }, []);

  const joinSession = async () => {
    if (session) {
      try {
        const token = await getToken();
        await session.connect(token, { clientData: 'React_User' });

        const OV = new OpenVidu();
        const newPublisher = OV.initPublisher(undefined, {
          audioSource: undefined,
          videoSource: undefined,
          publishAudio: true,
          publishVideo: true,
          resolution: '640x480',
          frameRate: 30,
          insertMode: 'APPEND',
          mirror: false,
        });

        session.publish(newPublisher);
        setPublisher(newPublisher);
        setMainStreamManager(newPublisher);
      } catch (error) {
        console.error('There was an error connecting to the session:', error);
      }
    }
  };

  const getToken = async (): Promise<string> => {
    const response = await fetch('http://localhost:5000/get-token', {
      method: 'POST',
    });
    const data = await response.json();
    return data.token;
  };

  return (
    <div>
      <button onClick={joinSession}>Join Session</button>
      <div ref={videoRef}></div>
      {mainStreamManager && (
        <div>
          <video
            autoPlay={true}
            ref={(videoElement) => {
              if (videoElement) {
                mainStreamManager.addVideoElement(videoElement);
              }
            }}
          ></video>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
