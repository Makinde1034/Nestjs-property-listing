import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import BaseEntity from './base.entity';
import { User } from './user.entity';

@Entity()
@ObjectType()
export class Company extends BaseEntity {
  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  vatNumber: string;

  @Column()
  @Field()
  crNumber: string;

  @Field(() => User)
  @OneToOne(() => User, (user) => user.company, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
