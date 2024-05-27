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

        if (streamManager.session && videoRef.current) {
            streamManager.session.on('signal:userChanged', (event) => {
                const data = JSON.parse(event.data);
                if (data.isScreenShareActive !== undefined) {
                    if (videoRef.current) {
                        streamManager.addVideoElement(videoRef.current);
                    }
                }
            });
        }
    }, [user]);

    useEffect(() => {
        const streamManager = user.getStreamManager();
        if (videoRef.current) {
            streamManager.addVideoElement(videoRef.current);
        }
    });

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
