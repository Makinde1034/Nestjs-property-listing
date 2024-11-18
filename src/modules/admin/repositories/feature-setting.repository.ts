import { DataSource, Repository } from 'typeorm';
import { SystemFeatureSetting } from '../../../entities/system-features.entity';
import { Injectable } from '@nestjs/common';
@Injectable()
export class SettingFeatureRepository extends Repository<SystemFeatureSetting> {
  constructor(private readonly dataSource: DataSource) {
    super(SystemFeatureSetting, dataSource.createEntityManager());
  }
}
