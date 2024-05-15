
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
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store/store';
import { useEffect } from 'react';
import { setToken } from './store/jwtSlice';

interface PrivateRouteProps{
	children : React.ReactElement;
}

const PrivateRoute : React.FC<PrivateRouteProps> = ({ children }) => {
	const authenticated = useSelector((state : RootState) => state.authToken.authenticated);
	
	return authenticated ? children : <Navigate to="/login" />
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

	const dispatch = useDispatch<AppDispatch>();

	useEffect(() => {
		const token = localStorage.getItem('userToken');
		if(token){
			dispatch(setToken(token));
		}else{

		}
	})

  return (
    <>
			<RouterProvider router={router} />
    </>
  )
}

export default App;

