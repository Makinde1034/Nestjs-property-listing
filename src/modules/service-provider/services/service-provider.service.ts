import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  CreateServiceInput,
  CreateServiceProviderInput,
  DeleteServiceProvider,
  ProvideNewService,
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
import { ServiceStatus } from '../../../entities/provider-service-status.entity';

@Injectable()
export class ServiceAndProviderService {
  constructor(
    private readonly serviceProviderRepository: ServiceProviderRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly activityLogService: ActivityLogService,
    private readonly serviceStatusRepository: ServiceStatusRepository,
  ) {}

  logger = new Logger(ServiceAndProviderService.name);
  async createService(createServiceInput: CreateServiceInput, user: User) {
    try {
      const { pricing, ...rest } = createServiceInput;

      const data = await this.serviceRepository.save({
        ...rest,
        pricing: JSON.stringify(createServiceInput.pricing),
      });

      await this.activityLogService.logActivity([
        {
          adminId: user.id,
          action: ActivityEnum.CREATED,
          details: JSON.stringify(data),

          serviceId: data.id,
        },
      ]);

      return data;
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

  async updateServiceStatus(updateServiceInput: UpdateServiceInput) {
    try {
      const { id, providerServiceStatus } = updateServiceInput;
      const { affected } = await this.serviceStatusRepository.update(id, {
        status: providerServiceStatus,
      });

      if (affected > 0) {
        return new SuccessResponse(AppStrings.SUCCESSFULL);
      }
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async updateProviderServiceCoverageArea(
    updateServiceInput: UpdateServiceProviderInput,
  ) {
    try {
      const { id, coverageArea } = updateServiceInput;
      const { affected } = await this.serviceProviderRepository.update(id, {
        coverageArea: coverageArea,
      });
      if (affected > 0) {
        return new SuccessResponse(AppStrings.SUCCESSFULL);
      }
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async acceptRequestAndStopRequest(updateServiceInput: UpdateServiceInput) {
    try {
      const { id, isActive } = updateServiceInput;
      const { affected } = await this.serviceStatusRepository.update(id, {
        isActive: isActive,
      });

      if (affected > 0) {
        return new SuccessResponse(AppStrings.SUCCESSFULL);
      }
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async provideService(
    proideServiceInput: ProvideNewService,
  ): Promise<ServiceStatus> {
    try {
      return await this.serviceStatusRepository.save(proideServiceInput);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async stopProvidingService(proideServiceInput: ServiceProviderInput) {
    try {
      const { affected } = await this.serviceStatusRepository.softDelete(
        proideServiceInput.id,
      );
      if (affected > 0) {
        throw new SuccessResponse(AppStrings.SUCCESSFULL);
      }
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async delete(deleteServiceProvider: DeleteServiceProvider) {
    try {
      const { affected } = await this.serviceProviderRepository.softDelete(
        deleteServiceProvider.id,
      );

      if (affected > 0) {
        return new SuccessResponse(AppStrings.SUCCESSFULL);
      }
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async deleteService(deleteServiceProvider: DeleteServiceProvider) {
    try {
      const { affected } = await this.serviceRepository.softDelete(
        deleteServiceProvider.id,
      );

      if (affected > 0) {
        return new SuccessResponse(AppStrings.SUCCESSFULL);
      }
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
