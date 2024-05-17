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
                <div className={classes.utilButtonBox}>
                    <img className={classes.utilIcon} src={cameraIcon} alt='cameraButton' />
                </div>
                <div className={classes.utilButtonBox}>
                    <img className={classes.utilIcon} src={micIcon} alt='micButton' />
                </div>
                <div className={classes.utilButtonBox}>
                    <img className={classes.utilIcon} src={screenShareIcon} alt='screenSButton' />
                </div>
                <div className={classes.utilButtonBox}>
                    <img className={classes.utilIcon} src={hangUpIcon} alt='exitButton' />
                </div>
            </div>
        </div>
    );
}

export default UtilBar;
