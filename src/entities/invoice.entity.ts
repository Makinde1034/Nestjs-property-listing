import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { int } from 'aws-sdk/clients/datapipeline';

@Entity()
@ObjectType()
export class Invoice {
  @PrimaryGeneratedColumn()
  @Field()
  id: int;

  @Column('decimal', { precision: 10, scale: 2 })
  @Field()
  price: number;

  @Column()
  @Field()
  userId: string;

  @Column()
  @Field()
  listingid: string;
  @Column()
  @Field()
  @CreateDateColumn()
  expireAt: Date;

  @Column()
  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
