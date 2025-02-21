/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { Messages } from './message.entity';
import { User } from './user.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { Ticket } from './ticket.entity';

@Entity()
@ObjectType()
export class Chat extends BaseEntity {
  @Field(() => Messages, { nullable: true })
  @OneToMany(() => Messages, (message) => message.chat, { eager: true })
  message: Messages[];
  @ManyToOne(() => User, (user) => user.chat)
  user: User;

  @OneToOne(() => Ticket, (ticket) => ticket.chat, { nullable: true })
  @JoinColumn({ name: 'ticketId' })
  ticket: Ticket;

  @Column()
  ticketId: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  closedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
