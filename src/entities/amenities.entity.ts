import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Field, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class Amenities {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  @Field({ nullable: true })
  name: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  image: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  description: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
