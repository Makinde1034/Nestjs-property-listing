/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DeepPartial } from 'typeorm';
import { AdPackage } from '../../entities/ad-package.entity';

export const AdPackageFactory: DeepPartial<AdPackage>[] = [
  {
    name: 'Basic',
    coverageRadius: '30',
    impression: '1000',
    price: 200,
    duration: '7',
    description: 'Basic package for starting a first time sell',
  },
  {
    name: 'Advanced',
    coverageRadius: '70',
    impression: '5000',
    price: 400,
    duration: '14',
    description: 'Bigger package for business starting individuals',
  },
  {
    name: 'Premium',
    coverageRadius: '120',
    impression: '7000',
    price: 800,
    duration: '30',
    description: 'Elite package for daily experts and partners',
  },
];
