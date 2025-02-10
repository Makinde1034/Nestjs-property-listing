import { Logger } from '@nestjs/common';
import { Permission, Role, User } from 'src/entities';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { roleFactory } from '../factories/role.factory';

export class RoleSeeder implements Seeder {
  private readonly logger = new Logger(RoleSeeder.name);

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    this.logger.debug(`Starting seeding for: ${RoleSeeder.name}`);

    const userRepository = dataSource.getRepository(User);
    const permissionRepository = dataSource.getRepository(Permission);
    const roleRepository = dataSource.getRepository(Role);

    const [permissions, users] = await Promise.all([
      permissionRepository.find(),
      userRepository.find({ where: { userType: 'admin' } }),
    ]);

    if (!permissions || permissions.length === 0) {
      this.logger.warn('No permissions found in the database.');
      return;
    }

    if (!users || users.length === 0) {
      this.logger.warn('No admin users found in the database.');
      return;
    }

    const existingRoles = await roleRepository.find();

    if (existingRoles.length > 0) {
      this.logger.debug('Roles already exist, skipping seeding.');
      return;
    }

    const permissionIds = permissions.map((permission) => ({
      id: permission.id,
    }));
    this.logger.debug(`Permissions fetched: ${permissions.length}`);

    this.logger.debug(`Admin users fetched: ${users.length}`);

    const newRole = {
      ...roleFactory[0],
      permissions: permissionIds,
      user: users,
    };
    await roleRepository.save([newRole]);

    this.logger.debug(`Seeding for: ${RoleSeeder.name} completed.`);
  }
}
