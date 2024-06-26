import React from 'react';
import axios from '../../../apis/axios';
import classes from './EmailDuplicate.module.css';

interface EmailProp {
  email: string;
  setIsEmailDuplicated: (e: boolean) => void;
  setErrors: (updateFunction: (errors: ErrorState) => ErrorState) => void;
}

interface ErrorState {
  email?: string;
  password?: string;
  passwordCheck?: string;
  phoneNumber?: string;
}

const EmailDuplicateCheck: React.FC<EmailProp> = ({ email, setIsEmailDuplicated, setErrors }) => {

  const checkDuplicate = async (event: React.FormEvent) => {
    event.preventDefault();

    const body = { email }; // Axios will automatically stringify the object
    console.log(body);

    try {
      const response = await axios.post('/user/checkduplicate', body, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.data.code === '200') {
        console.log('Email is Available');
        setIsEmailDuplicated(false);
        setErrors(errors => ({ ...errors, email: '' })); // 중복되지 않음
      }
    } catch (error) {
      console.error("Error occurred:", error);
      //일단 인증값 참으로 설정
      setIsEmailDuplicated(true);
      setErrors(errors => ({ ...errors, email: '중복된 이메일입니다.' })); //중복됨
    }
  }

  return (
    <div className={classes.container}>
      <button className={classes.duplicateCheckButton} onClick={checkDuplicate}>
        <h2>이메일 중복확인</h2>
      </button>
    </div>
  );
}

export default EmailDuplicateCheck;
