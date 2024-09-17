/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, Repository } from 'typeorm';
import { SplashScreen } from '../../../entities/splash-screen.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SplashScreenRepository extends Repository<SplashScreen> {
  constructor(private datasource: DataSource) {
    super(SplashScreen, datasource.createEntityManager());
  }
}
