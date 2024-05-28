import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import './DialogExtension.css';

interface Props {
    showDialog: boolean;
    cancelClicked: () => void;
}

const DialogExtensionComponent: React.FC<Props> = ({ showDialog, cancelClicked }) => {
    const openviduExtensionUrl = 'https://chrome.google.com/webstore/detail/openvidu-screensharing/lfcgfepafnobdloecchnfaclibenjold';
    const [isInstalled, setIsInstalled] = useState<boolean>(false);

    const onNoClick = () => {
        cancelClicked();
    };

    const goToChromePage = () => {
        window.open(openviduExtensionUrl);
        setIsInstalled(true);
    };

    const refreshBrowser = () => {
        window.location.reload();
    };

    return (
        <div>
            {showDialog ? (
                <div id="dialogExtension">
                    <Card id="card">
                        <CardContent>
                            <Typography color="textSecondary">Hello</Typography>
                            <Typography color="textSecondary">
                                You need to install this chrome extension and refresh the browser to share your screen.
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small" onClick={onNoClick}>
                                Cancel
                            </Button>
                            <Button size="small" onClick={goToChromePage}>
                                Install
                            </Button>
                            {isInstalled && (
                                <Button size="small" onClick={refreshBrowser}>
                                    Refresh
                                </Button>
                            )}
                        </CardActions>
                    </Card>
                </div>
            ) : null}
        </div>
    );
};

export default DialogExtensionComponent;
