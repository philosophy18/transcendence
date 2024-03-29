import { GameDto } from 'src/dto/game.dto';
import { Game } from 'src/entity/game.entity';
import { User } from 'src/entity/user.entity';

export interface IGameRepository {
  createByGameDto(gameDto: GameDto, count: number);
  findAll();
  findByTitle(title: string);
  findByTitleWithJoin(title: string);
  findByPlayerWithJoin(player: User);
  findByWatcherWithJoin(watcher: User);
  updateCountById(id: number, count: number);
  updatePlaying(id: number, playing: boolean);
  deleteById(game: Game);
}
