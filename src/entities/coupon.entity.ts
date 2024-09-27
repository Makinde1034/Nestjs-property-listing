import { Field } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Coupon {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  code: string;

  @Field()
  @Column()
  maxUse: number;

  @Field()
  @Column()
  discountType: string;

  @Field()
  @Column()
  discoutValue: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @Column()
  startDate: Date;

  @Field()
  @Column()
  endDate: Date;

  @Field()
  @DeleteDateColumn()
  deletedAt: string;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
