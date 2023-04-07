import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  alertModalState,
  currentNormalGameInfoState,
  joinGameModalToggleState,
  modalBackToggleState,
  myInfoState,
  myNameState,
  normalJoinTypeState,
  rankWaitModalToggleState,
  selectedNormalGameTitleState,
} from "../../api/atom";
import { GameDto } from "../../api/interface";
import {
  axiosCreateGame,
  axiosGetGameList,
  axiosGetMyInfo,
  axiosJoinGame,
  axiosWatchGame,
} from "../../api/request";
import useInitHook from "../../api/useInitHook";
import { WebsocketContext } from "../../api/WebsocketContext";
import GameLobby from "./GameLobby";

const GameLobbyContainer = () => {
  const myName = useRecoilValue(myNameState);
  const setModalBack = useSetRecoilState(modalBackToggleState);
  const setRankWaitModal = useSetRecoilState(rankWaitModalToggleState);
  const setJoinGameModal = useSetRecoilState(joinGameModalToggleState);
  const setBackgroundModal = useSetRecoilState(modalBackToggleState);
  const setNormalJoinType = useSetRecoilState(normalJoinTypeState);
  const setSelectedNormalGameTitle = useSetRecoilState(
    selectedNormalGameTitleState
  );
  const setAlertInfo = useSetRecoilState(alertModalState);

  useInitHook();
  const [myInfo, setMyInfo] = useRecoilState(myInfoState);
  const setCurrentNormalGameInfoState = useSetRecoilState(
    currentNormalGameInfoState
  );
  const [gameList, setGameList] = useState<GameDto[]>([]);
  const navigator = useNavigate();
  const socket = useContext(WebsocketContext);

  const clickRankGame = () => {
    setModalBack(true);
    setRankWaitModal(true);
  };

  const clickJoin = async (title: string, private_mode: boolean) => {
    if (!private_mode) {
      try {
        const data = await axiosJoinGame(title, "");
        setCurrentNormalGameInfoState({ ...data });
        setNormalJoinType("join");
        navigator("/main/game/normal");
      } catch (e) {
        console.error(e);
        setAlertInfo({
          type: "failure",
          header: "게임 참가 실패",
          msg: "게임 참가에 실패 했습니다...",
          toggle: true,
        });
      }
      return;
    }
    setBackgroundModal(true);
    setJoinGameModal({ toggle: true, type: "join" });
    setSelectedNormalGameTitle(title);
  };

  const clickWatch = async (title: string, private_mode: boolean) => {
    if (!private_mode) {
      try {
        const data = await axiosWatchGame(title, "");
        console.log(data);
        setCurrentNormalGameInfoState({
          ...data,
        });
        setNormalJoinType("watch");
        navigator("/main/game/normal");
      } catch (e) {
        console.error(e);
        setAlertInfo({
          type: "failure",
          header: "게임 참가 실패",
          msg: "게임 참가에 실패 했습니다...",
          toggle: true,
        });
      }
      return;
    }
    setBackgroundModal(true);
    setJoinGameModal({ toggle: true, type: "watch" });
    setSelectedNormalGameTitle(title);
  };

  const onCreateRoom = async (e: React.FormEvent<HTMLFormElement | null>) => {
    e.preventDefault();

    if (e.currentTarget.type.checked && !e.currentTarget.password.value) {
      setAlertInfo({
        type: "failure",
        header: "방 생성 실패",
        msg: "비밀번호를 입력해주세요",
        toggle: true,
      });
      return;
    }

    try {
      const data = await axiosCreateGame(
        e.currentTarget.roomName.value || `${myName}의 일반 게임`,
        e.currentTarget.mode.checked,
        e.currentTarget.type.checked,
        e.currentTarget.password.value
      );
      setCurrentNormalGameInfoState({
        gameDto: data.gameDto,
        opponentDto: data.opponent,
        ownerDto: data.user,
        watchersDto: data.watchers ?? [],
      });
      navigator("/main/game/normal");
    } catch (e) {
      alert("게임생성실패");
      console.error(e);
    }
    e.currentTarget.mode.checked = false;
    e.currentTarget.type.checked = false;
    e.currentTarget.roomName.value = "";
    e.currentTarget.password.value = "";
  };

  useEffect(() => {
    async function getData() {
      const gameList = await axiosGetGameList();
      const myInfo = await axiosGetMyInfo();
      setMyInfo(myInfo);
      setGameList(gameList);
      console.log(gameList);
    }
    getData();
  }, []);

  return (
    <GameLobby
      data={gameList}
      myName={myName}
      onCreateRoom={onCreateRoom}
      clickRankGame={clickRankGame}
      clickJoin={clickJoin}
      clickWatch={clickWatch}
    />
  );
};

function createDummyData(): GameDto[] {
  let list = [];

  for (let i = 0; i < 20; i++) {
    let ran = Math.floor(Math.random() * 2);
    list.push({
      private_mode: ran ? true : false,
      title: `열심히 하겠습니다. 한수 알려주시면 감사하겠습니다 선생님, 당장 옥상으로 올라오시죠 ${
        i + 1
      }`,
      interrupt_mode: ran ? true : false,
      cur: ran ? 1 : 2,
    });
  }
  return list;
}

export default GameLobbyContainer;
