import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  CreateServiceInput,
  CreateServiceProviderInput,
  DeleteServiceProvider,
  ServiceProviderInput,
  UpdateServiceInput,
  UpdateServiceProviderInput,
} from '../dto/service';

import { ServiceProviderRepository } from '../repository/service-provider.repository';
import { ServiceRepository } from '../repository/services.repository';
import { PaginateAndSort } from '../../../modules/core/dto/pagination-and-sort.dto';
import { ActivityLogService } from '../../../modules/activity-log/services/activity-log.service';
import { In } from 'typeorm';
import { ServiceProviderStatus } from '../../../common/enums/status.enum';
import { ServiceStatusRepository } from '../repository/service-status.repository';
import { User } from '../../../entities';
import { ActivityEnum } from '../../../common/enums/activitys';
import { SuccessResponse } from '../../../common/utils/success.response';
import { AppStrings } from '../../../common/messages/app.strings';

@Injectable()
export class ServiceAndProviderService {
  constructor(
    private readonly serviceProviderRepository: ServiceProviderRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly activityLogService: ActivityLogService,
    private readonly serviceStatusRepository: ServiceStatusRepository,
  ) {}

  logger = new Logger(ServiceAndProviderService.name);
  async createService(createServiceInput: CreateServiceInput) {
    try {
      const { pricing, ...rest } = createServiceInput;

      return await this.serviceRepository.save({
        ...rest,
        prcing: JSON.stringify(createServiceInput.pricing),
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async findAllServices(paginateAndSort: PaginateAndSort) {
    try {
      return await this.serviceRepository.find({
        take: paginateAndSort.take ?? 20,
        skip: paginateAndSort.skip ?? 0,
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async findOneService(id: string) {
    try {
      return await this.serviceRepository.findOneBy({ id });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  /**********************************
   * Create Service Provider
   **********************************/

  async createProvider(createServiceProviderInput: CreateServiceProviderInput) {
    try {
      const { serviceOffered, ...rest } = createServiceProviderInput;

      const services = await this.serviceRepository.find({
        where: { id: In(createServiceProviderInput.serviceOffered) },
      });
      const serviceProvider = await this.serviceProviderRepository.save({
        ...rest,
        serviceOffered: services,
      });

      return serviceProvider;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async findAllServiceProvider(paginateAndSort: PaginateAndSort) {
    try {
      return await this.serviceProviderRepository.find({
        take: paginateAndSort.take ?? 20,
        skip: paginateAndSort.skip ?? 0,
        relations: ['serviceOffered'],
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async findOneServiceProvider(id: string) {
    try {
      return await this.serviceProviderRepository.findOneBy({ id });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async accept(serviceProviderInput: ServiceProviderInput, user: User) {
    try {
      const serviceProvider = await this.serviceProviderRepository.find({
        where: { id: In(serviceProviderInput.id) },
      });

      const { affected } = await this.serviceProviderRepository.update(
        serviceProviderInput.id,
        {
          providerStatus: ServiceProviderStatus.ACCEPTED,
        },
      );
      const activityToSave = serviceProvider.map((element) => {
        return {
          adminId: user.id,
          action: ActivityEnum.DELETED,
          details: JSON.stringify(
            serviceProvider.find((a) => a.id === element.id),
          ),
          userId: element.id,
        };
      });

      await this.activityLogService.logActivity(activityToSave);

      if (affected > 0) {
        return new SuccessResponse(AppStrings.SUCCESSFULL);
      }
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async reject(serviceProviderInput: ServiceProviderInput, user: User) {
    try {
      const serviceProvider = await this.serviceProviderRepository.find({
        where: { id: In(serviceProviderInput.id) },
      });

      const { affected } = await this.serviceProviderRepository.update(
        serviceProviderInput.id,
        {
          providerStatus: ServiceProviderStatus.REJECTED,
        },
      );

      const activityToSave = serviceProvider.map((element) => {
        return {
          adminId: user.id,
          action: ActivityEnum.DELETED,
          details: JSON.stringify(
            serviceProvider.find((a) => a.id === element.id),
          ),
          userId: element.id,
        };
      });

      await this.activityLogService.logActivity(activityToSave);

      if (affected > 0) {
        return new SuccessResponse(AppStrings.SUCCESSFULL);
      }
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async update(updateServiceProviderInput: UpdateServiceProviderInput) {
    try {
      const { id, serviceOffered, ...rest } = updateServiceProviderInput;

      return await this.serviceProviderRepository.update(id, { ...rest });
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async updateServiceStatus(updateServiceInput: UpdateServiceInput) {
    try {
      const { id, providerServiceStatus } = updateServiceInput;
      return await this.serviceStatusRepository.update(id, {
        status: providerServiceStatus,
      });
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async delete(deleteServiceProvider: DeleteServiceProvider) {
    try {
      return await this.serviceProviderRepository.softDelete(
        deleteServiceProvider.id,
      );
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async deleteService(deleteServiceProvider: DeleteServiceProvider) {
    try {
      return await this.serviceRepository.softDelete(deleteServiceProvider.id);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async searchForServiceProvider(searchParam: string) {
    try {
      return await this.serviceProviderRepository
        .createQueryBuilder('serviceProvider')
        .leftJoinAndSelect('serviceProvider.user', 'user')

        // .orWhere('user.firstName ILIKE :term', { term: `%${searchParam}%` })
        // .orWhere('user.arabicFirstName ILIKE :term', {
        //   term: `%${searchParam}%`,
        // })
        // .orWhere('parentIssue.arabicName ILIKE :term', {
        //   term: `%${searchParam}%`,
        // })
        // .orWhere('parentIssue.englishName ILIKE :term', {
        //   term: `%${searchParam}%`,
        // })
        // .orWhere('childIssue.arabicName ILIKE :term', {
        //   term: `%${searchParam}%`,
        // })
        // .orWhere('childIssue.englishName ILIKE :term', {
        //   term: `%${searchParam}%`,
        // })
        .getMany();
    } catch (error) {
      this.logger.error('Error searching tickets', error);
      throw new BadRequestException(error.message);
    }
  }

  async searchForService(searchParam: string) {
    try {
      return await this.serviceProviderRepository
        .createQueryBuilder('service')
        .leftJoinAndSelect('service.user', 'user')
        // .leftJoinAndSelect('ticket.parentIssue', 'parentIssue')
        // .leftJoinAndSelect('ticket.childIssue', 'childIssue')

        // .orWhere('user.firstName ILIKE :term', { term: `%${searchParam}%` })
        // .orWhere('user.arabicFirstName ILIKE :term', {
        //   term: `%${searchParam}%`,
        // })
        // .orWhere('parentIssue.arabicName ILIKE :term', {
        //   term: `%${searchParam}%`,
        // })
        // .orWhere('parentIssue.englishName ILIKE :term', {
        //   term: `%${searchParam}%`,
        // })
        // .orWhere('childIssue.arabicName ILIKE :term', {
        //   term: `%${searchParam}%`,
        // })
        // .orWhere('childIssue.englishName ILIKE :term', {
        //   term: `%${searchParam}%`,
        // })
        .getMany();
    } catch (error) {
      this.logger.error('Error searching tickets', error);
      throw new BadRequestException(error.message);
    }
  }
}
