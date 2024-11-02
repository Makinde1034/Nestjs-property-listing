import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  CreateServiceInput,
  CreateServiceProviderInput,
  UpdateServiceInput,
  UpdateServiceProviderInput,
} from '../dto/service';

import { ServiceProviderRepository } from '../repository/service-provider.repository';
import { ServiceRepository } from '../repository/services.repository';
import { PaginateAndSort } from '../../modules/core/dto/pagination-and-sort.dto';
import { ActivityLogService } from '../../modules/activity-log/services/activity-log.service';
import { In } from 'typeorm';
import { ServiceProviderStatus } from '../../common/enums/status.enum';
import { ServiceStatusRepository } from '../repository/service-status.repository';

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

  async findAllServices(paginateAndSort: PaginateAndSort) {
    return await this.serviceRepository.find({
      take: paginateAndSort.take ?? 20,
      skip: paginateAndSort.skip ?? 0,
    });
  }

  async findOneService(id: string) {
    return await this.serviceRepository.findOneBy({ id });
  }

  async findAllServiceProvider(paginateAndSort: PaginateAndSort) {
    return await this.serviceProviderRepository.find({
      take: paginateAndSort.take ?? 20,
      skip: paginateAndSort.skip ?? 0,
    });
  }

  async findOneServiceProvider(id: string) {
    return await this.serviceProviderRepository.findOneBy({ id });
  }

  async accept(id: string) {
    try {
      return await this.serviceProviderRepository.update(id, {
        providerStatus: ServiceProviderStatus.ACCEPTED,
      });
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async reject(id: string) {
    try {
      return await this.serviceProviderRepository.update(id, {
        providerStatus: ServiceProviderStatus.REJECTED,
      });
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

  remove(id: string) {
    return `This action removes a #${id} serviceProvider`;
  }

  async searchForTickets(searchParam: string) {
    try {
      return await this.serviceProviderRepository
        .createQueryBuilder('serviceProvider')
        .leftJoinAndSelect('serviceProvider.reporter', 'user')
        .leftJoinAndSelect('ticket.parentIssue', 'parentIssue')
        .leftJoinAndSelect('ticket.childIssue', 'childIssue')

        .orWhere('user.firstName ILIKE :term', { term: `%${searchParam}%` })
        .orWhere('user.arabicFirstName ILIKE :term', {
          term: `%${searchParam}%`,
        })
        .orWhere('parentIssue.arabicName ILIKE :term', {
          term: `%${searchParam}%`,
        })
        .orWhere('parentIssue.englishName ILIKE :term', {
          term: `%${searchParam}%`,
        })
        .orWhere('childIssue.arabicName ILIKE :term', {
          term: `%${searchParam}%`,
        })
        .orWhere('childIssue.englishName ILIKE :term', {
          term: `%${searchParam}%`,
        })
        .getMany();
    } catch (error) {
      this.logger.error('Error searching tickets', error);
      throw new BadRequestException(error.message);
    }
  }
}
