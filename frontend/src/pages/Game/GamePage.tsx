import styled from "@emotion/styled";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  currentGameUsersState,
  currentGameInfoState,
  myNameState,
  currentChatState,
  joinnedChatState,
  gameListState,
  inviteModalToggleState,
  gameStartState,
  gameStartCountState,
  gameCountState,
  alertModalState,
  myInfoState,
  rankGameFlagState,
  stopFlagState,
} from "../../api/atom";
import { WebsocketContext } from "../../pages/WrapMainPage";
import ChatBox from "../../components/Chat/ChatBox";
import CurrentUserInfo from "../../components/CurrentUserInfo";
import PongGame from "./PongGame";
import WaitRoom from "./WaitRoom";
import { UserDto } from "../../api/interface";

const GamePage = () => {
  const [startCount, setStartCount] = useRecoilState(gameStartCountState);
  const [start, setStart] = useRecoilState(gameStartState);
  const [gameInfo, setGameInfo] = useRecoilState(currentGameInfoState);
  const usersInfo = useRecoilValue(currentGameUsersState);
  const myName = useRecoilValue(myNameState);
  const socket = useContext(WebsocketContext);
  const [msg, setMsg] = useState("");
  const [myInfo, setMyInfo] = useRecoilState(myInfoState);
  const [obstaclePos, setObstaclePos] = useState([0, 0]);
  const [joinnedChatList, setJoinnedChatList] =
    useRecoilState(joinnedChatState);
  const currentChat = useRecoilValue(currentChatState);
  const [count, setCount] = useRecoilState(gameCountState);
  const gameList = useRecoilValue(gameListState);
  const [rankGameFlag, setRankGameFlag] = useRecoilState(rankGameFlagState);
  const navigate = useNavigate();
  const setAlertInfo = useSetRecoilState(alertModalState);
  const [stopFlag, setStopFlag] = useRecoilState(stopFlagState);
  const setInviteModalToggle = useSetRecoilState(inviteModalToggleState);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setMsg(e.target.value);

  const onSend = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && msg) {
      setJoinnedChatList({
        ...joinnedChatList,
        [currentChat]: {
          ...joinnedChatList[currentChat],
          chatLogs: [
            ...joinnedChatList[currentChat].chatLogs,
            {
              sender: myName,
              msg,
              time: new Date(),
            },
          ],
        },
      });
      socket.emit("message", {
        roomName: gameInfo.gameDto.title,
        userName: myName,
        message: msg,
      });
      setMsg("");
    }
  };

  const clickStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.currentTarget.classList.contains("notActive")) {
      return;
    }
    if (!gameInfo.opponentDto) {
      return;
    }
    setStartCount(() => true);
    setCount((prev) => prev - 1);
    socket.emit("start-game", {
      roomName: gameInfo.gameDto.title,
      userName: gameInfo.opponentDto.userName,
    });
    if (gameInfo.gameDto.interruptMode) {
      const leftPos = Math.floor(Math.random() * 30) / 100;
      const rightPos = (Math.floor(Math.random() * 30) + 50) / 100;
      setObstaclePos([leftPos, rightPos]);
      socket.emit("obstacle-info", {
        roomName: gameInfo.gameDto.title,
        obstaclePos: [leftPos, rightPos],
      });
    }
  };

  const openInviteModal = () => {
    setInviteModalToggle({ type: "game", toggle: true });
  };

  const handleExit = () => {
    navigate("/main/lobby");
  };

  const handleRefresh = (e: any) => {
    if (start || startCount) {
      const info = {
        roomName: gameInfo.gameDto.title,
        userName:
          gameInfo.ownerDto.userName === myName
            ? gameInfo.opponentDto.userName
            : gameInfo.ownerDto.userName,
        type: gameInfo.gameDto.type,
      };
      sessionStorage.setItem("refreshWhilePlaying", JSON.stringify(info));
    }
  };

  useEffect(() => {
    if (!gameInfo) {
      navigate(-1);
    }
    //if (sessionStorage.getItem("refreshWhilePlaying")) {
    //  const { userName, roomName, type } = JSON.parse(
    //    sessionStorage.getItem("refreshWhilePlaying")
    //  );
    //  socket.emit("end-game", {
    //    userName,
    //    roomName: roomName,
    //  });
    //}
    let timer: NodeJS.Timeout | undefined;
    if (count === 0) {
      setStartCount(false);
      setStart(true);
      setCount(4);
    }
    if (startCount) {
      timer = setTimeout(() => setCount(count - 1), 1000);
    }
    if (!rankGameFlag && gameInfo && gameInfo.gameDto.type) {
      if (myName === gameInfo.ownerDto.userName)
        socket.emit("start-game", {
          roomName: gameInfo.gameDto.title,
          userName: gameInfo.opponentDto.userName,
        });
      setRankGameFlag(true);
      setStartCount(true);
      setCount(count - 1);
      setStopFlag(false);
    }
    if (gameInfo && gameInfo.gameDto.type === 0) {
      socket.on("start-game", () => {
        setStartCount(() => true);
        setCount((prev) => prev - 1);
      });
    }

    socket.on("obstacle-info", ([leftPos, rightPos]: Array<number>) => {
      setObstaclePos([leftPos, rightPos]);
    });
    socket.on(
      "user-leave-game",
      ({
        userInfo,
        roomName,
        type,
      }: {
        userInfo: UserDto;
        roomName: string;
        type: number;
      }) => {
        if (userInfo.userName === myName) {
        } else {
          if (
            (start || startCount) &&
            gameInfo.opponentDto &&
            gameInfo.opponentDto.userName === userInfo.userName
          ) {
            setStartCount(() => false);
            setCount(() => 4);
            setGameInfo({
              ...gameInfo,
              opponentDto: null,
            });
          }
        }
      }
    );

    window.addEventListener("beforeunload", handleRefresh);

    return () => {
      socket.off("start-game");
      socket.off("obstacle-info");
      if (timer) clearInterval(timer);
      window.removeEventListener("beforeunload", handleRefresh);
    };
  }, [gameList, gameInfo, start, startCount, count, rankGameFlag, myInfo]);
  return (
    gameInfo && (
      <GamePageContainer>
        <GameContainer>
          <h1>{gameInfo.gameDto.type ? "랭크 게임" : "일반 게임"}</h1>
          <h2>{gameInfo && gameInfo.gameDto.title}</h2>
          {!start && <WaitRoom count={count} />}
          {start && (
            <PongGame
              roomName={gameInfo && gameInfo.gameDto.title}
              isOwner={gameInfo.ownerDto.userName === myName}
              owner={gameInfo.ownerDto.userName}
              opponent={gameInfo.opponentDto?.userName || ""}
              type="normal"
              hard={gameInfo.gameDto.interruptMode}
              obstaclePos={obstaclePos}
            />
          )}
        </GameContainer>
        <SubContainer>
          <Options>
            {" "}
            <Button
              className={
                myName === gameInfo.ownerDto.userName ? "active" : "notActive"
              }
              onClick={clickStart}
            >
              시작하기
            </Button>
            {gameInfo.ownerDto.userName === myName && (
              <Button onClick={openInviteModal} className="active">
                초대하기
              </Button>
            )}
            <Button className="active" onClick={handleExit}>
              나가기
            </Button>
          </Options>
          <CurrentUserInfo
            data={usersInfo}
            title={gameInfo.gameDto.title}
            owner={false}
            admins={[]}
          />
          <ChatBox
            onSend={onSend}
            onChange={onChange}
            msg={msg}
            height={350}
            myName={myName}
          />
        </SubContainer>
      </GamePageContainer>
    )
  );
};

const Button = styled.div`
  border-radius: 5px;
  padding: 5px 10px;
  margin: 0 10px;
  &.active {
    border: 1px solid white;
    cursor: pointer;
  }
  &.notActive {
    border: 1px solid var(--gray-color);
    color: var(--gray-color);
    cursor: not-allowed;
  }
`;

const Options = styled.div`
  width: 100%;
  height: 60px;
  background: var(--sub-bg-color);
  border-radius: 10px;
  margin-bottom: 95px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const GameBox = styled.div`
  width: 530px;
  height: 510px;
  background: var(--sub-bg-color);
  border-radius: 20px;
  margin: 0 auto;
`;

const GameContainer = styled.div`
  width: 550px;
  height: 100%;
  margin: 0 25px;
  & > h1,
  h2 {
    margin-left: 30px;
    height: 45px;
    color: white;
  }
`;

const SubContainer = styled.div`
  width: 300px;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
`;

const GamePageContainer = styled.div`
  height: 95%;
  display: flex;
  color: white;
  width: 90%;
`;

export default GamePage;
