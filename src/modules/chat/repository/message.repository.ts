import { DataSource, Repository } from 'typeorm';
import { Messages } from '../../../entities/message.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageRepository extends Repository<Messages> {
  constructor(private dataSource: DataSource) {
    super(Messages, dataSource.createEntityManager());
  }
}
