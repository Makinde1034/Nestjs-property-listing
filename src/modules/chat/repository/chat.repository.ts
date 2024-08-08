import { DataSource, Repository } from 'typeorm';
import { Chat } from '../../../entities/chat.entity';
import { Injectable } from '@nestjs/common';
@Injectable()
export class ChatRepository extends Repository<Chat> {
  constructor(private dataSource: DataSource) {
    super(Chat, dataSource.createEntityManager());
  }
}
