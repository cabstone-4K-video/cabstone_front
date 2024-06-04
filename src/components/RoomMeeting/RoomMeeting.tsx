import React, { useCallback, useEffect, useRef, useState } from 'react';
import { OpenVidu } from 'openvidu-browser';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import styles from './RoomMeeting.module.css';
import UserVideoComponent from './UserVideo/UserVideoComponent';
import ToolBar from './ToolBar/ToolBar';

const APPLICATION_SERVER_URL = process.env.NODE_ENV === 'production' ? '' : 'https://demos.openvidu.io/';

const RoomMeeting: React.FC = () => {
    const roomName = useSelector((state: RootState) => state.connectionInfo.roomName);
    const userName = useSelector((state: RootState) => state.connectionInfo.userName);

    const [session, setSession] = useState<any>();
    const [mainStreamManager, setMainStreamManager] = useState<any>();
    const [publisher, setPublisher] = useState<any>();
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [currentVideoDevice, setCurrentVideoDevice] = useState<any>();
    const [screenSharing, setScreenSharing] = useState(false);

    const OV = useRef(new OpenVidu());

    const handleMainVideoStream = useCallback((stream: any) => {
        if (mainStreamManager !== stream) {
            setMainStreamManager(stream);
        }
    }, [mainStreamManager]);

    const joinSession = useCallback(() => {
        const mySession = OV.current.initSession();

        mySession.on('streamCreated', (event: any) => {
            const subscriber = mySession.subscribe(event.stream, undefined);
            setSubscribers((prevSubscribers) => [...prevSubscribers, subscriber]);
        });

        mySession.on('streamDestroyed', (event: any) => {
            deleteSubscriber(event.stream.streamManager);
        });

        mySession.on('exception', (exception: any) => {
            console.warn(exception);
        });

        setSession(mySession);
    }, []);

    useEffect(() => {
        if (session) {
            getToken().then(async (token) => {
                try {
                    await session.connect(token, { clientData: userName });

                    let publisher = await OV.current.initPublisherAsync(undefined, {
                        audioSource: undefined,
                        videoSource: undefined,
                        publishAudio: true,
                        publishVideo: true,
                        resolution: '640x480',
                        frameRate: 30,
                        insertMode: 'APPEND',
                        mirror: false,
                    });

                    session.publish(publisher);

                    const devices = await OV.current.getDevices();
                    const videoDevices = devices.filter(device => device.kind === 'videoinput');
                    const currentVideoDeviceId = publisher.stream.getMediaStream().getVideoTracks()[0].getSettings().deviceId;
                    const currentVideoDevice = videoDevices.find(device => device.deviceId === currentVideoDeviceId);

                    setMainStreamManager(publisher);
                    setPublisher(publisher);
                    setCurrentVideoDevice(currentVideoDevice);
                } catch (error) {
                    console.log('There was an error connecting to the session:', error);
                }
            });
        }
    }, [session, userName]);

    const leaveSession = useCallback(() => {
        if (session) {
            session.disconnect();
        }

        OV.current = new OpenVidu();
        setSession(undefined);
        setSubscribers([]);
        setMainStreamManager(undefined);
        setPublisher(undefined);
        setScreenSharing(false);
    }, [session]);

    const switchCamera = useCallback(async () => {
        try {
            const devices = await OV.current.getDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');

            if (videoDevices && videoDevices.length > 1) {
                const newVideoDevice = videoDevices.filter(device => device.deviceId !== currentVideoDevice.deviceId);

                if (newVideoDevice.length > 0) {
                    const newPublisher = OV.current.initPublisher(undefined, {
                        videoSource: newVideoDevice[0].deviceId,
                        publishAudio: true,
                        publishVideo: true,
                        mirror: true,
                    });

                    if (session) {
                        await session.unpublish(mainStreamManager);
                        await session.publish(newPublisher);
                        setCurrentVideoDevice(newVideoDevice[0]);
                        setMainStreamManager(newPublisher);
                        setPublisher(newPublisher);
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    }, [currentVideoDevice, session, mainStreamManager]);

    const deleteSubscriber = useCallback((streamManager: any) => {
        setSubscribers((prevSubscribers) => {
            const index = prevSubscribers.indexOf(streamManager);
            if (index > -1) {
                const newSubscribers = [...prevSubscribers];
                newSubscribers.splice(index, 1);
                return newSubscribers;
            } else {
                return prevSubscribers;
            }
        });
    }, []);

    const shareScreen = useCallback(async () => {
        if (!screenSharing) {
            try {
                const newPublisher = OV.current.initPublisher(undefined, {
                    videoSource: 'screen',
                    publishAudio: true,
                    publishVideo: true,
                    mirror: false
                });

                if (session) {
                    await session.unpublish(mainStreamManager);
                    await session.publish(newPublisher);
                    setMainStreamManager(newPublisher);
                    setPublisher(newPublisher);
                    setScreenSharing(true);
                }
            } catch (e) {
                console.error(e);
            }
        } else {
            try {
                const devices = await OV.current.getDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');

                const newPublisher = OV.current.initPublisher(undefined, {
                    videoSource: videoDevices[0].deviceId,
                    publishAudio: true,
                    publishVideo: true,
                    mirror: false
                });

                if (session) {
                    await session.unpublish(mainStreamManager);
                    await session.publish(newPublisher);
                    setMainStreamManager(newPublisher);
                    setPublisher(newPublisher);
                    setScreenSharing(false);
                }
            } catch (e) {
                console.error(e);
            }
        }
    }, [screenSharing, session, mainStreamManager]);

    const getToken = useCallback(async () => {
        return createSession(roomName).then(sessionId =>
            createToken(sessionId),
        );
    }, [roomName]);

    const createSession = async (sessionId: string) => {
        const response = await axios.post(APPLICATION_SERVER_URL + 'api/sessions', { customSessionId: sessionId }, {
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data; // The sessionId
    };

    const createToken = async (sessionId: string) => {
        const response = await axios.post(APPLICATION_SERVER_URL + 'api/sessions/' + sessionId + '/connections', {}, {
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data; // The token
    };

    useEffect(() => {
        joinSession();
    }, [joinSession]);

    return (
        <div className={styles.container}>
            <div className={styles.videoContainer}>
                {screenSharing && mainStreamManager ? (
                    <div className={styles.screenShare}>
                        <UserVideoComponent streamManager={mainStreamManager} />
                    </div>
                ) : null}
                <div className={styles.participants}>
                    {publisher !== undefined ? (
                        <div className={styles.streamContainer} onClick={() => handleMainVideoStream(publisher)}>
                            <UserVideoComponent streamManager={publisher} />
                        </div>
                    ) : null}
                    {subscribers.map((sub, i) => (
                        <div key={sub.id} className={styles.streamContainer} onClick={() => handleMainVideoStream(sub)}>
                            <UserVideoComponent streamManager={sub} />
                        </div>
                    ))}
                </div>
            </div>
            <ToolBar
                switchCamera={switchCamera}
                leaveSession={leaveSession}
                shareScreen={shareScreen}
                roomName={roomName}
                toggleChat={() => { console.log('Toggle Chat!'); }}
            />
        </div>
    );
};

export default RoomMeeting;
