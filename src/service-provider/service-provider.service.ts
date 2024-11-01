import { Injectable } from '@nestjs/common';
import { CreateServiceProviderInput } from './dto/create-service-provider.input';
import { UpdateServiceProviderInput } from './dto/update-service-provider.input';

@Injectable()
export class ServiceProviderService {
  create(createServiceProviderInput: CreateServiceProviderInput) {
    return 'This action adds a new serviceProvider';
  }

  findAll() {
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
