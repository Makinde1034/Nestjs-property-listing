/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CityEntitity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  city: string;

  @Column()
  lat: string;

  @Column()
  lng: string;

  @Column()
  country: string;

  @Column()
  iso2: string;

  @Column()
  admin_name: string;
}
