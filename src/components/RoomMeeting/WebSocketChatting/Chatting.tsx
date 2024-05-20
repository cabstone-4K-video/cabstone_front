import classes from './Chatting.module.css';
import MyChatting from './MyChatting/MyChatting';
import OtherChatting from './OtherChatting/OtherChatting';

const Chatting : React.FC = () => {
  
  
  return (
    <div className={classes.chattingBox}>
      <MyChatting>내가 보냈다. 어쩔건데?</MyChatting>
      <OtherChatting>다른사람이 보냈다.</OtherChatting>
    </div>
  )
}

export default Chatting;