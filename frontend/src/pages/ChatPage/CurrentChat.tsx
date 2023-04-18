import styled from "@emotion/styled";
import { useContext, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { chatDBState, myNameState } from "../../api/atom";
import { IChatLog, JoinnedUserDto } from "../../api/interface";
import { WebsocketContext } from "../../api/WebsocketContext";
import ChatBox from "../../components/Chat/ChatBox";
import CurrentUserInfo from "../../components/CurrentUserInfo";

const CurrentChat = ({
  roomName,
  data,
  operator,
  clickOperatorButton,
  myName,
}: {
  roomName: string;
  data: JoinnedUserDto[];
  operator: boolean;
  clickOperatorButton: Function;
  myName: string;
}) => {
  const socket = useContext(WebsocketContext);
  const [msg, setMsg] = useState("");
  const [chatDB, setChatDB] = useRecoilState(chatDBState);

  useEffect(() => {
    socket.on("message", ({ userName, message }) => {
      console.log(userName, message);
      setChatDB({
        ...chatDB,
        [roomName]: [
          ...chatDB[roomName],
          { sender: userName, msg: message, time: new Date() },
        ],
      });
    });

    return () => {
      socket.off("message");
      socket.off("user-list");
    };
  }, [chatDB]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setMsg(e.target.value);

  const onSend = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && msg) {
      setChatDB({
        ...chatDB,
        [roomName]: [
          ...chatDB[roomName],
          { sender: myName, msg, time: new Date() },
        ],
      });
      socket.emit("message", {
        roomName,
        userName: myName,
        message: msg,
      });
      setMsg("");
    }
  };

  return (
    <CurrentChatContainer>
      <CurrentUserInfo
        data={data}
        title={roomName.slice(1)}
        operator={operator}
        clickOperatorButton={clickOperatorButton}
      />
      <ChatBox
        height={340}
        data={chatDB[roomName]}
        myName={myName}
        onChange={onChange}
        onSend={onSend}
        msg={msg}
      />
    </CurrentChatContainer>
  );
};

const CurrentChatContainer = styled.div`
  width: 100%;
  height: 510px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: 0.5s;
  flex-direction: column;
  color: white;
`;

export default CurrentChat;
