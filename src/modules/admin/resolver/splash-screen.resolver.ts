import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SplashScreen } from '../../../entities/splash-screen.entity';
import {
  CreateSplashScreenInput,
  UpdateSplashScreenInput,
} from '../dto/request/create-splash-screen';
import { SplashScreenService } from '../services/splash-screen.service';
import { SplashScreenResponse } from '../dto/response/splash-screen-response';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';

@Resolver()
export class SplashScreenResolver {
  constructor(private readonly splashScreenService: SplashScreenService) {}
  @Mutation(() => SplashScreen, { name: 'createSplashScreen' })
  async create(
    @Args('createSplashScreenInput')
    createSplashScreenInput: CreateSplashScreenInput,
  ) {
    return await this.splashScreenService.create(createSplashScreenInput);
  }

  @Query(() => SplashScreenResponse, { name: 'findAllSplashScreen' })
  async findAll(
    @Args('findOption', { nullable: true }) findOption: PaginateAndSort,
  ) {
    return await this.splashScreenService.findAll(findOption);
  }

  @Query(() => SplashScreenResponse, { name: 'findOneSplashScreen' })
  async findOneAll(@Args('id', { nullable: true }) id: string) {
    return await this.splashScreenService.findOne(id);
  }

  @Mutation(() => SplashScreen, { name: 'updateSplashScreen' })
  async update(updateSplashScreenInput: UpdateSplashScreenInput) {
    return await this.splashScreenService.update(updateSplashScreenInput);
  }

  @Mutation(() => SplashScreen, { name: 'deleteSplashScreen' })
  async delete(id: string) {
    return await this.splashScreenService.delete(id);
  }

  @Query(() => SplashScreenResponse, { name: 'findDefaultSplashScreen' })
  async findDefault() {
    return await this.splashScreenService.fetchDefault();
  }
}
