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
import { ResponseTemplate } from '../../entities/response-template.entity';
import { ResponseTemplateRepository } from './repositories/response-template.repository';
import { ChildIssueRepository } from '../issue/repositories/child-issue.repository';
import { IssueRepository } from '../issue/repositories';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, ResponseTemplate]), IssueModule],
  providers: [
    TicketsResolver,
    TicketService,
    TicketRepository,
    ResponseTemplateRepository,
    ChildIssueRepository,
    IssueRepository,
  ],
  exports: [
    TicketRepository,
    TicketService,
    ResponseTemplateRepository,
    ChildIssueRepository,
    IssueRepository,
  ],
})
export class TicketsModule {}
