import { Injectable } from '@nestjs/common';
import { CreateAdPackageInput } from '../dto/create-ad-package.input';
import { UpdateAdPackageInput } from '../dto/update-ad-package.input';
import { AdPackageRepository } from '../repositores/ad-package.repository';

@Injectable()
export class AdPackageService {
  constructor(private adrepository: AdPackageRepository) {}
  async create(createAdPackageInput: CreateAdPackageInput) {
    return await this.adrepository.save(createAdPackageInput);
  }

  async findAll() {
    return await this.adrepository.find();
  }

  async findOne(id: string) {
    return await this.adrepository.findOne({ where: { id: id } });
  }

  async update(id: string, updateAdPackageInput: UpdateAdPackageInput) {
    return await this.adrepository.update(id, updateAdPackageInput);
  }

  async remove(id: number) {
    return await this.adrepository.softDelete(id);
  }
}
