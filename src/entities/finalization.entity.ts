import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import BaseEntity from './base.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { Offer } from './offer.entity';

@Entity()
@ObjectType()
export class Finalization extends BaseEntity {
  @Column()
  @Field()
  sellerZatca: string;

  @Column()
  @Field()
  sellerIban: string;

  @Column()
  @Field()
  sellerBirthDate: string;

  @Column()
  @Field()
  ownershipAmmount: number;
  @Column()
  @Field()
  zatca: string;

  @Column()
  @Field()
  buyerIban: string;

  @Column()
  @Field()
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
