import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { getCookieToken, removeCookieToken } from '../../util/Cookie';
import { deleteToken } from '../../store/jwtSlice';
import { AppDispatch, RootState } from '../../store/store';

const Logout : React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // store에 저장된 Access Token 정보를 받아 온다
  const { accessToken } = useSelector((state: RootState) => state.token);

  // Cookie에 저장된 Refresh Token 정보를 받아 온다
  const refreshToken = getCookieToken();

  const logout = async () => {
    if (!refreshToken || !accessToken) {
      // Token이 없을 경우 로그아웃 처리
      dispatch(deleteToken());
      removeCookieToken();
      return navigate('/');
    }

    // 백으로부터 받은 응답
    const data: LogoutResponse = await logoutUser({ refresh_token: refreshToken }, accessToken);

    if (data.status) {
      // store에 저장된 Access Token 정보를 삭제
      dispatch(deleteToken());
      // Cookie에 저장된 Refresh Token 정보를 삭제
      removeCookieToken();
      navigate('/');
    } else {
      window.location.reload();
    }
  };

  // 해당 컴포넌트가 요청된 후 한 번만 실행되면 되기 때문에 useEffect 훅을 사용
  useEffect(() => {
    logout();
  }, []);

  return (
    <>
      <Link to="/" />
    </>
  );
}

export default Logout;