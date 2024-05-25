import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import UtilBar from './UtilBar/UtilBar';
import ParticipantsBox from './ParticipantsBox/ParticipantsBox';
import Chatting from './WebSocketChatting/Chatting';
import WebSocketService from './WebSocketChatting/WebSocketService/WebSocketService';
import KurentoService from './WebSocketChatting/KurentoService/KurentoService';
import classes from './RoomMeeting.module.css';
import chattingIcon from '../../assets/icon/chattingIcon.svg';

const RoomMeeting: React.FC = () => {
  const { videoDevice, audioDevice, userName } = useSelector((state: RootState) => state.connectionInfo);
  const [visibleChat, setVisibleChat] = useState<boolean>(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [participants, setParticipants] = useState<string[]>([]);

  useEffect(() => {
    WebSocketService.connect('ws://localhost:8080/websocket');

    WebSocketService.on('offer', async (message: any) => {
      await KurentoService.handleOfferMessage(message);
    });

    WebSocketService.on('answer', async (message: any) => {
      await KurentoService.handleAnswerMessage(message);
    });

    WebSocketService.on('ice', async (message: any) => {
      await KurentoService.handleNewICECandidateMessage(message);
    });

    WebSocketService.on('newParticipantArrived', (message: any) => {
      setParticipants(prev => [...prev, message.name]);
    });

    return () => {
      WebSocketService.off('offer', KurentoService.handleOfferMessage);
      WebSocketService.off('answer', KurentoService.handleAnswerMessage);
      WebSocketService.off('ice', KurentoService.handleNewICECandidateMessage);
    };
  }, []);

  const startCall = async () => {
    if (videoDevice && audioDevice) {
      const localStream = await KurentoService.initializeLocalStream(videoDevice, audioDevice);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
      await KurentoService.createPeerConnection();
      await KurentoService.createOffer();
    }
  };

  return (
    <div className={`${classes.container} ${visibleChat ? classes.containerCentered : classes.containerSpaceBetween}`}>
      <div className={`${classes.callBox} ${!visibleChat ? '' : classes.callBoxCentered}`}>
        <ParticipantsBox />
        <UtilBar />
        <button
          className={`${classes.chatting_visibleButton} ${!visibleChat ? classes.chatting_visibleButton_spreaded : ''}`}
          onClick={() => setVisibleChat(!visibleChat)}
        >
          <img src={chattingIcon} alt='chattingIcon' className={chattingIcon}/>
        </button>
      </div>
      <div className={`${classes.chatting} ${visibleChat ? classes.chatting_visible : classes.chatting_hidden}`}>
        <Chatting />
      </div>
      <div className={classes.videoContainer}>
        <video ref={localVideoRef} autoPlay playsInline muted className={classes.localVideo} />
        <video ref={remoteVideoRef} autoPlay playsInline className={classes.remoteVideo} />
        <button onClick={startCall} className={classes.startButton}>Start Call</button>
      </div>
    </div>
  );
};

export default RoomMeeting;
