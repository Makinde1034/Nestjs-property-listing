import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@ObjectType()
@Entity()
export class Article {
  @Field(() => Int, { description: 'id' })
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field()
  content: string;

  @Column()
  @Field()
  image: string;

  @Column()
  @Field()
  title: string;

  @Column()
  @Field()
  authorImage: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.article)
  user: User;

  @Column()
  @Field()
  authorBio: string;

  @Column()
  @Field()
  language: string;

  @Column({ default: false })
  @Field()
  published: string;

  @Column()
  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  @Field()
  @CreateDateColumn()
  deletedAt: Date;
}
