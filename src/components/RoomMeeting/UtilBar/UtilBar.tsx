import React from 'react';
import classes from './UtilBar.module.css';
import cameraIcon from '../../../assets/icon/cameraIcon.svg';
import micIcon from '../../../assets/icon/micIcon.svg';
import screenShareIcon from '../../../assets/icon/screenShareIcon.svg';
import hangUpIcon from '../../../assets/icon/hangUpIcon.svg';

const UtilBar: React.FC = () => {
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
                <div className={`${classes.utilButtonBox} ${classes.tooltip}`}>
                    <img className={classes.utilIcon} src={screenShareIcon} alt='screenSButton' />
                    <span className={classes.tooltiptext}>화면공유하기</span>
                </div>
                <div className={`${classes.utilButtonBox} ${classes.tooltip}`}>
                    <img className={classes.utilIcon} src={hangUpIcon} alt='exitButton' />
                    <span className={classes.tooltiptext}>연결 종료하기</span>
                </div>
            </div>
        </div>
    );
}

export default UtilBar;
