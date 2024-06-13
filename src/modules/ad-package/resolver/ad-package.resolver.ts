import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AdPackageService } from '../services/ad-package.service';
import { AdPackage } from '../../../entities/ad-package.entity';
import { CreateAdPackageInput } from '../dto/create-ad-package.input';
import { UpdateAdPackageInput } from '../dto/update-ad-package.input';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guards';
import { AdminGuard } from '../../auth/guards/admin.guard';
@UseGuards(AccessTokenGuard)
@UseGuards(AdminGuard)
@Resolver(() => AdPackage)
export class AdPackageResolver {
  constructor(private readonly adPackageService: AdPackageService) {}

  @Mutation(() => AdPackage)
  async createAdPackage(
    @Args('createAdPackageInput') createAdPackageInput: CreateAdPackageInput,
  ) {
    return await this.adPackageService.create(createAdPackageInput);
  }

  @Query(() => [AdPackage], { name: 'adPackage' })
  async findAll() {
    return await this.adPackageService.findAll();
  }

  @Query(() => AdPackage, { name: 'adPackage' })
  async findOne(@Args('id', { type: () => String }) id: string) {
    return await this.adPackageService.findOne(id);
  }

  @Mutation(() => AdPackage)
  async updateAdPackage(
    @Args('updateAdPackageInput') updateAdPackageInput: UpdateAdPackageInput,
  ) {
    return await this.adPackageService.update(
      updateAdPackageInput.id,
      updateAdPackageInput,
    );
  }

  @Mutation(() => AdPackage)
  async removeAdPackage(@Args('id', { type: () => Int }) id: number) {
    return await this.adPackageService.remove(id);
  }
}
