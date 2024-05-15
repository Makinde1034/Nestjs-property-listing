/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { BadRequestException, Injectable } from '@nestjs/common';
import { TicketRepository } from '../repositories';
import { CreateTicketInput, ListTicketInput, UpdateTicketInput } from '../dtos';
import { AppStrings } from 'src/common/messages/app.strings';
import { Ticket, User } from 'src/entities';
import {
  IssueCategoryRepository,
  IssueRepository,
} from '../../issue/repositories';
import { TicketStatus } from 'src/common/enums';
import { FindManyOptions } from 'typeorm';

@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly issueCategoryRepository: IssueCategoryRepository,
    private readonly issueRepository: IssueRepository,
  ) {}

  /**
   * Raise Issue/ Create ticket
   *
   * @async
   * @param {User} user
   * @param {CreateTicketInput} input
   * @returns {Promise<string>}
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

  /**
   * Get ticket by id
   *
   * @async
   * @param {string} id
   * @returns {Promise<Ticket>}
   */
  async getTicket(id: string): Promise<Ticket> {
    return await this.ticketRepository.findByIdOrFail(id);
  }

  /**
   * List tickets
   *
   * @async
   * @param {ListTicketInput} input
   * @returns {Promise<Ticket[]>}
   */
  async listTickets(input?: ListTicketInput): Promise<Ticket[]> {
    try {
      const options: FindManyOptions<Ticket> = {};
      if (input.status) {
        options.where = { status: input.status };
      }
      const tickets = await this.ticketRepository.findAll(options);
      return tickets;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  /**
   * Update ticket
   *
   * @async
   * @param {User} user
   * @param {UpdateTicketInput} input
   * @returns {Promise<Ticket>}
   */
  async updateTicket(user: User, input: UpdateTicketInput): Promise<Ticket> {
    const { ticketId, status } = input;
    const ticket = await this.ticketRepository.findByIdOrFail(ticketId);

    const data: Partial<Ticket> = {
      status,
      assignedAt: ticket.assignedAt ?? new Date(),
      support: user,
    };
    return await this.ticketRepository.update(ticketId, data);
  }
}
