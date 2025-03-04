import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import BaseEntity from './base.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { Offer } from './offer.entity';

@Entity()
@ObjectType()
export class Finalization extends BaseEntity {
  @Column({ nullable: true })
  @Field({ nullable: true })
  sellerZatca: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  sellerIban: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  sellerBirthDate: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  ownershipAmmount: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  buyerZatca: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  buyerIban: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  buyerBirthDate: string;

  @Field(() => Offer, { nullable: true })
  @JoinColumn({ name: 'offerId' })
  @OneToOne(() => Offer, (offer) => offer.finalization, { eager: true })
  offer: Offer;

  @Column()
  @Field()
  offerId: string;

  @Column()
  @Field()
  status: string;
}
