import axios from "axios";
import classes from './EmailDuplicate.module.css';

interface EmailProp{
  email : string;
  setIsEmailDuplicated : (e : boolean) => void;
}

const EmailDuplicateCheck:React.FC<EmailProp> = ({ email, setIsEmailDuplicated }) => {

  const CheckDuplicate = async(event : React.FormEvent) => {
		event.preventDefault();

		const body = JSON.stringify({ email });
    console.log(body);
    
		try{
			const response = await axios.post('endpoint_url', body, {
				headers : {
					'Content-Type' : 'application/json',
				}
			});
			
      if(response){
        console.log('response good');
        setIsEmailDuplicated(true);
        
      }
		}
		catch(error){
			console.error("Error occured!");
		}
	} //이메일 중복여부를 백엔드에 보내서 판단하는 함수

  return (
    <div className={classes.container}>
      <button className={classes.duplicateCheckButton} onClick={CheckDuplicate}>
        <h2>이메일 중복확인</h2>
      </button>
    </div>
    
  )
}

export default EmailDuplicateCheck;