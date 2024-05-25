import WebSocketService from "../../WebSocketChatting/WebSocketService/WebSocketService";
import KurentoService from "../../WebSocketChatting/KurentoService/KurentoService";

class ScreenHandler {
  private shareView: MediaStream | null = null;

  async getCrossBrowserScreenCapture() {
    if (navigator.mediaDevices.getDisplayMedia) {
      return navigator.mediaDevices.getDisplayMedia({ video: true });
    } else if ((navigator as any).getDisplayMedia) {
      return (navigator as any).getDisplayMedia({ video: true });
    } else {
      throw new Error('Screen sharing not supported in this browser');
    }
  }

  async start() {
    try {
      this.shareView = await this.getCrossBrowserScreenCapture();
    } catch (err) {
      console.log('Error getDisplayMedia', err);
    }
    return this.shareView;
  }

  end() {
    if (this.shareView) {
      this.shareView.getTracks().forEach(track => track.stop());
      this.shareView = null;
    }
  }

  getShareView() {
    return this.shareView;
  }
}

const screenHandler = new ScreenHandler();

async function startScreenShare() {
  await screenHandler.start();
  const shareView = screenHandler.getShareView();
  if (!shareView) return;

  // 백엔드에 화면 공유 시작을 알리는 코드를 추가합니다.
  WebSocketService.send({ type: 'screen-share-start' });

  const videoElement = document.querySelector('video#localVideo') as HTMLVideoElement;
  if (videoElement) {
    videoElement.srcObject = shareView;
  }

  const peerConnection = KurentoService.getPeerConnection();
  peerConnection?.getSenders().forEach((sender: RTCRtpSender) => {
    if (sender.track?.kind === 'video') {
      const newTrack = shareView.getVideoTracks()[0];
      sender.replaceTrack(newTrack);
    }
  });

  shareView.getVideoTracks()[0].addEventListener("ended", () => {
    stopScreenShare();
  });
}

async function stopScreenShare() {
  screenHandler.end();
  
  // 백엔드에 화면 공유 중지를 알리는 코드를 추가합니다.
  WebSocketService.send({ type: 'screen-share-stop' });

  const videoElement = document.querySelector('video#localVideo') as HTMLVideoElement;
  const originalStream = KurentoService.getLocalStream();
  if (videoElement) {
    videoElement.srcObject = originalStream;
  }

  const peerConnection = KurentoService.getPeerConnection();
  peerConnection?.getSenders().forEach((sender: RTCRtpSender) => {
    if (sender.track?.kind === 'video') {
      const newTrack = originalStream?.getVideoTracks()[0] || null;
      sender.replaceTrack(newTrack);
    }
  });
}

export { startScreenShare, stopScreenShare };
