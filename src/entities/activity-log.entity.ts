import { Field, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  Column,
  ManyToOne,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { User } from './user.entity';

@Entity()
@ObjectType()
export class ActivityLog extends BaseEntity {
  @Field(() => User, { nullable: true })
  @JoinTable({ name: 'userId' })
  @ManyToOne(() => User, (user) => user.activityLogs)
  user: User;

  @Field()
  @Column({ nullable: true })
  userId: string;

  @Column()
  @Field()
  action: string;

  @Column()
  @Field()
  scopeId: string;

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => String)
  details: Record<string, any>;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
