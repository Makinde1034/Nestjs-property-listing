/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateServiceInput,
  CreateServiceProviderInput,
  DeleteServiceProvider,
  ProvideNewService,
  ProvideServiceStatusInput,
  RequestForService,
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
import { ServiceProvidedRepository } from '../repository/service-provided.repository';
import { NotificationScope, User } from '../../../entities';
import { ActivityEnum } from '../../../common/enums/activitys';
import { SuccessResponse } from '../../../common/utils/success.response';
import { AppStrings, messagesKeys } from '../../../common/messages/app.strings';
import { ServiceProvided } from '../../../entities/service-provided.entity';
import { ServiceRequestedRepository } from '../repository/requested-service.repository';
import {
  ServiceProvidedStatus,
  ServiceProviderLicense,
} from '../../../common/enums/service-provider';
import { AdminFilterAndSort } from '../../listing/dtos/request';
import { StorageService } from '../../file-handler/services/storage.service';
import { ListingRepository } from '../../listing/repositories/listing.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationScopeEnum } from '../../../common/enums/notification-scope.enum';
import { NotificationScopeRepository } from '../../user/repositories';
import { NotificationEvent } from '../../../common/enums';
import { I18nService } from 'nestjs-i18n';
import { PdfInput } from '../../file-handler/dto/pdf.dto';
import { PaymentService } from '../../payment/services/payment.service';
import { InvoiceRepository } from '../../payment/repositories/invoice.repository';

@Injectable()
export class ServiceAndProviderService {
  constructor(
    private readonly serviceProviderRepository: ServiceProviderRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly activityLogService: ActivityLogService,
    private readonly serviceProvidedRepository: ServiceProvidedRepository,
    private readonly storageService: StorageService,
    private readonly serviceRequestedRepository: ServiceRequestedRepository,
    private readonly listingRepository: ListingRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationScopeRepository: NotificationScopeRepository,
    private readonly i18n: I18nService,
    private readonly paymentService: PaymentService,
    private readonly invoiceRepository: InvoiceRepository,
  ) {}
  logger = new Logger(ServiceAndProviderService.name);

  /**
   *
   * Service Provider
   */
  async findOneService(id: string) {
    try {
      return await this.serviceRepository.findOneBy({ id });
    } catch (error) {
      this.logger.error(error);
      throw new NotFoundException(
        this.i18n.t(`messages.${messagesKeys.NOT_FOUND}`),
      );
    }
  }
  /**********************************
   * Create Service Provider
   **********************************/

  async createProvider(
    createServiceProviderInput: CreateServiceProviderInput,
    user: User,
  ) {
    try {
      const { serviceOffered, ...rest } = createServiceProviderInput;

      const alreadyExisting = await this.serviceProviderRepository.findOne({
        where: { userId: user.id },
      });

      if (alreadyExisting) {
        throw new BadRequestException(
          this.i18n.t(`messages.${messagesKeys.RESOURCE_ALREADY_EXISTS}`),
        );
      }

      const service = await this.serviceRepository.findOne({
        where: { id: serviceOffered },
      });

      if (!service) {
        throw new NotFoundException(
          this.i18n.t(`messages.${messagesKeys.NOT_FOUND}`),
        );
      }

      const serviceProvider = this.serviceProviderRepository.create({
        ...rest,
        coverageArea: rest.coverageArea.replace(/\b\w/g, (char) =>
          char.toUpperCase(),
        ),
        user,
      });

      await this.serviceProviderRepository.save(serviceProvider);

      const serviceProvided = this.serviceProvidedRepository.create({
        service: service, // Use entity reference
        serviceProvider: serviceProvider, // Use entity reference
      });

      await this.serviceProvidedRepository.save(serviceProvided);

      return serviceProvider;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async findAllServiceProvider(paginateAndSort: AdminFilterAndSort) {
    try {
      const take = paginateAndSort.take ?? 20;
      const skip = paginateAndSort.skip ?? 0;

      const baseQuery = this.serviceProviderRepository
        .createQueryBuilder('serviceProvider')
        .leftJoinAndSelect('serviceProvider.user', 'user')
        .leftJoinAndSelect('serviceProvider.servicesOffered', 'servicesOffered')
        .leftJoinAndSelect('servicesOffered.service', 'service');
      if (paginateAndSort.status) {
        baseQuery.andWhere(`serviceProvider.providerStatus = :status`, {
          status: paginateAndSort.status,
        });
      }
      const [serviceProvider, count] = await baseQuery
        .take(take)
        .skip(skip)
        .getManyAndCount();
      return { serviceProvider, count };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async findOneServiceProvider(id: string) {
    try {
      const [provider, serviceProvided] = await Promise.all([
        this.serviceProviderRepository.findOneBy({ id }),
        this.serviceProvidedRepository.find({
          where: { serviceProviderId: id },
        }),
      ]);

      return { serviceProvided, provider };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }
  async serviceProviderStatus(user: User) {
    try {
      const provider = await this.serviceProviderRepository.findOneBy({
        userId: user.id,
      });

      if (!provider) {
        throw new NotFoundException(
          this.i18n.t(`messages.${messagesKeys.NOT_FOUND}`),
        );
      }

      return provider;
    } catch (error) {
      this.logger.error(error);

      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async accept(serviceProviderInput: ServiceProviderInput, user: User) {
    try {
      const serviceProviderId = [];
      serviceProviderInput.approvalInput.forEach((element) => {
        serviceProviderId.push(element.id);
      });
      const serviceProvider = await this.serviceProviderRepository.find({
        where: { id: In(serviceProviderId) },
      });

      const notificationPreference =
        await this.notificationScopeRepository.find({
          where: { scopeGroup: NotificationScopeEnum.OFFERS },
        });

      if (serviceProvider.length == 0) {
        throw new NotFoundException(
          this.i18n.t(`messages.${messagesKeys.NOT_FOUND}`),
        );
      }

      const resultToUpdate = serviceProvider.map((element) => {
        const serviceProviderToUpdate = serviceProviderInput.approvalInput.find(
          (value) => element.id == value.id,
        );
        return {
          ...element,
          reason: serviceProviderToUpdate.reason,

          providerStatus: ServiceProviderStatus.ACCEPTED,
        };
      });

      const updatedServiceProvider =
        await this.serviceProviderRepository.save(resultToUpdate);
      const activityToSave = serviceProvider.map((element) => {
        const scope: NotificationScope = notificationPreference.find(
          (element) => {
            if (
              element.scopeGroup ==
              NotificationScopeEnum.SERVICE_PROVIDER_APPLICATION
            ) {
              return element;
            }
          },
        );
        this.eventEmitter.emit(NotificationEvent.SEND_NOTIFICATION, {
          creatorId: user.id,
          receiverId: element?.userId,
          scope: scope,
          event: 'Response',
          metadata: JSON.stringify(serviceProvider),
          recipientFormat: [null, 'Service Provider'],
          img: element?.user?.profilePhoto,
        });

        return {
          adminId: user.id,
          action: ActivityEnum.UPDATED,
          details: JSON.stringify(
            serviceProvider.find((a) => a.id === element.id),
          ),
          serviceProviderId: element.id,
        };
      });

      await this.activityLogService.logActivity(activityToSave);

      if (updatedServiceProvider) {
        return new SuccessResponse(
          this.i18n.t(`messages.${messagesKeys.SUCCESSFULL}`),
        );
      }
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async reject(serviceProviderInput: ServiceProviderInput, user: User) {
    try {
      const serviceProviderId = [];
      serviceProviderInput.approvalInput.forEach((element) => {
        serviceProviderId.push(element.id);
      });
      const serviceProvider = await this.serviceProviderRepository.find({
        where: { id: In(serviceProviderId) },
      });

      if (serviceProvider.length == 0) {
        throw new BadRequestException(AppStrings.NOT_FOUND);
      }

      const resultToUpdate = serviceProvider.map((element) => {
        const serviceProviderToUpdate = serviceProviderInput.approvalInput.find(
          (value) => element.id == value.id,
        );
        return {
          ...element,
          reason: serviceProviderToUpdate.reason,

          providerStatus: ServiceProviderStatus.REJECTED,
        };
      });

      const updatedServiceProvider =
        await this.serviceProviderRepository.save(resultToUpdate);

      const activityToSave = serviceProvider.map((element) => {
        return {
          adminId: user.id,
          action: ActivityEnum.UPDATED,
          details: JSON.stringify(
            serviceProvider.find((a) => a.id === element.id),
          ),
          serviceProviderId: element.id,
        };
      });

      await this.activityLogService.logActivity(activityToSave);

      if (updatedServiceProvider) {
        return new SuccessResponse(
          this.i18n.t(`messages.${messagesKeys.SUCCESSFULL}`),
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.log(error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async updateProviderServiceCoverageArea(
    updateServiceInput: UpdateServiceProviderInput,
  ) {
    try {
      const { id, coverageArea } = updateServiceInput;
      const { affected } = await this.serviceProvidedRepository.update(id, {
        coverageArea: coverageArea,
      });
      if (affected > 0) {
        return new SuccessResponse(
          this.i18n.t(`messages.${messagesKeys.SUCCESSFULL}`),
        );
      }
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async provideService(
    proideServiceInput: ProvideNewService,
  ): Promise<ServiceProvided> {
    try {
      return await this.serviceProvidedRepository.save(proideServiceInput);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async stopProvidingService(proideServiceInput: ProvideServiceStatusInput) {
    try {
      const { affected } = await this.serviceProvidedRepository.softDelete(
        proideServiceInput.id,
      );
      if (affected > 0) {
        throw new SuccessResponse(
          this.i18n.t(`messages.${messagesKeys.SUCCESSFULL}`),
        );
      }
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async delete(deleteServiceProvider: DeleteServiceProvider) {
    try {
      const { affected } = await this.serviceProviderRepository.softDelete(
        deleteServiceProvider.id,
      );

      if (affected > 0) {
        return new SuccessResponse(
          this.i18n.t(`messages.${messagesKeys.SUCCESSFULL}`),
        );
      }
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async searchForServiceProvider(searchParam: string) {
    try {
      return await this.serviceProviderRepository
        .createQueryBuilder('serviceProvider')
        .leftJoinAndSelect('serviceProvider.user', 'user')
        .orWhere('serviceProvider.coverageArea ILIKE :term', {
          term: `%${searchParam}%`,
        })

        .getMany();
    } catch (error) {
      this.logger.error('Error searching tickets', error);
      throw new InternalServerErrorException(
        this.i18n.t(`messages.${messagesKeys.INTERNAL_SERVER_EXCEPTION}`),
      );
    }
  }

  /**
   * Services
   *
   */
  async createService(createServiceInput: CreateServiceInput, user: User) {
    try {
      const { pricing, ...rest } = createServiceInput;

      const data = await this.serviceRepository.save({
        ...rest,
        pricing: JSON.stringify(pricing),
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
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async findAllServices(paginateAndSort: PaginateAndSort) {
    try {
      const whereOption =
        paginateAndSort?.where?.fieldToChose &&
        paginateAndSort?.where?.whereParam
          ? {
              [paginateAndSort.where.fieldToChose]:
                paginateAndSort.where.whereParam,
            }
          : {};
      const [service, count] = await this.serviceRepository.findAndCount({
        take: paginateAndSort.take ?? 20,
        skip: paginateAndSort.skip ?? 0,
        where: { ...whereOption },
      });

      return { service, count };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async updateServiceStatus(updateServiceInput: UpdateServiceInput) {
    try {
      const { id, providerServiceStatus } = updateServiceInput;

      const serviceProvided = await this.serviceProvidedRepository.findOneBy({
        id,
      });

      if (!serviceProvided) {
        throw new NotFoundException(
          this.i18n.t(`messages.${messagesKeys.NOT_FOUND}`),
        );
      }

      const { affected } = await this.serviceProvidedRepository.update(id, {
        status: providerServiceStatus,
      });

      if (affected > 0) {
        return new SuccessResponse(
          this.i18n.t(`messages.${messagesKeys.SUCCESSFULL}`),
        );
      }
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }
  async updateService(updateServiceInput: UpdateServiceInput) {
    try {
      let { id, providerServiceStatus, isActive, pricing, ...rest } =
        updateServiceInput;
      if (pricing) {
        const { affected } = await this.serviceRepository.update(id, {
          ...rest,
          pricing: JSON.stringify(pricing),
        });

        const data = await this.serviceRepository.findOneBy({ id });

        if (affected > 0) {
          return new SuccessResponse(
            this.i18n.t(`messages.${messagesKeys.SUCCESSFULL}`),
            data,
          );
        }
      } else {
        const { affected } = await this.serviceRepository.update(id, {
          ...rest,
        });
        const data = await this.serviceRepository.findOneBy({ id });

        if (affected > 0) {
          return new SuccessResponse(
            this.i18n.t(`messages.${messagesKeys.SUCCESSFULL}`),
            data,
          );
        }
      }
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async requestForService(
    requestForServiceInput: RequestForService,
    user: User,
  ) {
    try {
      const service = await this.serviceRepository.findOneBy({
        id: requestForServiceInput.serviceProvidedId,
      });
      if (!service) {
        throw new NotFoundException(
          this.i18n.t(`messages.${messagesKeys.NOT_FOUND}`),
        );
      }
      const listing = await this.listingRepository.findOneBy({
        id: requestForServiceInput.listingId,
      });
      if (!listing) {
        throw new NotFoundException(
          this.i18n.t(`messages.${messagesKeys.LISTING_NOT_FOUND}`),
        );
      }
      const data = await this.serviceRequestedRepository.save({
        ...requestForServiceInput,
        serviceId: requestForServiceInput.serviceProvidedId,

        listing,

        userId: user.id,
      });

      const invoice = await this.invoiceRepository.findOne({
        where: { reference: requestForServiceInput.reference },
      });

      const pdf: PdfInput = {
        // createdDate: `${offerPayload.createdAt.getDate()}-${offerPayload.createdAt.getMonth() + 1}-${offerPayload.createdAt.getFullYear()}`,
        // sellerCRNumber: seller.crNumber,
        // sellerzatcaNumber: seller.zatcaNuber,
        // sellerAddress: seller.address,
        // sellerName:
        //   seller.language === 'en'
        //     ? `${seller.firstName} ${seller.lastName}`
        //     : `${seller.arabicFirstName} ${seller.arabicLastName}`,
        // customerCRNumber: user.crNumber,
        // customerName:
        //   user.language === 'en'
        //     ? `${user.firstName} ${user.lastName}`
        //     : `${user.arabicFirstName} ${user.arabicLastName}`,
        // customerAddress: user.address,
        // customerZatcaNumber: user.zatcaNuber,
        // totalWithVat: [offerPayload.price + vat],
        // itemVat: [{ vat: adminDefault.vat, vatValue: vat }],
        // product: offerPayload,
        // sumTotalWithoutVat: offerPayload.price,
        // sumTotalVat: vat,
        // sumTotalWithVat: offerPayload.price + vat,
      };

      await this.paymentService.finalizeInvoice(invoice, pdf, user);

      return data;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async cancleService(id: string, user?: User) {
    try {
      const data = await this.serviceRequestedRepository.update(id, {
        status: ServiceProvidedStatus.CANCELED,
      });

      return data;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async appealService(id: string, user: User) {
    try {
      const data = await this.serviceRequestedRepository.update(id, {
        status: ServiceProvidedStatus.APPEALED,
      });

      return data;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async markAsDone(id: string, user: User) {
    try {
      const serviceRequested = await this.serviceRequestedRepository.findOneBy({
        id,
      });
      const data = await this.serviceRequestedRepository.update(id, {
        status: ServiceProvidedStatus.DONE,
      });

      const notificationPreference =
        await this.notificationScopeRepository.find({
          where: { scopeGroup: NotificationScopeEnum.OFFERS },
        });

      const scope: NotificationScope = notificationPreference.find(
        (element) => {
          if (element.scopeGroup == NotificationScopeEnum.SERVICE) {
            return element;
          }
        },
      );
      this.eventEmitter.emit(NotificationEvent.SEND_NOTIFICATION, {
        creatorId: serviceRequested.userId,
        receiverId: serviceRequested.userId,
        scope: scope,
        event: 'Response',
        metadata: JSON.stringify(data),
        recipientFormat: [null, 'Service ProviderListing Owner'],
        img: user?.profilePhoto,
      });

      return data;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async confirmService(id: string, user: User) {
    try {
      const data = await this.serviceRequestedRepository.update(id, {
        status: ServiceProvidedStatus.COMPLETED,
      });

      return data;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async acceptService(id: string, user: User) {
    try {
      const provider = await this.serviceProviderRepository.findOne({
        where: { userId: user.id },
      });
      const data = await this.serviceRequestedRepository.update(id, {
        status: ServiceProvidedStatus.ACCEPTED,
        provider,
      });
      return data;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async rejectService(id: string, user: User) {
    try {
      await this.serviceRequestedRepository.update(id, {
        status: ServiceProvidedStatus.REJECTED,
      });

      return new SuccessResponse(AppStrings.SUCCESSFULL);
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async ViewServiceRequest(paginateAndSort: PaginateAndSort, user: User) {
    try {
      // Fetch the service provider details
      const serviceprovider = await this.serviceProviderRepository.findOne({
        where: { userId: user.id },
      });

      if (!serviceprovider) {
        throw new BadRequestException('Service provider not found');
      }

      // Initialize query builder
      const query = this.serviceRequestedRepository
        .createQueryBuilder('serviceRequested')
        .leftJoinAndSelect('serviceRequested.user', 'user')
        .leftJoinAndSelect('serviceRequested.provider', 'provider')
        .leftJoinAndSelect('serviceRequested.listing', 'listing')
        .leftJoinAndSelect('serviceRequested.service', 'service')
        .leftJoinAndSelect('listing.listingAttributes', 'listingAttributes')
        .leftJoinAndSelect('listingAttributes.attribute', 'attribute')
        .leftJoinAndSelect('listing.listingType', 'listingType')
        .take(paginateAndSort.take)
        .skip(paginateAndSort.skip);

      /**************************************************
       * Uncomment to enable  filter by coverage area
       *
       **************************************************/

      // Apply coverage area filter if available
      // if (serviceprovider.coverageArea) {
      //   query.andWhere(
      //     'listingAttributes.name = :city AND listingAttributes.value = :coverageArea',
      //     {
      //       city: 'City',
      //       coverageArea: serviceprovider.coverageArea,
      //     },
      //   );
      // }

      // Execute query
      query.where('serviceRequested.status = :status', {
        status: ServiceProviderStatus.PENDING,
      });

      query.orWhere('provider.id = :providerId::uuid', {
        providerId: serviceprovider.id,
      });

      const [request, total] = await query.getManyAndCount();

      return { request, total };
    } catch (error) {
      this.logger.error('Error fetching service requests', error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async ViewServiceRequested(paginateAndSort: PaginateAndSort, user: User) {
    try {
      const query = this.serviceRequestedRepository
        .createQueryBuilder('serviceRequested')
        .leftJoinAndSelect('serviceRequested.user', 'user')
        .leftJoinAndSelect('serviceRequested.provider', 'provider')
        .leftJoinAndSelect('serviceRequested.listing', 'listing')
        .leftJoinAndSelect('serviceRequested.service', 'service')
        .leftJoinAndSelect('listing.listingAttributes', 'listingAttributes')
        .leftJoinAndSelect('listingAttributes.attribute', 'attribute')
        .leftJoinAndSelect('listing.listingType', 'listingType')
        .where('user.id = :userId::uuid', { userId: user.id });
      const [request, total] = await query
        .take(paginateAndSort.take)
        .skip(paginateAndSort.skip)
        .getManyAndCount();

      return { request, total };
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async acceptRequestAndStopRequest(updateServiceInput: UpdateServiceInput) {
    try {
      const { id, isActive } = updateServiceInput;
      const { affected } = await this.serviceProvidedRepository.update(id, {
        isActive: isActive,
      });

      if (affected > 0) {
        return new SuccessResponse(
          this.i18n.t(`messages.${messagesKeys.SUCCESSFULL}`),
        );
      }
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async deleteService(deleteServiceProvider: DeleteServiceProvider) {
    try {
      const { affected } = await this.serviceRepository.softDelete(
        deleteServiceProvider.id,
      );

      if (affected > 0) {
        return new SuccessResponse(
          this.i18n.t(`messages.${messagesKeys.SUCCESSFULL}`),
        );
      }
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async searchForService(searchParam: string) {
    try {
      return await this.serviceRepository
        .createQueryBuilder('service')
        .leftJoinAndSelect('service.user', 'user')
        .orWhere('serviceProvider.englishServiceName ILIKE :term', {
          term: `%${searchParam}%`,
        })
        .orWhere('serviceProvider.arabicServiceName ILIKE :term', {
          term: `%${searchParam}%`,
        })
        .getMany();
    } catch (error) {
      this.logger.error('Error searching tickets', error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }

  async uploadWorkDocument(
    id: string,
    icon: Express.Multer.File,
    type: string,
  ) {
    try {
      let imageUrl: string;
      const serviceProvider = await this.serviceProviderRepository.findOneBy({
        id,
      });

      if (!serviceProvider) {
        throw new NotFoundException(
          this.i18n.t(`messages.${messagesKeys.NOT_FOUND}`),
        );
      }

      if (icon) {
        // Upload icon image only if provided
        imageUrl = await this.storageService.upload(icon);
      }
      let result;

      // Perform update only if the image URL exists
      if (imageUrl) {
        switch (type) {
          case ServiceProviderLicense.IBAN:
            result = await this.serviceProviderRepository.update(
              serviceProvider.id,
              {
                ibanCertificate: imageUrl,
              },
            );
            break;

          case ServiceProviderLicense.ID_OR_CR:
            result = await this.serviceProviderRepository.update(
              serviceProvider.id,
              {
                idOrCr: imageUrl,
              },
            );
            break;
          case ServiceProviderLicense.WORK_LICENSE:
            result = await this.serviceProviderRepository.update(
              serviceProvider.id,
              {
                workLicense: imageUrl,
              },
            );
            break;

          default:
            break;
        }

        // Fetch updated entity only if update was successful
        if (result.affected > 0) {
          return this.serviceProviderRepository.findOneOrFail({
            where: { id: serviceProvider.id },
          });
        }
      }
    } catch (error) {
      this.logger.error('Error uploading  icon:', error);
      throw new BadRequestException(
        this.i18n.t(`messages.${messagesKeys.BAD_REQUEST}`),
      );
    }
  }
}
