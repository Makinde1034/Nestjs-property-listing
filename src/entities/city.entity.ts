/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class CityEntitity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Field()
  city: string;

  @Column()
  @Field()
  lat: string;

  @Column()
  @Field()
  lng: string;

  @Column()
  @Field()
  country: string;

  @Column()
  @Field()
  iso2: string;

  @Column({ nullable: true })
  @Field()
  arabic_name: string;

  @Column({ nullable: true })
  @Field()
  admin_name: string;
}
