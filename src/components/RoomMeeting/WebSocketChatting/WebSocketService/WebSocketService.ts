class WebSocketService {
	private socket: WebSocket | null = null;
	private listeners: { [key: string]: ((data: any) => void)[] } = {};

	connect(url: string) {
		this.socket = new WebSocket(url);

		this.socket.onmessage = (event) => {
			const message = JSON.parse(event.data);
			const { id, ...data } = message;
			if (this.listeners[id]) {
				this.listeners[id].forEach(listener => listener(data));
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
}

export default new WebSocketService();
