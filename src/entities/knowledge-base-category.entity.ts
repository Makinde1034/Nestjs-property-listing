import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class KnowledgeBaseCategory {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;
  @Column()
  @Field()
  placement: string;

  @Column()
  @Field()
  arabicName: string;

  @Column()
  @Field()
  englishName: string;

  @Column()
  @Field()
  language: string;

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
