import classes from './MyChatting.module.css';

interface MyChat{
  children : string;
}

const MyChatting : React.FC<MyChat> = ({children}) => {
  return (
    <div className={classes.my_speech_bubble}>
      {children}
    </div>
  )
}

export default MyChatting;