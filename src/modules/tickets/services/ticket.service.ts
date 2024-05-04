/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Injectable } from '@nestjs/common';
import { TicketRepository } from '../repositories';
import { CreateTicketInput } from '../dtos';
import { AppStrings } from 'src/common/messages/app.strings';
import { Ticket, User } from 'src/entities';
import {
  IssueCategoryRepository,
  IssueRepository,
} from '../../issue/repositories';
import { TicketStatus } from 'src/common/enums';

@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly issueCategoryRepository: IssueCategoryRepository,
    private readonly issueRepository: IssueRepository,
  ) {}

  /**
   * Raise Issue
   *
   * @async
   * @param {User} user
   * @param {CreateTicketInput} input
   * @returns {Promise<IssueCategory>}
   */
  async raiseTicket(user: User, input: CreateTicketInput): Promise<string> {
    const { issuCategoryId, issueId } = input;
    const issue = await this.issueRepository.findByIdOrFail(issueId);
    const category =
      await this.issueCategoryRepository.findByIdOrFail(issuCategoryId);

    const data: Partial<Ticket> = {
      openedAt: new Date(),
      reporter: user,
      type: category.placement,
      issueCategory: category,
      issue,
      isOpen: true,
      status: TicketStatus.OPEN,
    };
    await this.ticketRepository.create(data);

    return AppStrings.TICKET_RAISED_SUCCESSFULLY;
  }
}
