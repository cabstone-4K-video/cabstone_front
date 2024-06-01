import React from 'react';
import OpenViduVideoComponent from '../OvVideo';
import classes from './UserVideo.module.css';

interface UserVideoComponentProps {
    streamManager: any;
}

const UserVideoComponent: React.FC<UserVideoComponentProps> = ({ streamManager }) => {

    const getNicknameTag = (): string => {
        // Gets the nickName of the user
        return JSON.parse(streamManager.stream.connection.data).clientData;
    }

    return (
        <div>
            {streamManager !== undefined ? (
                <div className={classes.streamcomponent}>
                    <OpenViduVideoComponent streamManager={streamManager} />
                    <div className={classes.streamcomponentDiv}><p className={classes.p}>{getNicknameTag()}</p></div>
                </div>
            ) : null}
        </div>
    );
}

export default UserVideoComponent;
