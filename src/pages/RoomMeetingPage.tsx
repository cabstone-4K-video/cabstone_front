import RoomMeeting from "../components/RoomMeeting/RoomMeeting";
import ScreenShare from "../components/RoomMeeting/ScreenShare/ScreenShare";

const RoomMeetingPage : React.FC = () => {
  return (
    <>
      <ScreenShare/>
      <RoomMeeting/>
    </>
  )
}

export default RoomMeetingPage;