import { User } from 'src/entities';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { SuperAdminData } from '../factories/admin.factory';
import { Logger } from '@nestjs/common';

export class SuperAdmin1713821793722 implements Seeder {
  track = false;
  private logger = new Logger(SuperAdmin1713821793722.name);
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    this.logger.debug(`Seeding For : ${User.name}....`, factoryManager);
    const repository = dataSource.getRepository(User);
    const hasAdmin = await repository.find({
      where: { email: SuperAdminData.email },
    });
    if (!hasAdmin) {
      await repository.save(SuperAdminData);
      this.logger.debug(`Seeding for: ${User.name} finished`);
    } else {
      this.logger.debug(`Seeding ${User.name}: not empty, skipping`);
    }
  }
}
