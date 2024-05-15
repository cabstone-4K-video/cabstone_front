
import './App.css'
import { createBrowserRouter, RouterProvider, } from 'react-router-dom';
import RoomSelectPage from './pages/RoomSelectPage';
import LoginPage from './pages/LoginPage';
import UserInfoLayout from './layouts/UserInfoLayout/UserInfoLayout';
import SignUpPage from './pages/SignUpPage';
import StartingPage from './pages/StartingPage';
import RoomReadyPage from './pages/RoomReadyPage';
import MainLayout from './layouts/MainLayout/MainLayout';
import RoomMeeting from './components/RoomMeeting/ScreenShare/ScreenShare';
import { useDispatch } from 'react-redux';
import { AppDispatch } from './store/store';
import { useEffect } from 'react';
import { setToken } from './store/jwtSlice';

const router = createBrowserRouter([
	{
		path: "/",
		element: <UserInfoLayout />,
		children: [
			{ index: true, element : <StartingPage/> },
			{ path: 'login', element: <LoginPage/>},
			{ 
				path: 'signUp', 
				element: <SignUpPage/>,
				children: [
					{ path: 'agreement', element: <SignUpPage/> }
				] 
			},

			
		]
	},
	{
		path : '/main',
		element : <MainLayout />,
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

