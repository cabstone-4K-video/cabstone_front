import React, { useState } from 'react';
import classes from './Participants.module.css';

const ParticipantsBox: React.FC = () => {
  const [participants, setParticipants] = useState<number>(0);

  const increaseParticipants = () => {
    setParticipants(participants + 1);
  }

  const decreaseParticipants = () => {
    if (participants > 0) {
      setParticipants(participants - 1);
    } else {
      alert('참여자는 0미만이 될 수 없습니다.');
    }
  }

  // 참가자 수에 따라 grid 클래스 이름을 동적으로 설정
  const getGridClass = () => {
    if (participants === 1) return classes.one;
    if (participants === 2) return classes.two;
    return classes.three;
  }

  return (
    <div>
      <div className={`${classes.participants_container} ${getGridClass()}`}>
        {Array.from({ length: participants }, (_, i) => (
          <div key={i} className={classes.participant}>
            참가자{i + 1}
          </div>
        ))}
      </div>
      <button onClick={increaseParticipants}>참가자 추가</button>
      <button onClick={decreaseParticipants}>참가자 감소</button>
    </div>
  );
};

export default ParticipantsBox;
