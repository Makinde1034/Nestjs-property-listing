import { ObjectType, Field } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AdPackage } from './ad-package.entity';
import { Listing } from './listing.entity';

@Entity()
@ObjectType()
export class Promotion {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  listingId: string;

  @Field()
  @Column()
  impressions: number;

  @Field(() => AdPackage)
  @OneToOne(() => AdPackage, (adPackage) => adPackage.promotion)
  @JoinColumn()
  adPackage: AdPackage;

  @Field(() => Listing)
  @ManyToOne(() => Listing, (listing) => listing.promotion)
  listing: Listing;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
