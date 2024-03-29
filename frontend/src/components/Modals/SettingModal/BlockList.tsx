import styled from "@emotion/styled";
import { useContext, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  blockUserListState,
  requestBlockUserListFlagState,
} from "../../../api/atom";
import { WebsocketContext } from "../../../pages/WrapMainPage";

const BlockList = () => {
  const socket = useContext(WebsocketContext);
  const blockList = useRecoilValue(blockUserListState);

  const clickUnblockUser = (userName: string) => {
    socket.emit("block-cancel", userName);
  };
  return (
    <BlockListContainer>
      <h1>차단 목록</h1>
      <BlockedUsers>
        {blockList.map((name) => (
          <BlockedUser key={name}>
            <Name>{name}</Name>
            <Button onClick={() => clickUnblockUser(name)}>해제</Button>
          </BlockedUser>
        ))}
      </BlockedUsers>
    </BlockListContainer>
  );
};

const Name = styled.div`
  margin-left: 15px;
`;

const Button = styled.div`
  margin-right: 15px;
  color: var(--dark-bg-color);
  background: white;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
`;

const BlockedUser = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 95%;
  height: 50px;
  background: var(--dark-bg-color);
  margin: 10px auto;
  border-radius: 10px;
`;

const BlockedUsers = styled.div`
  width: 80%;
  height: 200px;
  background: var(--sub-bg-color);
  border-radius: 10px;
  margin-top: 25px;
  overflow-y: auto;
  &::-webkit-scrollbar {
    border-radius: 10px;
    width: 10px;
  }
  &::-webkit-scrollbar-track {
    background: white;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--gray-color);
    width: 2px;
    border-radius: 10px;
  }
`;

const BlockListContainer = styled.div`
  width: 100%;
  height: 60%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  & > h1 {
    width: 80%;
  }
`;

export default BlockList;
