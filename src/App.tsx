
import './App.css'
import { createBrowserRouter, Navigate, RouterProvider, } from 'react-router-dom';
import RoomSelectPage from './pages/RoomSelectPage';
import LoginPage from './pages/LoginPage';
import UserInfoLayout from './layouts/UserInfoLayout/UserInfoLayout';
import SignUpPage from './pages/SignUpPage';
import StartingPage from './pages/StartingPage';
import RoomReadyPage from './pages/RoomReadyPage';
import MainLayout from './layouts/MainLayout/MainLayout';
import RoomMeeting from './components/RoomMeeting/ScreenShare/ScreenShare';

import { useEffect } from 'react';

interface PrivateRouteProps{
	children : React.ReactElement;
}

const PrivateRoute : React.FC<PrivateRouteProps> = ({ children }) => {
	const authenticated = localStorage.getItem('userToken');
	if(authenticated){ //  !authenticated로 바꿔서.
		alert('로그인 후에 이용가능합니다.');
		return <Navigate to="/login" />;
	}

	return children;
}

const router = createBrowserRouter([
	{
		path: "/",
		element: <UserInfoLayout />,
		children: [
			{ index: true, element : <StartingPage/> },
			{ path: 'login', element: <LoginPage/>},
			{ path: 'signUp', element: <SignUpPage/>, },

		]
	},
	{
		path : '/main',
		element : <PrivateRoute><MainLayout /></PrivateRoute>,
		children : [
			{
				path: 'roomSelect',
				element: <RoomSelectPage/>
			},
			{
				path: 'roomReady',
				element: <RoomReadyPage/>
			},
			{
				path : 'roomMeeting',
				element : <RoomMeeting/>
			}
		]
		
	},

])

function App() {

	useEffect(() => {
		const token = localStorage.getItem('userToken');
		
	})

  return (
    <>
			<RouterProvider router={router} />
    </>
  )
}

export default App;

