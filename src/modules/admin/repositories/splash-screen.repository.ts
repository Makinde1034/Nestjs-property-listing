import { DataSource, Repository } from 'typeorm';
import { SplashScreen } from '../../../entities/splash-screen.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SplashScreenRepository extends Repository<SplashScreen> {
  constructor(private datasource: DataSource) {
    super(SplashScreen, datasource.createEntityManager());
  }
}
