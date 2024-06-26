class UserModel {
	connectionId: string;
	audioActive: boolean;
	videoActive: boolean;
	screenShareActive: boolean;
	nickname: string;
	streamManager: any; // 타입을 더 구체적으로 정의할 수 있으면 변경하세요
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

	getStreamManager(): any { // 타입을 더 구체적으로 정의할 수 있으면 변경하세요
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

	setStreamManager(streamManager: any): void { // 타입을 더 구체적으로 정의할 수 있으면 변경하세요
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
}

export default UserModel;
