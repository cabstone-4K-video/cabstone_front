import classes from './OtherChatting.module.css';

interface OtherChat{
  children : string;
}

const MyChatting : React.FC<OtherChat> = ({children}) => {
  return (
    <div className={classes.my_speech_bubble}>
      {children}
    </div>
  )
}

export default MyChatting;