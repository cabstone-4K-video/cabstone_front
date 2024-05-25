import classes from './OtherChatting.module.css';

interface OtherChat{
  children : string;
}

const OtherChatting : React.FC<OtherChat> = ({children}) => {
  return (
    <div className={classes.other_speech_bubble}>
      {children}
    </div>
  )
}

export default OtherChatting;