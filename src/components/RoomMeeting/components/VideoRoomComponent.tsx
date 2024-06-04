import axios from 'axios';
import { OpenVidu, Session, StreamManager } from 'openvidu-browser';
import React, { useEffect, useState, useRef } from 'react';
import ChatComponent from './chat/ChatComponent';
import DialogExtensionComponent from './dialog-extension/DialogExtension';
import StreamComponent from './stream/StreamComponent';
import './VideoRoomComponent.css';

import OpenViduLayout from '../layout/openvidu-layout';
import UserModel from '../models/user-model';
import ToolbarComponent from './toolbar/ToolbarComponent';

const localUser = new UserModel();
const APPLICATION_SERVER_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000/';

interface VideoRoomComponentProps {
  sessionName?: string;
  user?: string;
  token?: string;
  joinSession?: () => void;
  leaveSession?: () => void;
  error?: (err: { error: string; message: string; code: number; status: number }) => void;
}

const VideoRoomComponent: React.FC<VideoRoomComponentProps> = (props) => {
  const [mySessionId, setMySessionId] = useState<string>(props.sessionName || 'SessionA');
  const [myUserName, setMyUserName] = useState<string>(props.user || 'OpenVidu_User' + Math.floor(Math.random() * 100));
  const [session, setSession] = useState<Session>();
  const [localUserState, setLocalUserState] = useState<UserModel>();
  const [subscribers, setSubscribers] = useState<UserModel[]>([]);
  const [chatDisplay, setChatDisplay] = useState<'none' | 'block'>('none');
  const [currentVideoDevice, setCurrentVideoDevice] = useState<MediaDeviceInfo>();
  const [messageReceived, setMessageReceived] = useState<boolean>(false);
  const [showExtensionDialog, setShowExtensionDialog] = useState<boolean>(false);

  const layout = useRef(new OpenViduLayout());
  const hasBeenUpdated = useRef(false);
  const remotes = useRef<UserModel[]>([]);
  const localUserAccessAllowed = useRef(false);
  const OV = useRef<OpenVidu>();

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

    const layoutContainer = document.getElementById('layout');
    if (layoutContainer) {
      layout.current.initLayoutContainer(layoutContainer, openViduLayoutOptions);
    }
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
  }, []);

  const onbeforeunload = (event: BeforeUnloadEvent) => {
    leaveSession();
  };

  const joinSession = async () => {
    OV.current = new OpenVidu();

    const sessionInstance = OV.current.initSession();
    setSession(sessionInstance);

    subscribeToStreamCreated(sessionInstance);
    await connectToSession(sessionInstance);
  };

  const connectToSession = async (session: Session) => {
    if (props.token !== undefined) {
      console.log('token received: ', props.token);
      connect(session, props.token);
    } else {
      try {
        const token = await getToken();
        console.log(token);
        connect(session, token);
      } catch (error: any) {
        console.error('There was an error getting the token:', error.code, error.message);
        if (props.error) {
          props.error({ error: error.error, message: error.message, code: error.code, status: error.status });
        }
        alert('There was an error getting the token: ' + error.message);
      }
    }
  };

  const connect = (session: Session, token: string) => {
    session
      .connect(token, { clientData: myUserName })
      .then(() => {
        connectWebCam(session);
      })
      .catch((error: any) => {
        if (props.error) {
          props.error({ error: error.error, message: error.message, code: error.code, status: error.status });
        }
        alert('There was an error connecting to the session: ' + error.message);
        console.log('There was an error connecting to the session:', error.code, error.message);
      });
  };

  const connectWebCam = async (session: Session) => {
    await OV.current!.getUserMedia({ audioSource: undefined, videoSource: undefined });
    const devices = await OV.current!.getDevices();
    const videoDevices = devices.filter((device) => device.kind === 'videoinput');

    const publisher = OV.current!.initPublisher(undefined, {
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
          updateSubscribers();
          localUserAccessAllowed.current = true;
          if (props.joinSession) {
            props.joinSession();
          }
        });
      });
    }

    localUser.setNickname(myUserName);
    localUser.setConnectionId(session.connection.connectionId || '');
    localUser.setScreenShareActive(false);
    localUser.setStreamManager(publisher);
    subscribeToUserChanged(session);
    subscribeToStreamDestroyed(session);
    sendSignalUserChanged(session, { isScreenShareActive: localUser.isScreenShareActive() });

    setCurrentVideoDevice(videoDevices[0]);
    setLocalUserState(localUser);

    publisher.videos[0].video.addEventListener('playing', () => {
      updateLayout();
      (publisher.videos[0].video.parentElement as HTMLElement).classList.remove('custom-class');
    });
  };

  const updateSubscribers = () => {
    setSubscribers([...remotes.current]);
    if (localUserState) {
      sendSignalUserChanged(session!, {
        isAudioActive: localUserState.isAudioActive(),
        isVideoActive: localUserState.isVideoActive(),
        nickname: localUserState.getNickname(),
        isScreenShareActive: localUserState.isScreenShareActive(),
      });
    }
    updateLayout();
  };

  const leaveSession = () => {
    if (session) {
      session.disconnect();
    }

    OV.current = undefined;
    setSession(undefined);
    setSubscribers([]);
    setMySessionId('SessionA');
    setMyUserName('OpenVidu_User' + Math.floor(Math.random() * 100));
    setLocalUserState(undefined);
    if (props.leaveSession) {
      props.leaveSession();
    }
  };

  const camStatusChanged = () => {
    localUser.setVideoActive(!localUser.isVideoActive());
    localUser.getStreamManager().publishVideo(localUser.isVideoActive());
    sendSignalUserChanged(session!, { isVideoActive: localUser.isVideoActive() });
    setLocalUserState({ ...localUser });
  };

  const micStatusChanged = () => {
    localUser.setAudioActive(!localUser.isAudioActive());
    localUser.getStreamManager().publishAudio(localUser.isAudioActive());
    sendSignalUserChanged(session!, { isAudioActive: localUser.isAudioActive() });
    setLocalUserState({ ...localUser });
  };

  const nicknameChanged = (nickname: string) => {
    if (localUserState) {
      localUserState.setNickname(nickname);
      setLocalUserState({ ...localUserState });
      sendSignalUserChanged(session!, { nickname: localUserState.getNickname() });
    }
  };

  const deleteSubscriber = (stream: StreamManager) => {
    const remoteUsers = subscribers;
    const userStream = remoteUsers.filter((user) => user.getStreamManager().stream === stream.stream)[0];
    const index = remoteUsers.indexOf(userStream, 0);
    if (index > -1) {
      remoteUsers.splice(index, 1);
      setSubscribers([...remoteUsers]);
    }
  };

  const subscribeToStreamCreated = (session: Session) => {
    session.on('streamCreated', (event: any) => {
      const subscriber = session.subscribe(event.stream, undefined);
      subscriber.on('streamPlaying', () => {
        checkSomeoneShareScreen();
        (subscriber.videos[0].video.parentElement as HTMLElement).classList.remove('custom-class');
      });
      const newUser = new UserModel();
      newUser.setStreamManager(subscriber);
      newUser.setConnectionId(event.stream.connection.connectionId);
      newUser.setType('remote');
      const nickname = event.stream.connection.data.split('%')[0];
      newUser.setNickname(JSON.parse(nickname).clientData);
      remotes.current.push(newUser);
      if (localUserAccessAllowed.current) {
        updateSubscribers();
      }
    });
  };

  const subscribeToStreamDestroyed = (session: Session) => {
    session.on('streamDestroyed', (event: any) => {
      deleteSubscriber(event.stream);
      setTimeout(() => {
        checkSomeoneShareScreen();
      }, 20);
      event.preventDefault();
      updateLayout();
    });
  };

  const subscribeToUserChanged = (session: Session) => {
    session.on('signal:userChanged', (event: any) => {
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
    const document = window.document as any;
    const fs = document.getElementById('container');
    if (
      !document.fullscreenElement &&
      !document.mozFullScreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement
    ) {
      if (fs?.requestFullscreen) {
        fs.requestFullscreen();
      } else if (fs?.msRequestFullscreen) {
        fs.msRequestFullscreen();
      } else if (fs?.mozRequestFullScreen) {
        fs.mozRequestFullScreen();
      } else if (fs?.webkitRequestFullscreen) {
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
      const devices = await OV.current!.getDevices();
      const videoDevices = devices.filter((device) => device.kind === 'videoinput');

      if (videoDevices && videoDevices.length > 1) {
        const newVideoDevice = videoDevices.find((device) => device.deviceId !== currentVideoDevice?.deviceId);

        if (newVideoDevice) {
          const newPublisher = OV.current!.initPublisher(undefined, {
            audioSource: undefined,
            videoSource: newVideoDevice.deviceId,
            publishAudio: localUser.isAudioActive(),
            publishVideo: localUser.isVideoActive(),
            mirror: true,
          });

          await session?.unpublish(localUser.getStreamManager());
          await session?.publish(newPublisher);
          localUser.setStreamManager(newPublisher);
          setCurrentVideoDevice(newVideoDevice);
          setLocalUserState({ ...localUser });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const screenShare = () => {
    const videoSource = navigator.userAgent.indexOf('Firefox') !== -1 ? 'window' : 'screen';
    const publisher = OV.current!.initPublisher(
      undefined,
      {
        videoSource: videoSource,
        publishAudio: localUser.isAudioActive(),
        publishVideo: localUser.isVideoActive(),
        mirror: false,
      },
      (error) => {
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
      session?.unpublish(localUser.getStreamManager());
      localUser.setStreamManager(publisher);
      session?.publish(localUser.getStreamManager()).then(() => {
        localUser.setScreenShareActive(true);
        setLocalUserState({ ...localUser });
        sendSignalUserChanged(session!, { isScreenShareActive: localUser.isScreenShareActive() });
      });
    });
    publisher.on('streamPlaying', () => {
      updateLayout();
      (publisher.videos[0].video.parentElement as HTMLElement).classList.remove('custom-class');
    });
  };

  const closeDialogExtension = () => {
    setShowExtensionDialog(false);
  };

  const stopScreenShare = () => {
    session?.unpublish(localUser.getStreamManager());
    connectWebCam(session!);
  };

  const checkSomeoneShareScreen = () => {
    const isScreenShared =
      subscribers.some((user) => user.isScreenShareActive()) || localUser.isScreenShareActive();
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
  };

  const toggleChat = (property?: 'none' | 'block') => {
    let display = property;

    if (display === undefined) {
      display = chatDisplay === 'none' ? 'block' : 'none';
    }
    if (display === 'block') {
      setChatDisplay(display);
      setMessageReceived(false);
    } else {
      console.log('chat', display);
      setChatDisplay(display);
    }
    updateLayout();
  };

  const checkNotification = () => {
    setMessageReceived(chatDisplay === 'none');
  };

  const checkSize = () => {
    if (document.getElementById('layout')?.offsetWidth <= 700 && !hasBeenUpdated.current) {
      toggleChat('none');
      hasBeenUpdated.current = true;
    }
    if (document.getElementById('layout')?.offsetWidth > 700 && hasBeenUpdated.current) {
      hasBeenUpdated.current = false;
    }
  };

  return (
		<div className="container" id="container">
			<div id="layout" className="bounds">
				{localUserState && localUserState.getStreamManager() && (
					<div className="OT_root OT_publisher custom-class" id="localUser">
						<StreamComponent user={localUserState} handleNickname={nicknameChanged} />
					</div>
				)}
				{subscribers.map((sub, i) => (
					<div key={i} className="OT_root OT_publisher custom-class" id="remoteUsers">
						<StreamComponent user={sub} streamId={sub.getStreamManager().stream.streamId} />
					</div>
				))}
				{localUserState && localUserState.getStreamManager() && (
					<div className="OT_root OT_publisher custom-class" style={{ display: chatDisplay }}>
						<ChatComponent
							user={localUserState}
							chatDisplay={chatDisplay}
							close={toggleChat}
							messageReceived={checkNotification}
						/>
					</div>
				)}
			</div>
			<div className="toolbar_bottom">
				<ToolbarComponent
					sessionId={mySessionId}
					user={localUserState}
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
			</div>
			
			<DialogExtensionComponent showDialog={showExtensionDialog} cancelClicked={closeDialogExtension} />
		</div>
	);
	
};

export default VideoRoomComponent;

const getToken = async () => {
  const sessionId = await createSession(mySessionId);
  return await createToken(sessionId);
};

const createSession = async (sessionId: string) => {
  const response = await axios.post(
    APPLICATION_SERVER_URL + 'api/sessions',
    { customSessionId: sessionId },
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
  return response.data; // The sessionId
};

const createToken = async (sessionId: string) => {
  const response = await axios.post(
    APPLICATION_SERVER_URL + 'api/sessions/' + sessionId + '/connections',
    {},
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
  return response.data; // The token
};
