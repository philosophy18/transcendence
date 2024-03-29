import { GameType } from 'src/entity/common.enum';
import { User } from 'src/entity/user.entity';

export interface IRecordRepository {
  addRecord(gameType: GameType, player: User, opponent: string, win: boolean);
  findAll();
  findByUserIdWithJoin(user: User);
  findByIdWithJoin(id: number);
}
