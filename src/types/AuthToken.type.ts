interface AuthTokenState{
  authenticated: boolean;
  accessToken: string | null;
  expireTime: number | null;
}

export default AuthTokenState;