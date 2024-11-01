import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateServiceProviderInput } from '../dto/create-service-provider.input';
import { UpdateServiceProviderInput } from '../dto/update-service-provider.input';
import { ServiceProviderRepository } from '../repository/service-provider.repository';

@Injectable()
export class ServiceProviderService {
  constructor(
    private readonly serviceProviderRepository: ServiceProviderRepository,
  ) {}

  logger = new Logger(ServiceProviderService.name);
  async create(createServiceProviderInput: CreateServiceProviderInput) {
    try {
      return await this.serviceProviderRepository.save(
        createServiceProviderInput,
      );
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async findAll() {
    return `This action returns all serviceProvider`;
  }

  findOne(id: number) {
    return `This action returns a #${id} serviceProvider`;
  }

  update(id: number, updateServiceProviderInput: UpdateServiceProviderInput) {
    return `This action updates a #${id} serviceProvider`;
  }

  remove(id: number) {
    return `This action removes a #${id} serviceProvider`;
  }
}
