import { Injectable } from '@nestjs/common';
import { TokenConfirmation } from '../../../entities';
import { EntityRepository } from '../../core/base.class/entity.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserConfirmationRepository extends EntityRepository<TokenConfirmation> {
  constructor(
    @InjectRepository(TokenConfirmation)
    private readonly confirmationRepository: Repository<TokenConfirmation>,
  ) {
    super(confirmationRepository);
  }
}
