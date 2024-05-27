class UserModel {
	connectionId: string;
	audioActive: boolean;
	videoActive: boolean;
	screenShareActive: boolean;
	nickname: string;
	streamManager: any; // You may want to define a specific type here
	type: 'remote' | 'local';

	constructor() {
			this.connectionId = '';
			this.audioActive = true;
			this.videoActive = true;
			this.screenShareActive = false;
			this.nickname = '';
			this.streamManager = null;
			this.type = 'local';
	}

	isAudioActive(): boolean {
			return this.audioActive;
	}

	isVideoActive(): boolean {
			return this.videoActive;
	}

	isScreenShareActive(): boolean {
			return this.screenShareActive;
	}

	getConnectionId(): string {
			return this.connectionId;
	}

	getNickname(): string {
			return this.nickname;
	}

	getStreamManager(): any { // You may want to define a specific type here
			return this.streamManager;
	}

	isLocal(): boolean {
			return this.type === 'local';
	}

	isRemote(): boolean {
			return !this.isLocal();
	}

	setAudioActive(isAudioActive: boolean): void {
			this.audioActive = isAudioActive;
	}

	setVideoActive(isVideoActive: boolean): void {
			this.videoActive = isVideoActive;
	}

	setScreenShareActive(isScreenShareActive: boolean): void {
			this.screenShareActive = isScreenShareActive;
	}

	setStreamManager(streamManager: any): void { // You may want to define a specific type here
			this.streamManager = streamManager;
	}

	setConnectionId(connectionId: string): void {
			this.connectionId = connectionId;
	}

	setNickname(nickname: string): void {
			this.nickname = nickname;
	}

	setType(type: 'local' | 'remote'): void {
			if (type === 'local' || type === 'remote') {
					this.type = type;
			}
	}

	clone(): UserModel {
		const clone = new UserModel();
		clone.connectionId = this.connectionId;
		clone.audioActive = this.audioActive;
		clone.videoActive = this.videoActive;
		clone.screenShareActive = this.screenShareActive;
		clone.nickname = this.nickname;
		clone.streamManager = this.streamManager;
		clone.type = this.type;
		return clone;
}
}

export default UserModel;
