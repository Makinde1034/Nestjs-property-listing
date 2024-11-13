import { Field } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';

@Entity()
export class NotificationToken extends BaseEntity {
  @Field()
  @Column()
  userId: string;

  @Field()
  @Column()
  deviceType: string;

  @Field()
  @Column()
  token: string;

  @Field()
  @Column()
  status: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @DeleteDateColumn()
  deletedAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
