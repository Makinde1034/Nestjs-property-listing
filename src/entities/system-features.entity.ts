import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  UpdateDateColumn,
} from 'typeorm';
import BaseEntity from './base.entity';
import { Field } from '@nestjs/graphql';

@Entity()
export class SystemFeatureSetting extends BaseEntity {
  @Field()
  @Column()
  englishName: string;

  @Field()
  @Column()
  arabicName: string;

  @Field()
  @Column()
  slug: string;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @Column()
  description: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @DeleteDateColumn()
  deleteAt: Date;
}
