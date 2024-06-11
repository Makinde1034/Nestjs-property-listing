import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { Amenities } from '../entities/amenities.entity';
import { Logger } from '@nestjs/common';
import { amenitiesData } from './factories/amenities.factory';

export class AmenitiesSeeders implements Seeder {
  track = false;
  private logger = new Logger(AmenitiesSeeders.name);

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    this.logger.debug(`Seeding for: ${AmenitiesSeeders.name}...`);

    const repository = dataSource.getRepository(Amenities);
    const existingAmenities = await repository.find();

    if (existingAmenities.length > 0) {
      this.logger.debug(
        `Seeding for:${AmenitiesSeeders.name} already completed`,
      );
    } else {
      await repository.save(amenitiesData);
      this.logger.debug(`Seeding for: ${AmenitiesSeeders.name} completed`);
    }
  }
}
