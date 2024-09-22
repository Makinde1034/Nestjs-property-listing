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
  },
  {
    name: 'Advanced',
    coverageRadius: '70',
    impression: '5000',
    price: 400,
    duration: '14',
  },
  {
    name: 'Premium',
    coverageRadius: '120',
    impression: '7000',
    price: 800,
    duration: '30',
  },
];
