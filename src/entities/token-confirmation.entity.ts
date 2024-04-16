import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { User } from './user.entity';

@Entity()
@ObjectType()
export class TokenConfirmation extends BaseEntity {
  @Field(() => User)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Field()
  @Column()
  token: string;

  @Field()
  @Column()
  expiredAt: Date;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
