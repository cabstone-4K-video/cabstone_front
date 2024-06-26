
import Divider from '../Divider/Divider';
import classes from './style.module.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginError from './LoginError/LoginError';
import Loading from '../Loading/Loading';
import axios from '../../apis/axios';

const Login : React.FC = () => {
	const [focused, setFocused] = useState<string | null>(null);
	const [email, setEmail] = useState<string>('');
	const [password, setPassWord] = useState<string>('');
	const [isLoginError, setIsLoginError] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false); 
	
	const navigate = useNavigate();

	const handleFocus = (id: string) => {
		setFocused(id);
	}

	const handleBlur = () => {
		setFocused(null);
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		const body = JSON.stringify({ email, password });	
		setIsLoading(true);

		try {
      const response = await axios.post('/user/login', body);

      const { code, message, token } = response.data;
      if (code === '200' && token) {
        localStorage.setItem('userToken', token);
        navigate('/setting/roomSelect');
      } else {
        setIsLoginError(true);
        alert(message);
      }

    } catch (error) {
      console.log("Login failed : ", error);
      setIsLoginError(true);
      alert("로그인에 실패했습니다. 다시 시도해주세요.");

    } finally {
      setIsLoading(false);
    }
  
	}


	return (
		<form className={classes.outlet_container} onSubmit={handleSubmit}>
			<div className={classes.wrapper}>
				<input
					id='login_email'
					className={classes.input}
					type='text'
					placeholder='이메일을 입력해주세요'
					onFocus={() => handleFocus('email')}
					onBlur={handleBlur}
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				{focused === 'email' && <span className={classes.message}><span className={classes.red}>TIP</span>이메일 아이디만 입력해주세요!</span>}
				
				<input
					id='login_password'
					className={classes.input}
					type='password'
					placeholder='비밀번호를 입력해주세요'
					onFocus={() => handleFocus('password')}
					onBlur={handleBlur}
					value={password}
					onChange={(e) => setPassWord(e.target.value)}
				/>
			</div>
			
			{isLoading ? <Loading/> : null }

			<Divider/>

			{isLoginError ? <LoginError/> : null }

			<button 
				className={classes.login_button}
				onClick={handleSubmit}
			>
				로그인
			</button>
			<div className={classes.user_help}>
				<a className={classes.signUp}>
					<h4 onClick={()=>{navigate('/signUp')}}>회원가입</h4>
				</a>
				<ul className={classes.finds}>
					<li className={classes.find}><h4>계정 찾기</h4></li>
					<li>|</li>
					<li className={classes.find}><h4>비밀번호 찾기</h4></li>
				</ul>
			</div>
		</form>
	)
}

export default Login;