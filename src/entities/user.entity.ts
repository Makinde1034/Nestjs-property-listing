import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { UserProfileType } from '../common/types';
import { Company } from './company.entity';

@Entity()
@ObjectType()
export class User extends BaseEntity {
  @Column()
  @Field()
  userType: UserProfileType;

  @Column()
  @Field()
  firstName: string;

  @Column()
  @Field()
  lastName: string;

  @Column({ unique: true })
  @Field()
  email: string;

  @Column({ unique: true })
  @Field()
  phone: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  verifiedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  biometricKey: string;

  @Field(() => Company, { nullable: true })
  @OneToOne(() => Company, (company) => company.user, {
    cascade: true,
    eager: true,
  })
  company?: Company;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @DeleteDateColumn()
  deletedAt: Date;
}
