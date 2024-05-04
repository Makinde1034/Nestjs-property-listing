/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Module } from '@nestjs/common';
import { TicketsResolver } from './resolvers';
import { TicketService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from 'src/entities';
import { TicketRepository } from './repositories';
import { IssueModule } from '../issue/issue.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket]), IssueModule],
  providers: [TicketsResolver, TicketService, TicketRepository],
})
export class TicketsModule {}
