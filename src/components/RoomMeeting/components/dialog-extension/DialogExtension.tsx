import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faDownload, faSync } from '@fortawesome/free-solid-svg-icons';
import './DialogExtension.css';

interface DialogExtensionProps {
  showDialog: boolean;
  cancelClicked: () => void;
}

interface DialogExtensionState {
  isInstalled: boolean;
}

export default class DialogExtensionComponent extends Component<DialogExtensionProps, DialogExtensionState> {
  openviduExtensionUrl: string;

  constructor(props: DialogExtensionProps) {
    super(props);
    this.openviduExtensionUrl =
      'https://chrome.google.com/webstore/detail/openvidu-screensharing/lfcgfepafnobdloecchnfaclibenjold';

    this.state = {
      isInstalled: false,
    };
    this.goToChromePage = this.goToChromePage.bind(this);
    this.onNoClick = this.onNoClick.bind(this);
    this.refreshBrowser = this.refreshBrowser.bind(this);
  }

  onNoClick() {
    this.props.cancelClicked();
  }

  goToChromePage() {
    window.open(this.openviduExtensionUrl);
    this.setState({ isInstalled: true });
  }

  refreshBrowser() {
    window.location.reload();
  }

  render() {
    return (
      <div>
        {this.props.showDialog ? (
          <div id="dialogExtension">
            <div className="card">
              <div className="card-content">
                <h2>Hello</h2>
                <p>
                  You need to install this Chrome extension and refresh the browser to share your screen.
                </p>
              </div>
              <div className="card-actions">
                <button className="icon-button" onClick={this.onNoClick}>
                  <FontAwesomeIcon icon={faTimes} /> Cancel
                </button>

                <button className="icon-button" onClick={this.goToChromePage}>
                  <FontAwesomeIcon icon={faDownload} /> Install
                </button>
                {this.state.isInstalled ? (
                  <button className="icon-button" onClick={this.refreshBrowser}>
                    <FontAwesomeIcon icon={faSync} /> Refresh
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}
