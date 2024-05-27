import axios from 'axios';
import { OpenVidu, Publisher, Session } from 'openvidu-browser';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatComponent from './Chatting/ChatComponent';
import DialogExtensionComponent from './DialogExtension/DialogExtension';
import StreamComponent from './Stream/StreamComponent';
import './VideoRoomComponent.css';

import OpenViduLayout from './Layout/layout';
import UserModel from './UserModel/UserModel';
import ToolbarComponent from './ToolBar/ToolBarComponent';


const localUser = new UserModel();
const APPLICATION_SERVER_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000/';

interface Props {
    sessionName?: string;
    user?: string;
    token?: string;
    error?: (error: { error: string, message: string, code: number, status: string }) => void;
    joinSession?: () => void;
    leaveSession?: () => void;
}

const VideoRoomComponent: React.FC<Props> = (props) => {
    const [sessionName, setSessionName] = useState<string>(props.sessionName || 'SessionA');
    const [userName, setUserName] = useState<string>(props.user || 'OpenVidu_User' + Math.floor(Math.random() * 100));
    const [session, setSession] = useState<Session | null>(null);
    const [subscribers, setSubscribers] = useState<UserModel[]>([]);
    const [chatDisplay, setChatDisplay] = useState<string>('none');
    const [currentVideoDevice, setCurrentVideoDevice] = useState<MediaDeviceInfo | null>(null);
    const [localUserState, setLocalUserState] = useState<UserModel | null>(null);
    const [showExtensionDialog, setShowExtensionDialog] = useState<boolean>(false);
    const [messageReceived, setMessageReceived] = useState<boolean>(false);
    const layout = useRef<OpenViduLayout>(new OpenViduLayout());
    const remotes = useRef<UserModel[]>([]);
    const localUserAccessAllowed = useRef<boolean>(false);
    const hasBeenUpdated = useRef<boolean>(false);
    const OV = useRef<OpenVidu>();

	

    const leaveSession = useCallback(() => {
        if (session) {
            session.disconnect();
        }

        setSession(null);
        setSubscribers([]);
        setSessionName('SessionA');
        setUserName('OpenVidu_User' + Math.floor(Math.random() * 100));
        setLocalUserState(null);

        if (props.leaveSession) {
            props.leaveSession();
        }
    }, [props.leaveSession, session]);

		const onbeforeunload = useCallback(() => {
			leaveSession();
		}, [leaveSession]);

    const updateLayout = useCallback(() => {
        setTimeout(() => {
            layout.current.updateLayout();
        }, 20);
    }, []);

    

		const updateSubscribers = useCallback(() => {
			const updatedSubscribers = remotes.current;
			setSubscribers(updatedSubscribers);
	
			if (localUserState) {
					sendSignalUserChanged(session!, {
							isAudioActive: localUserState.isAudioActive(),
							isVideoActive: localUserState.isVideoActive(),
							nickname: localUserState.getNickname(),
							isScreenShareActive: localUserState.isScreenShareActive(),
					});
			}
			updateLayout();
		}, [localUserState, session, updateLayout]);

		const connectWebCam = useCallback(async (newSession: Session, OV: OpenVidu) => {
			await OV.getUserMedia({ audioSource: undefined, videoSource: undefined });
			const devices = await OV.getDevices();
			const videoDevices = devices.filter(device => device.kind === 'videoinput');

			const publisher: Publisher = OV.initPublisher(undefined, {
					audioSource: undefined,
					videoSource: videoDevices[0].deviceId,
					publishAudio: localUser.isAudioActive(),
					publishVideo: localUser.isVideoActive(),
					resolution: '640x480',
					frameRate: 30,
					insertMode: 'APPEND',
			});

			if (newSession.capabilities.publish) {
					publisher.on('accessAllowed', () => {
							newSession.publish(publisher).then(() => {
									updateSubscribers();
									localUserAccessAllowed.current = true;
									if (props.joinSession) {
											props.joinSession();
									}
							});
					});
			}

			localUser.setNickname(userName);
			localUser.setConnectionId(newSession.connection.connectionId);
			localUser.setScreenShareActive(false);
			localUser.setStreamManager(publisher);
			subscribeToUserChanged(newSession);
			subscribeToStreamDestroyed(newSession);
			sendSignalUserChanged(newSession, { isScreenShareActive: localUser.isScreenShareActive() });

			setLocalUserState(localUser);
			setCurrentVideoDevice(videoDevices[0] as MediaDeviceInfo);

			publisher.on('streamPlaying', () => {
					updateLayout();
					if (publisher.videos[0].video.parentElement) {
							publisher.videos[0].video.parentElement.classList.remove('custom-class');
					}
			});
	}, [props.joinSession, userName, updateSubscribers, updateLayout]);

 

    const connect = useCallback((token: string, newSession: Session, OV: OpenVidu) => {
        newSession.connect(token, { clientData: userName })
            .then(() => {
                connectWebCam(newSession, OV);
            })
            .catch((error: any) => {
                if (props.error) {
                    props.error({ error: error.error, message: error.message, code: error.code, status: error.status });
                }
                alert(`There was an error connecting to the session: ${error.message}`);
                console.log('There was an error connecting to the session:', error.code, error.message);
            });
    }, [props.error, userName, connectWebCam]);

		const connectToSession = useCallback(async (newSession: Session, OV: OpenVidu) => {
			if (props.token !== undefined) {
					console.log('token received: ', props.token);
					connect(props.token, newSession, OV);
			} else {
					try {
							const token = await getToken();
							console.log(token);
							connect(token, newSession, OV);
					} catch (error: any) {
							console.error('There was an error getting the token:', error.code, error.message);
							if (props.error) {
									props.error({ error: error.error, message: error.message, code: error.code, status: error.status });
							}
							alert(`There was an error getting the token: , ${error.message}`);
					}
			}
	}, [props.token, props.error, connect]);

	

   

    const camStatusChanged = useCallback(() => {
        localUser.setVideoActive(!localUser.isVideoActive());
        localUser.getStreamManager().publishVideo(localUser.isVideoActive());
        sendSignalUserChanged(session!, { isVideoActive: localUser.isVideoActive() });
        setLocalUserState(localUser.clone());
    }, [session]);

    const micStatusChanged = useCallback(() => {
        localUser.setAudioActive(!localUser.isAudioActive());
        localUser.getStreamManager().publishAudio(localUser.isAudioActive());
        sendSignalUserChanged(session!, { isAudioActive: localUser.isAudioActive() });
        setLocalUserState(localUser.clone());
    }, [session]);

    const nicknameChanged = useCallback((nickname: string) => {
        localUser.setNickname(nickname);
        setLocalUserState(localUser.clone());
        sendSignalUserChanged(session!, { nickname: localUser.getNickname() });
    }, [session]);

    const deleteSubscriber = useCallback((stream: any) => {
        const remoteUsers = subscribers;
        const userStream = remoteUsers.filter((user) => user.getStreamManager().stream === stream)[0];
        const index = remoteUsers.indexOf(userStream, 0);
        if (index > -1) {
            remoteUsers.splice(index, 1);
            setSubscribers([...remoteUsers]);
        }
    }, [subscribers]);

    const checkSomeoneShareScreen = useCallback(() => {
        const isScreenShared = subscribers.some((user) => user.isScreenShareActive()) || localUser.isScreenShareActive();
        const openviduLayoutOptions = {
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
        layout.current.setLayoutOptions(openviduLayoutOptions);
        updateLayout();
    }, [subscribers, updateLayout]);

    const subscribeToStreamCreated = useCallback((newSession: Session) => {
        newSession.on('streamCreated', (event: any) => {
            const subscriber = newSession.subscribe(event.stream, undefined);
            subscriber.on('streamPlaying', () => {
                checkSomeoneShareScreen();
                if (subscriber.videos[0].video.parentElement) {
                    subscriber.videos[0].video.parentElement.classList.remove('custom-class');
                }
            });
            const newUser = new UserModel();
            newUser.setStreamManager(subscriber);
            newUser.setConnectionId(event.stream.connection.connectionId);
            newUser.setNickname(JSON.parse(event.stream.connection.data).clientData);
            remotes.current.push(newUser);

            if (localUserAccessAllowed.current) {
                updateSubscribers();
            }
        });
    }, [checkSomeoneShareScreen, updateSubscribers]);

    const subscribeToStreamDestroyed = useCallback((newSession: Session) => {
        newSession.on('streamDestroyed', (event: any) => {
            deleteSubscriber(event.stream);
            setTimeout(() => {
                updateLayout();
            }, 20);
            event.preventDefault();
        });
    }, [deleteSubscriber, updateLayout]);

    const subscribeToUserChanged = useCallback((newSession: Session) => {
        newSession.on('signal:userChanged', (event: any) => {
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
    }, [checkSomeoneShareScreen, subscribers]);

    const sendSignalUserChanged = useCallback((newSession: Session, data: any) => {
        const signalOptions = {
            data: JSON.stringify(data),
            type: 'userChanged',
        };
        newSession.signal(signalOptions);
    }, []);

    const toggleFullscreen = useCallback(() => {
        const document = window.document;
        const fs = document.getElementById('container');
        if (fs) {
            if (!document.fullscreenElement) {
                if (fs.requestFullscreen) {
                    fs.requestFullscreen();
                } else if ((fs as any).msRequestFullscreen) {
                    (fs as any).msRequestFullscreen();
                } else if ((fs as any).mozRequestFullScreen) {
                    (fs as any).mozRequestFullScreen();
                } else if ((fs as any).webkitRequestFullscreen) {
                    (fs as any).webkitRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if ((document as any).msExitFullscreen) {
                    (document as any).msExitFullscreen();
                } else if ((document as any).mozCancelFullScreen) {
                    (document as any).mozCancelFullScreen();
                } else if ((document as any).webkitExitFullscreen) {
                    (document as any).webkitExitFullscreen();
                }
            }
        }
    }, []);

    const switchCamera = useCallback(async () => {
        try {
            const devices = await OV.current!.getDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');

            if (videoDevices && videoDevices.length > 1) {
                const newVideoDevice = videoDevices.filter(device => device.deviceId !== currentVideoDevice!.deviceId);

                if (newVideoDevice.length > 0) {
                    const newPublisher = OV.current!.initPublisher(undefined, {
                        audioSource: undefined,
                        videoSource: newVideoDevice[0].deviceId,
                        publishAudio: localUser.isAudioActive(),
                        publishVideo: localUser.isVideoActive(),
                        mirror: true,
                    });

                    await session!.unpublish(localUserState!.getStreamManager());
                    await session!.publish(newPublisher);
                    localUserState!.setStreamManager(newPublisher);
                    setCurrentVideoDevice(newVideoDevice[0] as MediaDeviceInfo);

                    // Use clone method to create a new instance with the same data
                    setLocalUserState(localUserState!.clone());
                }
            }
        } catch (e) {
            console.error(e);
        }
    }, [currentVideoDevice, localUserState, session]);

    const screenShare = useCallback(() => {
        const videoSource = navigator.userAgent.indexOf('Firefox') !== -1 ? 'window' : 'screen';
        const publisher = OV.current!.initPublisher(
            undefined,
            {
                videoSource: videoSource,
                publishAudio: localUser.isAudioActive(),
                publishVideo: localUser.isVideoActive(),
                mirror: false,
            },
            (error: any) => {
                if (error && error.name === 'SCREEN_EXTENSION_NOT_INSTALLED') {
                    setShowExtensionDialog(true);
                } else if (error && error.name === 'SCREEN_SHARING_NOT_SUPPORTED') {
                    alert('Your browser does not support screen sharing');
                } else if (error && error.name === 'SCREEN_EXTENSION_DISABLED') {
                    alert('You need to enable screen sharing extension');
                } else if (error && error.name === 'SCREEN_CAPTURE_DENIED') {
                    alert('You need to choose a window or application to share');
                }
            },
        );

        publisher.once('accessAllowed', () => {
            session!.unpublish(localUser.getStreamManager());
            localUser.setStreamManager(publisher);
            session!.publish(localUser.getStreamManager()).then(() => {
                localUser.setScreenShareActive(true);
                setLocalUserState(localUser.clone());
                sendSignalUserChanged(session!, { isScreenShareActive: localUser.isScreenShareActive() });
            });
        });

        publisher.on('streamPlaying', () => {
            updateLayout();
            const parentElement = publisher.videos[0].video.parentElement;
            if (parentElement) {
                parentElement.classList.remove('custom-class');
            }
        });
    }, [session, updateLayout]);

    const closeDialogExtension = useCallback(() => {
        setShowExtensionDialog(false);
    }, []);

    const stopScreenShare = useCallback(() => {
        session!.unpublish(localUser.getStreamManager());
        connectWebCam(session!, OV.current!);
    }, [session, connectWebCam]);

    const toggleChat = useCallback((property?: string) => {
        let display = property;

        if (display === undefined) {
            display = chatDisplay === 'none' ? 'block' : 'none';
        }
        if (display === 'block') {
            setChatDisplay(display);
            setMessageReceived(false);
        } else {
            setChatDisplay(display);
        }
        updateLayout();
    }, [chatDisplay, updateLayout]);

    const checkNotification = useCallback(() => {
        setMessageReceived(chatDisplay === 'none');
    }, [chatDisplay]);

    const checkSize = useCallback(() => {
        const layoutElement = document.getElementById('layout');
        if (layoutElement && layoutElement.offsetWidth <= 700 && !hasBeenUpdated.current) {
            toggleChat('none');
            hasBeenUpdated.current = true;
        }
        if (layoutElement && layoutElement.offsetWidth > 700 && hasBeenUpdated.current) {
            hasBeenUpdated.current = false;
        }
    }, [toggleChat]);

    const getToken = useCallback(async () => {
        const sessionId = await createSession(sessionName);
        return await createToken(sessionId);
    }, [sessionName]);

    const createSession = useCallback(async (sessionId: string) => {
        const response = await axios.post(APPLICATION_SERVER_URL + 'api/sessions', { customSessionId: sessionId }, {
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data; // The sessionId
    }, []);

    const createToken = useCallback(async (sessionId: string) => {
        const response = await axios.post(APPLICATION_SERVER_URL + 'api/sessions/' + sessionId + '/connections', {}, {
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data; // The token
    }, []);

		const joinSession = useCallback(() => {
			OV.current = new OpenVidu();
			const newSession = OV.current.initSession();
			setSession(newSession);

			subscribeToStreamCreated(newSession);
			connectToSession(newSession, OV.current!);
	}, [connectToSession, subscribeToStreamCreated]);

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

			layout.current.initLayoutContainer(document.getElementById('layout')!, openViduLayoutOptions);
			window.addEventListener('beforeunload', onbeforeunload);
			window.addEventListener('resize', updateLayout);
			window.addEventListener('resize', checkSize);
			joinSession();

			return () => {
					window.removeEventListener('beforeunload', onbeforeunload);
					window.removeEventListener('resize', updateLayout);
					window.removeEventListener('resize', checkSize);
					leaveSession();
			};
	}, [joinSession, leaveSession, onbeforeunload, updateLayout]);

    return (
        <div className="container" id="container">
            <ToolbarComponent
                sessionId={sessionName}
                user={localUserState!}
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
                {localUserState !== undefined && localUserState!.getStreamManager() !== undefined && (
                    <div className="OT_root OT_publisher custom-class" id="localUser">
                        <StreamComponent user={localUserState!} handleNickname={nicknameChanged} />
                    </div>
                )}
                {subscribers.map((sub, i) => (
                    <div key={i} className="OT_root OT_publisher custom-class" id="remoteUsers">
                        <StreamComponent user={sub} handleNickname={nicknameChanged} />
                    </div>
                ))}
                {localUserState !== undefined && localUserState!.getStreamManager() !== undefined && (
                    <div className="OT_root OT_publisher custom-class" style={{ display: chatDisplay }}>
                        <ChatComponent
                            user={localUserState!}
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
