import WebSocketService from '../WebSocketService/WebSocketService';

class KurentoService {
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;

  async initializeLocalStream(videoDevice: string, audioDevice: string) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: videoDevice } },
        audio: { deviceId: { exact: audioDevice } },
      });

      return this.localStream;
    } catch (error) {
      console.error('Error accessing local media:', error);
      throw error;
    }
  }

  async createPeerConnection() {
    if (!this.peerConnection) {
      this.peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          WebSocketService.send({ type: 'ice', candidate: event.candidate });
        }
      };

      this.peerConnection.ontrack = (event) => {
        this.remoteStream = event.streams[0];
      };

      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection?.addTrack(track, this.localStream!);
        });
      }
    }
  }

  async createOffer() {
    if (this.peerConnection) {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      WebSocketService.send({ type: 'offer', sdp: this.peerConnection.localDescription });
    }
  }

  async handleOfferMessage(message: any) {
    if (!this.peerConnection) await this.createPeerConnection();
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      WebSocketService.send({ type: 'answer', sdp: this.peerConnection.localDescription });
    }
  }

  async handleAnswerMessage(message: any) {
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(message.sdp));
    }
  }

  async handleNewICECandidateMessage(message: any) {
    if (this.peerConnection) {
      const candidate = new RTCIceCandidate(message.candidate);
      await this.peerConnection.addIceCandidate(candidate);
    }
  }

  stop() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    this.remoteStream = null;
  }

  getPeerConnection() {
    return this.peerConnection;
  }

  getLocalStream() {
    return this.localStream;
  }
}

export default new KurentoService();
