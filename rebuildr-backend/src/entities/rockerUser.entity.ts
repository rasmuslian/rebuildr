import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum RockerUserType {
  FOREIGN_USER = 'FOREIGN_USER',
  AUTHENTICATED_USER = 'AUTHENTICATED_USER',
}
@Entity()
export class RockerUser {
  @PrimaryColumn({ unique: true })
  id: string; //id used in Rocker

  @Column()
  userId: string; //foreignUserId in Rocker

  @OneToOne(() => User, (u) => u.rockerUser)
  @JoinColumn()
  user: User;

  @Column('enum', {
    enum: RockerUserType,
    default: RockerUserType.FOREIGN_USER,
  })
  type: RockerUserType;

  @CreateDateColumn()
  createdAt: Date;
}
