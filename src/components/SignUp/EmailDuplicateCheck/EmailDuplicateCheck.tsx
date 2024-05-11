import axios from "axios";
import classes from './EmailDuplicate.module.css';

interface EmailProp{
  email : string;
  setIsEmailDuplicated : (e : boolean) => void;
	setErrors: (updateFunction: (errors: ErrorState) => ErrorState) => void;
}

interface ErrorState {
  email?: string;
  password?: string;
  passwordCheck?: string;
  phoneNumber?: string;
}

const EmailDuplicateCheck:React.FC<EmailProp> = ({ email, setIsEmailDuplicated, setErrors }) => {

  const CheckDuplicate = async(event : React.FormEvent) => {
		event.preventDefault();

		const body = JSON.stringify({ email });
    console.log(body);
    
		try{
			const response = await axios.post('http://localhost:8080/api/user/checkduplicate', body, {
				headers : {
					'Content-Type' : 'application/json',
				}
			});
			
      if(response.data.code === '200'){
				console.log('Email is Available');
        setIsEmailDuplicated(false);
        setErrors(errors => ({...errors, email: ''})); // 중복되지 않음
			}
		}
		catch(error){
			console.error("Error occurred:", error);
      setIsEmailDuplicated(true);
      setErrors(errors => ({...errors, email: '중복된 이메일입니다.'})); //중복됨
		}
	} 

  return (
    <div className={classes.container}>
      <button className={classes.duplicateCheckButton} onClick={CheckDuplicate}>
        <h2>이메일 중복확인</h2>
      </button>
    </div>
    
  )
}

export default EmailDuplicateCheck;