import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import classes from './AudioTest.module.css'

const AudioTest: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const { audioDevice } = useSelector((state: RootState) => state.connectionInfo);
  const animationFrameId = useRef<number | null>(null);

  // AudioContext 타입 확인
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = useRef<AudioContext | null>(null);

	const [muted, setMuted] = useState<boolean>(false);

  useEffect(() => {
    
    if (AudioContext) {
      audioContext.current = new AudioContext();
    } else {
      console.error('Web Audio API is not supported in this browser');
      return;
    }

    const enableStream = async () => {
      if (audioDevice && audioContext.current) {  // audioContext.current 존재 여부 확인
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: { deviceId: audioDevice ? { exact: audioDevice } : undefined }
          });
          if (audioRef.current) {
            audioRef.current.srcObject = audioStream;

            // 오디오 분석기 설정
            const mediaStreamSource = audioContext.current.createMediaStreamSource(audioStream);
            const analyser = audioContext.current.createAnalyser();
            analyser.fftSize = 256;
            mediaStreamSource.connect(analyser);
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const draw = () => {
              if (analyser) {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                  sum += dataArray[i];
                }
                let average = sum / bufferLength;
                setAudioLevel(average);
                animationFrameId.current = requestAnimationFrame(draw);
              }
            };

            draw();
          }
        } catch (error) {
          console.error('Error accessing the microphone:', error);
        }
      }
    };

    enableStream();

    return () => {
      // 스트림 정리 및 애니메이션 프레임 취소
      if (audioRef.current && audioRef.current.srcObject) {
        const tracks = (audioRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      audioContext.current?.close(); 
    };
  }, [audioDevice]);

  return (
    <div className={classes.audioContainer}>
      {!muted ? <p style={{height : '30px', margin: '1px'}}>버튼을 눌러 마이크 입력을 확인하세요.</p> : ''}
      <audio ref={audioRef} autoPlay style={{ display: 'none' }} />
			
      {muted ? <progress className={classes.progressBar} value={audioLevel} max="128" /> : ''}
      
			<button 
				className={classes.micCheckButton} 
				onClick={() => setMuted(!muted)}
				
			>
				{!muted? '마이크 테스트 하기' : '테스트 멈추기'}
			</button>
      
    </div>
  );
};

export default AudioTest;
