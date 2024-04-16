import { Field, ID, ObjectType } from '@nestjs/graphql';
import { PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
export default class BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
