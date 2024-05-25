import React, { useState } from 'react';
import classes from './UtilBar.module.css';
import cameraIcon from '../../../assets/icon/cameraIcon.svg';
import micIcon from '../../../assets/icon/micIcon.svg';
import screenShareIcon from '../../../assets/icon/screenShareIcon.svg';
import hangUpIcon from '../../../assets/icon/hangUpIcon.svg';
import { startScreenShare, stopScreenShare } from './ScreenShare/ScreenShare';

const UtilBar: React.FC = () => {
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const handleScreenShare = async () => {
    if (isScreenSharing) {
      await stopScreenShare();
      setIsScreenSharing(false);
    } else {
      await startScreenShare();
      setIsScreenSharing(true);
    }
  };

  return (
    <div className={classes.utilBarContainer}>
      <div className={classes.utilBarWrapper}>
        <div className={`${classes.utilButtonBox} ${classes.tooltip}`}>
          <img className={classes.utilIcon} src={cameraIcon} alt='cameraButton' />
          <span className={classes.tooltiptext}>카메라 설정하기</span>
        </div>
        <div className={`${classes.utilButtonBox} ${classes.tooltip}`}>
          <img className={classes.utilIcon} src={micIcon} alt='micButton' />
          <span className={classes.tooltiptext}>마이크 설정하기</span>
        </div>
        <div className={`${classes.utilButtonBox} ${classes.tooltip}`} onClick={handleScreenShare}>
          <img className={classes.utilIcon} src={screenShareIcon} alt='screenSButton' />
          <span className={classes.tooltiptext}>{isScreenSharing ? '화면 공유 중지' : '화면 공유하기'}</span>
        </div>
        <div className={`${classes.utilButtonBox} ${classes.tooltip}`}>
          <img className={classes.utilIcon} src={hangUpIcon} alt='exitButton' />
          <span className={classes.tooltiptext}>연결 종료하기</span>
        </div>
      </div>
    </div>
  );
};

export default UtilBar;
