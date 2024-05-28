import axios from 'axios';
import { OpenVidu, Publisher, Session, StreamEvent } from 'openvidu-browser';
import React, { useEffect, useRef, useState } from 'react';
import ChatComponent from './Chatting/ChatComponent'
import DialogExtensionComponent from './DialogExtension/DialogExtension';
import StreamComponent from './Stream/StreamComponent';
import './VideoRoomComponent.css';
import OpenViduLayout from './Layout/layout';
import UserModel from './UserModel/UserModel';
import ToolbarComponent from './ToolBar/ToolBarComponent';
import $ from 'jquery';

const localUser = new UserModel();
const APPLICATION_SERVER_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000/';

interface VideoRoomComponentProps {
    sessionName?: string;
    user?: string;
    token?: string;
    error?: (error: { error: string, message: string, code: number, status: number }) => void;
    joinSession?: () => void;
    leaveSession?: () => void;
}

interface Subscriber {
    getStreamManager: () => Publisher;
    isScreenShareActive: () => boolean;
}

const VideoRoomComponent: React.FC<VideoRoomComponentProps> = (props) => {
    const [mySessionId, setMySessionId] = useState(props.sessionName ? props.sessionName : 'SessionA');
    const [myUserName, setMyUserName] = useState(props.user ? props.user : 'OpenVidu_User' + Math.floor(Math.random() * 100));
    const [session, setSession] = useState<Session | undefined>(undefined);
    const [localUser, setLocalUser] = useState<UserModel | undefined>(undefined);
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [chatDisplay, setChatDisplay] = useState('none');
    const [currentVideoDevice, setCurrentVideoDevice] = useState<MediaDeviceInfo | undefined>(undefined);
    const [showExtensionDialog, setShowExtensionDialog] = useState(false);
    const [messageReceived, setMessageReceived] = useState(false);
    const [hasBeenUpdated, setHasBeenUpdated] = useState(false);

    const layout = useRef(new OpenViduLayout());

		useEffect(() => {
			const openViduLayoutOptions = {
					maxRatio: 3 / 2,
					minRatio: 9 / 16,
					fixedRatio: false,
					bigClass: 'OV_big',
					bigPercentage: 0.8,
					bigFixedRatio: false,
					bigMaxRatio: 3 / 2,
					bigMinRatio: 9 / 16,
					bigFirst: true,
					animate: true,
			};
	
			const layoutElement = $('#layout');
			layout.current.initLayoutContainer(layoutElement, openViduLayoutOptions);
	
			window.addEventListener('beforeunload', onBeforeUnload);
			window.addEventListener('resize', updateLayout);
			window.addEventListener('resize', checkSize);
			joinSession();
	
			return () => {
					window.removeEventListener('beforeunload', onBeforeUnload);
					window.removeEventListener('resize', updateLayout);
					window.removeEventListener('resize', checkSize);
					leaveSession();
			};
	}, []);

    const onBeforeUnload = () => {
        leaveSession();
    };

    const joinSession = () => {
        const OV = new OpenVidu();
        const newSession = OV.initSession();
        setSession(newSession);

        subscribeToStreamCreated(newSession);
        connectToSession(newSession);
    };

    const connectToSession = async (session: Session) => {
        try {
            let token;
            if (props.token !== undefined) {
                token = props.token;
                console.log('token received: ', token);
            } else {
                token = await getToken();
                console.log(token);
            }
            connect(session, token);
        } catch (error) {
            console.error('There was an error getting the token:', error.code, error.message);
            if (props.error) {
                props.error({ error: error.error, message: error.message, code: error.code, status: error.status });
            }
            alert('There was an error getting the token:', error.message);
        }
    };

    const connect = (session: Session, token: string) => {
        session.connect(token, { clientData: myUserName })
            .then(() => {
                connectWebCam(session);
            })
            .catch((error) => {
                if (props.error) {
                    props.error({ error: error.error, message: error.message, code: error.code, status: error.status });
                }
                alert('There was an error connecting to the session:', error.message);
                console.log('There was an error connecting to the session:', error.code, error.message);
            });
    };

    const connectWebCam = async (session: Session) => {
        await OpenVidu.getUserMedia({ audioSource: undefined, videoSource: undefined });
        const devices = await OpenVidu.getDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        const publisher = OV.initPublisher(undefined, {
            audioSource: undefined,
            videoSource: videoDevices[0].deviceId,
            publishAudio: localUser.isAudioActive(),
            publishVideo: localUser.isVideoActive(),
            resolution: '640x480',
            frameRate: 30,
            insertMode: 'APPEND',
        });

        if (session.capabilities.publish) {
            publisher.on('accessAllowed', () => {
                session.publish(publisher).then(() => {
                    updateSubscribers(session);
                    setLocalUserAccessAllowed(true);
                    if (props.joinSession) {
                        props.joinSession();
                    }
                });
            });
        }

        localUser.setNickname(myUserName);
        localUser.setConnectionId(session.connection.connectionId);
        localUser.setScreenShareActive(false);
        localUser.setStreamManager(publisher);

        subscribeToUserChanged(session);
        subscribeToStreamDestroyed(session);
        sendSignalUserChanged(session, { isScreenShareActive: localUser.isScreenShareActive() });

        setCurrentVideoDevice(videoDevices[0]);
        setLocalUser(localUser);

        publisher.on('streamPlaying', () => {
            updateLayout();
            publisher.videos[0].video.parentElement.classList.remove('custom-class');
        });
    };

    const updateSubscribers = (session: Session) => {
        setSubscribers(remotes);
        if (localUser) {
            sendSignalUserChanged(session, {
                isAudioActive: localUser.isAudioActive(),
                isVideoActive: localUser.isVideoActive(),
                nickname: localUser.getNickname(),
                isScreenShareActive: localUser.isScreenShareActive(),
            });
        }
        updateLayout();
    };

    const leaveSession = () => {
        if (session) {
            session.disconnect();
        }
        setOV(undefined);
        setSession(undefined);
        setSubscribers([]);
        setMySessionId('SessionA');
        setMyUserName('OpenVidu_User' + Math.floor(Math.random() * 100));
        setLocalUser(undefined);
        if (props.leaveSession) {
            props.leaveSession();
        }
    };

    const camStatusChanged = () => {
        localUser.setVideoActive(!localUser.isVideoActive());
        localUser.getStreamManager().publishVideo(localUser.isVideoActive());
        sendSignalUserChanged(session, { isVideoActive: localUser.isVideoActive() });
        setLocalUser(localUser);
    };

    const micStatusChanged = () => {
        localUser.setAudioActive(!localUser.isAudioActive());
        localUser.getStreamManager().publishAudio(localUser.isAudioActive());
        sendSignalUserChanged(session, { isAudioActive: localUser.isAudioActive() });
        setLocalUser(localUser);
    };

    const nicknameChanged = (nickname: string) => {
        localUser.setNickname(nickname);
        setLocalUser(localUser);
        sendSignalUserChanged(session, { nickname: localUser.getNickname() });
    };

    const deleteSubscriber = (stream: StreamEvent['stream']) => {
        const userStream = subscribers.filter((user) => user.getStreamManager().stream === stream)[0];
        const index = subscribers.indexOf(userStream, 0);
        if (index > -1) {
            subscribers.splice(index, 1);
            setSubscribers([...subscribers]);
        }
    };

    const subscribeToStreamCreated = (session: Session) => {
        session.on('streamCreated', (event) => {
            const subscriber = session.subscribe(event.stream, undefined);
            subscriber.on('streamPlaying', () => {
                checkSomeoneShareScreen();
                subscriber.videos[0].video.parentElement.classList.remove('custom-class');
            });
            const newUser = new UserModel();
            newUser.setStreamManager(subscriber);
            newUser.setConnectionId(event.stream.connection.connectionId);
            newUser.setType('remote');
            const nickname = event.stream.connection.data.split('%')[0];
            newUser.setNickname(JSON.parse(nickname).clientData);
            remotes.push(newUser);
            if (localUserAccessAllowed) {
                updateSubscribers(session);
            }
        });
    };

    const subscribeToStreamDestroyed = (session: Session) => {
        session.on('streamDestroyed', (event) => {
            deleteSubscriber(event.stream);
            setTimeout(() => {
                checkSomeoneShareScreen();
            }, 20);
            updateLayout();
        });
    };

    const subscribeToUserChanged = (session: Session) => {
        session.on('signal:userChanged', (event) => {
            const remoteUsers = subscribers;
            remoteUsers.forEach((user) => {
                if (user.getConnectionId() === event.from.connectionId) {
                    const data = JSON.parse(event.data);
                    if (data.isAudioActive !== undefined) {
                        user.setAudioActive(data.isAudioActive);
                    }
                    if (data.isVideoActive !== undefined) {
                        user.setVideoActive(data.isVideoActive);
                    }
                    if (data.nickname !== undefined) {
                        user.setNickname(data.nickname);
                    }
                    if (data.isScreenShareActive !== undefined) {
                        user.setScreenShareActive(data.isScreenShareActive);
                    }
                }
            });
            setSubscribers([...remoteUsers]);
            checkSomeoneShareScreen();
        });
    };

    const updateLayout = () => {
        setTimeout(() => {
            layout.current.updateLayout();
        }, 20);
    };

    const sendSignalUserChanged = (session: Session, data: any) => {
        const signalOptions = {
            data: JSON.stringify(data),
            type: 'userChanged',
        };
        session.signal(signalOptions);
    };

    const toggleFullscreen = () => {
        const document = window.document;
        const fs = document.getElementById('container')!;
        if (
            !document.fullscreenElement &&
            !document.mozFullScreenElement &&
            !document.webkitFullscreenElement &&
            !document.msFullscreenElement
        ) {
            if (fs.requestFullscreen) {
                fs.requestFullscreen();
            } else if (fs.msRequestFullscreen) {
                fs.msRequestFullscreen();
            } else if (fs.mozRequestFullScreen) {
                fs.mozRequestFullScreen();
            } else if (fs.webkitRequestFullscreen) {
                fs.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    };

    const switchCamera = async () => {
        try {
            const devices = await OV.getDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');

            if (videoDevices && videoDevices.length > 1) {
                const newVideoDevice = videoDevices.filter(device => device.deviceId !== currentVideoDevice?.deviceId);

                if (newVideoDevice.length > 0) {
                    const newPublisher = OV.initPublisher(undefined, {
                        audioSource: undefined,
                        videoSource: newVideoDevice[0].deviceId,
                        publishAudio: localUser.isAudioActive(),
                        publishVideo: localUser.isVideoActive(),
                        mirror: true,
                    });

                    await session.unpublish(localUser.getStreamManager());
                    await session.publish(newPublisher);
                    localUser.setStreamManager(newPublisher);
                    setCurrentVideoDevice(newVideoDevice[0]);
                    setLocalUser(localUser);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const screenShare = () => {
        const videoSource = navigator.userAgent.indexOf('Firefox') !== -1 ? 'window' : 'screen';
        const publisher = OV.initPublisher(undefined, {
            videoSource: videoSource,
            publishAudio: localUser.isAudioActive(),
            publishVideo: localUser.isVideoActive(),
            mirror: false,
        }, (error) => {
            if (error && error.name === 'SCREEN_EXTENSION_NOT_INSTALLED') {
                setShowExtensionDialog(true);
            } else if (error && error.name === 'SCREEN_SHARING_NOT_SUPPORTED') {
                alert('Your browser does not support screen sharing');
            } else if (error && error.name === 'SCREEN_EXTENSION_DISABLED') {
                alert('You need to enable screen sharing extension');
            } else if (error && error.name === 'SCREEN_CAPTURE_DENIED') {
                alert('You need to choose a window or application to share');
            }
        });

        publisher.once('accessAllowed', () => {
            session.unpublish(localUser.getStreamManager());
            localUser.setStreamManager(publisher);
            session.publish(localUser.getStreamManager()).then(() => {
                localUser.setScreenShareActive(true);
                setLocalUser(localUser);
                sendSignalUserChanged(session, { isScreenShareActive: localUser.isScreenShareActive() });
            });
        });
        publisher.on('streamPlaying', () => {
            updateLayout();
            publisher.videos[0].video.parentElement.classList.remove('custom-class');
        });
    };

    const closeDialogExtension = () => {
        setShowExtensionDialog(false);
    };

    const stopScreenShare = () => {
        session.unpublish(localUser.getStreamManager());
        connectWebCam(session);
    };

    const checkSomeoneShareScreen = () => {
        const isScreenShared = subscribers.some((user) => user.isScreenShareActive()) || localUser.isScreenShareActive();
        const openViduLayoutOptions = {
            maxRatio: 3 / 2,
            minRatio: 9 / 16,
            fixedRatio: isScreenShared,
            bigClass: 'OV_big',
            bigPercentage: 0.8,
            bigFixedRatio: false,
            bigMaxRatio: 3 / 2,
            bigMinRatio: 9 / 16,
            bigFirst: true,
            animate: true,
        };
        layout.current.setLayoutOptions(openViduLayoutOptions);
        updateLayout();
    };

    const toggleChat = (property?: string) => {
        let display = property;

        if (display === undefined) {
            display = chatDisplay === 'none' ? 'block' : 'none';
        }
        setChatDisplay(display);
        if (display === 'block') {
            setMessageReceived(false);
        }
        updateLayout();
    };

    const checkNotification = () => {
        setMessageReceived(chatDisplay === 'none');
    };

    const checkSize = () => {
        const layoutElement = document.getElementById('layout')!;
        if (layoutElement.offsetWidth <= 700 && !hasBeenUpdated) {
            toggleChat('none');
            setHasBeenUpdated(true);
        }
        if (layoutElement.offsetWidth > 700 && hasBeenUpdated) {
            setHasBeenUpdated(false);
        }
    };

    const getToken = async () => {
        const sessionId = await createSession(mySessionId);
        return await createToken(sessionId);
    };

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

    return (
        <div className="container" id="container">
            <ToolbarComponent
                sessionId={mySessionId}
                user={localUser}
                showNotification={messageReceived}
                camStatusChanged={camStatusChanged}
                micStatusChanged={micStatusChanged}
                screenShare={screenShare}
                stopScreenShare={stopScreenShare}
                toggleFullscreen={toggleFullscreen}
                switchCamera={switchCamera}
                leaveSession={leaveSession}
                toggleChat={toggleChat}
            />

            <DialogExtensionComponent showDialog={showExtensionDialog} cancelClicked={closeDialogExtension} />

            <div id="layout" className="bounds">
                {localUser && localUser.getStreamManager() && (
                    <div className="OT_root OT_publisher custom-class" id="localUser">
                        <StreamComponent user={localUser} handleNickname={nicknameChanged} />
                    </div>
                )}
                {subscribers.map((sub, i) => (
                    <div key={i} className="OT_root OT_publisher custom-class" id="remoteUsers">
                        <StreamComponent user={sub} streamId={sub.getStreamManager().stream.streamId} />
                    </div>
                ))}
                {localUser && localUser.getStreamManager() && (
                    <div className="OT_root OT_publisher custom-class" style={{ display: chatDisplay }}>
                        <ChatComponent
                            user={localUser}
                            chatDisplay={chatDisplay}
                            close={toggleChat}
                            messageReceived={checkNotification}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoRoomComponent;
