import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { WebsocketContext } from "../pages/WrapMainPage";
import {
  currentGameInfoState,
  gameCountState,
  gameStartCountState,
  gameStartState,
  rankGameFlagState,
} from "./atom";

const useInitHook = () => {
  const currentGame = useRecoilValue(currentGameInfoState);
  const location = useLocation();
  const socket = useContext(WebsocketContext);
  const setCount = useSetRecoilState(gameCountState);
  const setStart = useSetRecoilState(gameStartState);
  const setStartCount = useSetRecoilState(gameStartCountState);
  const setRankGameFlag = useSetRecoilState(rankGameFlagState);
  useEffect(() => {
    if (location.pathname !== "/main/game" && currentGame) {
      if (sessionStorage.getItem("opponentLeavingWhileGame")) {
        sessionStorage.removeItem("opponentLeavingWhileGame");
      } else socket.emit("leave-game", currentGame.gameDto.title);
    }
    setCount(4);
    setStart(false);
    setStartCount(false);
    setRankGameFlag(false);
  }, [location]);
};

export default useInitHook;
