import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class WorkFlow extends BaseEntity {
  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  document: string;

  @Column({ default: true })
  @Field()
  isActive: boolean;

  @Column()
  @Field()
  numberOfApproval: number;

  @Column({ type: 'simple-array' })
  @Field(() => [String])
  approvalOneRole: string[];

  @Column({ type: 'simple-array' })
  @Field(() => [String])
  approvalTwoRole: string[];

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
