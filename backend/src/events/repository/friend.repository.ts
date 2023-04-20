import { InjectRepository } from '@nestjs/typeorm';
import { FriendDto } from 'src/dto/friend.dto';
import { FriendReqType } from 'src/entity/common.enum';
import { Friend } from 'src/entity/friend.entity';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { IFriendRepository } from './friend.interface.repository';

export class FriendRepository implements IFriendRepository {
  constructor(
    @InjectRepository(Friend)
    private friendRepository: Repository<Friend>,
  ) {}

  userToFriendDto(user: User, time: Date, type: FriendReqType) {
    const friendDto: FriendDto = {
      intra_id: user.intra_id,
      profile: user.profile,
      time: time,
      type: type,
    };
    return friendDto;
  }

  async addFriend(user: User, friend: User, accept: boolean) {
    await this.friendRepository.save({
      user: user,
      friendname: friend.intra_id,
      friendProfile: friend.profile,
      accept: accept,
      time: new Date(Date.now()),
    });
  }

  // testcode -> TODO: delete
  async addDummyFriend(user: User, friendname: string) {
    await this.friendRepository.save({
      user: user,
      friendname: friendname,
      friendProfile: '',
      accept: true,
      time: new Date(Date.now()),
    });
  }

  async findAll(user: User) {
    return await this.friendRepository.find({
      where: { user: { id: user.id } },
    });
  }

  async findAllWithJoin(user: User) {
    return await this.friendRepository.find({
      where: { user: { id: user.id } },
      relations: ['user'],
    });
  }

  async findFriends(user: User) {
    return await this.friendRepository.find({
      where: { user: { id: user.id }, accept: true },
    });
  }

  async findFriendsWithJoin(user: User) {
    return await this.friendRepository.find({
      where: { user: { id: user.id }, accept: true },
      relations: ['user'],
    });
  }

  async findFriendRequested(username: string) {
    return await this.friendRepository.find({
      where: { friendname: username, accept: false },
    });
  }

  async findFriendRequestedWithJoin(username: string) {
    return await this.friendRepository.find({
      where: { friendname: username, accept: false },
      relations: ['user'],
    });
  }

  async updateAccept(id: number, accept: boolean) {
    await this.friendRepository.update(id, { accept: accept });
  }

  async deleteFriend(friend: Friend) {
    await this.friendRepository.remove(friend);
  }
}