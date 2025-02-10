/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { DataSource, DeepPartial, In } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

import { Logger } from '@nestjs/common';
import { Attribute } from '../../entities/attribute.entity';
import { AttributeFactory } from '../factories/attributes.factory';
import { AttributeSet, ListingType } from '../../entities';
import { AttributSetFactory } from '../factories/attribute-set';
import { listingTypeFactory } from '../factories/listing-type.factory';

export class AttributeSeeder implements Seeder {
  track = false;
  private logger = new Logger(AttributeSeeder.name);

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    this.logger.debug(`Seeding For: ${Attribute.name}...`);

    const listingTypes = ['Farm', 'Building', 'Villa', 'Apartment'];
    const attributeGroup = {
      Building: ['Wifi', 'Pets allowed', 'Building No', 'Area'],
      Villa: [
        'BBQ area',
        'Wifi',
        'Number of Bathrooms',
        'Number of Storeys',
        'Pool',
        'Outdoor kitchen',
        'Garden',
        'Guest house',
        'Tennis court',
        'Basketball court',
        'Jacuzzi',
        'Maids room',
        'Pets allowed',
        'Balcony',
        'Gym',
        'Playground',
        'Security',
        'Air conditioning',
        'Storage room',
        'Laundry room',
        'Conference room',
        'Gated community',
        'Covered parking',
        'Number of Rooms',
        'Parking',
        'Area',
        'Indoor play area',
      ],
      Farm: ['Area', 'District', 'Street', 'Country', 'City'],
      Apartment: [
        'Parking',
        'Indoor play area',
        'Wifi',
        'Level',
        'Pool',
        'Outdoor kitchen',
        'Garden',
        'Guest house',
        'Tennis court',
        'Basketball court',
        'Jacuzzi',
        'Maids room',
        'Gym',
        'Playground',
        'Security',
        'Air conditioning',
        'Storage room',
        'Laundry room',
        'Conference room',
        'Gated community',
        'Covered parking',
        'Number of Rooms',
        'Building No',
        'Apartment Number',
        'Number of Bathrooms',
        'Area',
        'BBQ area',
      ],
    };

    const attributeRepository = dataSource.getRepository(Attribute);
    const allAttributes = await attributeRepository.find();

    if (allAttributes.length > 0) {
      this.logger.debug(`Seeding for: ${Attribute.name} Already completed`);
      return;
    }

    await attributeRepository.save(AttributeFactory as Partial<Attribute>);
    this.logger.debug(`Seeding for: ${Attribute.name} finished`);

    // Process AttributeSets
    const attributeSetToSave: DeepPartial<AttributeSet>[] = [];

    for (const value of AttributSetFactory) {
      let attributeIds: Attribute[] = []; // Store full Attribute objects

      for (const element of listingTypes) {
        if (value.englishName === element) {
          const attributes = await attributeRepository.find({
            where: { englishName: In(attributeGroup[element]) },
          });

          attributeIds.push(...attributes); // Store full objects
        }
      }

      attributeSetToSave.push({
        ...value,
        attributes: attributeIds, // Store full objects instead of IDs
      });
    }

    const attributeSetRepository = dataSource.getRepository(AttributeSet);
    const attributeSet = await attributeSetRepository.save(attributeSetToSave);

    // Process ListingTypes
    const listingType: DeepPartial<ListingType>[] = listingTypeFactory.map(
      (value) => {
        const attributeSetToSave = attributeSet.filter(
          (element) => value.englishName === element.englishName,
        );

        return {
          ...value,
          attributeSets: attributeSetToSave, // Store full AttributeSet objects
        };
      },
    );

    const listingTypeRepository = dataSource.getRepository(ListingType);
    await listingTypeRepository.save(listingType);

    this.logger.debug(`Seeding for: ${Attribute.name} finished`);
  }
}
