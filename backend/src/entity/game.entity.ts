import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { GameType } from './common.enum';

@Entity()
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @Column()
  interruptMode: boolean;

  @Column()
  privateMode: boolean;

  @Column()
  password: string;

  @BeforeInsert()
  @BeforeUpdate()
  async setPassword(password: string) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(password || this.password, salt);
  }

  @Column()
  count: number;

  @Column()
  type: GameType;

  @Column()
  playing: boolean;

  @OneToMany(() => User, (user) => user.playGame, { cascade: true })
  players: User[];

  @OneToMany(() => User, (user) => user.watchGame, { cascade: true })
  watchers: User[];
}
