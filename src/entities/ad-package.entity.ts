import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Promotion } from './promotion.entity';

@ObjectType()
@Entity()
export class AdPackage {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  price: string;

  @Field()
  @Column()
  duration: string;

  @Field(() => Promotion)
  @OneToOne(() => Promotion, (promotion) => promotion.adPackage)
  promotion: Promotion;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
