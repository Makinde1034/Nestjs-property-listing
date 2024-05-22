import { Injectable } from '@nestjs/common';
import { Review } from 'src/entities';

import { EntityRepository } from '../../core/base.class/entity.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ReviewRepository extends EntityRepository<Review> {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {
    super(reviewRepository);
  }
}
