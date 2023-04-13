import { Inject, Injectable } from '@nestjs/common';
import { Friend } from 'src/entity/friend.entity';
import { Users } from 'src/entity/user.entity';
import { IFriendRepository } from 'src/friend/repository/friend.interface.repository';
import { IUserRepository } from 'src/user/repository/users.interface.repository';

@Injectable()
export class FriendService {
  constructor(
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
    @Inject('IFriendRepository')
    private friendRepository: IFriendRepository,
  ) {}

  async requestFriend(user: Users, friend: Users) {
    const user_req = await this.friendRepository.findAll(user);
    const friend_req = await this.friendRepository.findAll(friend);
    if (user_req || friend_req)
      return { success: false, data: '이미 친구 신청을 보냈습니다.' };
    await this.friendRepository.addFriend(user, friend.intra_id);
    return { success: true, data: null };
  }

  async acceptFriend(user: Users, friend: Users) {
    const requests = await this.friendRepository.findFriendRequests(user);
    const req = requests.find((name) => name.friendname === friend.intra_id);
    if (!req)
      return {
        success: false,
        data: '친구 신청이 없거나 이미 처리되었습니다.',
      };
    await this.friendRepository.updateAccept(req.id, true);
    return { success: true, data: null };
  }

  async getFriendList(user: Users) {
    const friends = await this.friendRepository.findFriends(user);
    const result = friends.map(async (friend: any) => {
      await this.userRepository.findByIntraId(friend.friendname);
    });
    await Promise.all(result);
    return result;
  }

  async getFriendRequestList(user: Users) {
    const send = await this.friendRepository.findFriendRequests(user);
    const receive = await this.friendRepository.findFriendRequested(
      user.intra_id,
    );
    return { send: send, receive: receive };
  }
}
