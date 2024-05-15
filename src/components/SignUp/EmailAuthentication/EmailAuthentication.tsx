import { useEffect, useRef, useState } from 'react';
import classes from './EmailAuthentication.module.css';
import SignUpUser from '../../../types/SignUpUser.type';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface AuthenticationProps{
	toggleModal : () => void;
	signUpData : SignUpUser;
}


const EmailAuthentication: React.FC<AuthenticationProps> = ({ toggleModal, signUpData }) => {
 
	const [authCode, setAuthCode] = useState<string>('');
	const [timeLeft, setTimeLeft] = useState<number>(0); // 인증기간을 임시로 5분을 잡음
	
	const modalRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();

	useEffect(() => {
		let timer: ReturnType<typeof setInterval> | null = null;
  
		if (timeLeft > 0) {
			timer = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
		}
	
		return () => {
			if (timer) clearInterval(timer); // timer가 null이 아니면 clearInterval 호출
		};
  }, [timeLeft]);


	const sendAuthenticateEmail = async() => {
		
		setTimeLeft(300);

		//인증코드를 state로 관리 후, 이메일 인증 확인.
	}

	const formatTimeLeft = () => {
    // 남은 시간을 MM:SS 형식으로 변환
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

	const completeSignUp = async (event : React.FormEvent) => {
		event.preventDefault();
		

		const signUpDate = new Date().toISOString();

		const finalSignUpData = {
			...signUpData,
			signUpDate : signUpDate,
		}; //이메일 인증코드 

		const body = JSON.stringify(finalSignUpData);

		try {
			const response = await axios.post('endpoint_url', body, {
				headers : {
					'Content-Type' : 'application/json',
				}
			});

			if (response){
				//응답 제대로 왔으면 그에 맞는 화면 구성
				alert('회원가입이 정상처리되어 로그인화면으로 이동합니다!');
				navigate('/login');
			}
			else{
				//회원가입 제대로 안됐으면 맞는 화면 구성(백엔드와 논의)
				alert('인증 코드가 올바르지 않습니다!');
				navigate('/login');
			}
		} catch(error){
			console.error('회원가입 중 에러 발생', error);
			alert('회원가입이 정상처리되어 로그인화면으로 이동합니다!');
			navigate('/login');
		}
	}

  return (
    <form className={classes.modalOverlay} onSubmit={completeSignUp}>
			
      <div className={classes.modalContent} onClick={e => e.stopPropagation()} ref={modalRef}>
				<div className={classes.close_button_container}>
					<button className={classes.close_button} onClick={toggleModal}></button>
				</div>
        <div className={classes.title}>
					<h2 className={classes.big_title}>이메일 인증</h2>
					<h4 className={classes.small_title}><span>{signUpData.email}</span>로 인증메일을 발송하시겠어요?</h4>
					<button className={classes.authenticate_button} onClick={sendAuthenticateEmail}>인증메일 받기</button>
				</div>

				ui는 상의 후 변경

				<div className={classes.authCodeWrapper}>
					<input 
						className={classes.input}
						placeholder='받은 인증코드를 정확히 입력해주세요'
						value={authCode}
						onChange={(e) => setAuthCode(e.target.value)}
						id='authCode'
					/>
					<span className={classes.timer}>
						{timeLeft > 0 ? formatTimeLeft() : ''}
					</span>
				</div>

				
				<button className={classes.authenticate_button} onClick={completeSignUp}>회원가입 완료하기</button>
      </div>
    </form>
  )
}

export default EmailAuthentication;