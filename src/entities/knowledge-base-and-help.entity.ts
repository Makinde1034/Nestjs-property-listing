import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class KnowledgeBaseAndHelp {
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
