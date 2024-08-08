import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { Chat } from './chat.entity';
import { User } from './user.entity';
import { ObjectType } from '@nestjs/graphql';
@Entity()
@ObjectType()
export class Messages extends BaseEntity {
  @ManyToOne(() => Chat, (chat) => chat.message)
  chat: Chat;

  @ManyToOne(() => User, (user) => user.messages)
  user: User;

  @Column()
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
