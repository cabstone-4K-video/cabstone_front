import KurentoService from '../KurentoService/KurentoService';
import axios from '../../../../apis/axios';

class WebSocketService {
    private socket: WebSocket | null = null;
    private listeners: { [key: string]: ((data: any) => void)[] } = {};

    connect(url: string) {
			this.socket = new WebSocket(url);

			this.socket.onmessage = (event) => {
				const message = JSON.parse(event.data);
				switch (message.type) {
					case 'offer':
						console.log('Signal OFFER received');
						KurentoService.handleOfferMessage(message);
						break;
					case 'answer':
						console.log('Signal ANSWER received');
						KurentoService.handleAnswerMessage(message);
						break;
					case 'ice':
						console.log('Signal ICE Candidate received');
						KurentoService.handleNewICECandidateMessage(message);
						break;
					case 'join':
						console.log('Client is starting to negotiate or wait for a peer');
						this.handleJoinMessage(message);
						break;
					case 'leave':
						KurentoService.stop();
						break;
					default:
						console.error('Wrong type message received from server');
				}
		};

		this.socket.onerror = (error) => {
			console.error("WebSocket error:", error);
		};
	}

    send(message: any) {
			if (this.socket) {
				this.socket.send(JSON.stringify(message));
			}
    }

    on(id: string, callback: (data: any) => void) {
			if (!this.listeners[id]) {
				this.listeners[id] = [];
			}
			this.listeners[id].push(callback);
    }

    off(id: string, callback: (data: any) => void) {
			if (this.listeners[id]) {
				this.listeners[id] = this.listeners[id].filter(listener => listener !== callback);
			}
    }

    async handleJoinMessage(message: any) {
			const data = await this.chatListCount();
			console.log('Client is starting to ' + (data === "true" ? 'negotiate' : 'wait for a peer'));
			console.log("messageDATA: " + data);
    }

    async chatListCount() {
			try {
				const response = await axios.post('/webrtc/usercount', {
					from: localStorage.getItem('userName'),
					type: 'findCount',
					data: localStorage.getItem('localRoom'),
					candidate: null,
					sdp: null
				});
				return response.data;
			} catch (error) {
					console.error("Error: " + error);
			}
    }
}

export default new WebSocketService();
