/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { TicketRepository } from '../repositories';
import { CreateTicketInput, ListTicketInput, UpdateTicketInput } from '../dtos';
import { AppStrings } from 'src/common/messages/app.strings';
import { Ticket, User } from 'src/entities';
import { IssueRepository } from '../../issue/repositories';
import { TicketStatus } from 'src/common/enums';
import { FindManyOptions } from 'typeorm';
import { ChildIssueRepository } from '../../issue/repositories/child-issue.repository';

@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,

    private childIssueRepository: ChildIssueRepository,
    private readonly issueRepository: IssueRepository,
  ) {}
  logger = new Logger(TicketService.name);

  /**
   * Raise Issue/ Create ticket
   *
   * @async
   * @param {User} user
   * @param {CreateTicketInput} input
   * @returns {Promise<string>}
   */
  async raiseTicket(user: User, input: CreateTicketInput): Promise<string> {
    const { issueId, childIssueId } = input;
    const parentIssue = await this.issueRepository.findOneByOrFail({
      id: issueId,
    });

    const childIssue = await this.childIssueRepository.findOneByOrFail({
      id: childIssueId,
    });

    const data: Partial<Ticket> = {
      openedAt: new Date(),
      reporter: user,
      parentIssue,
      childIssue: childIssue,
      isOpen: true,
      status: TicketStatus.OPEN,
    };
    await this.ticketRepository.save(data);

    return AppStrings.TICKET_RAISED_SUCCESSFULLY;
  }

  /**
   * Get ticket by id
   * @async
   * @param {string} id
   * @returns {Promise<Ticket>}
   */
  async getTicket(id: string): Promise<Ticket> {
    return await this.ticketRepository.findOneByOrFail({ id: id });
  }
  /**
   * List tickets
   * @async
   * @param {ListTicketInput} input
   * @returns {Promise<Ticket[]>}
   */
  async listTickets(user: User, input?: ListTicketInput): Promise<Ticket[]> {
    try {
      const options: FindManyOptions<Ticket> = {};
      if (input.status) {
        options.where = { status: input.status };
      } else {
        options.where = {
          reporter: { id: user.id },
        };
        const tickets = await this.ticketRepository.find(options);
        return tickets;
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async listTicketsForAdminAndStaff(input?: ListTicketInput) {
    try {
      const options: FindManyOptions<Ticket> = {};
      if (input.status) {
        options.where = { status: input.status };
      }
      const quotedColumnName = (column: string) => `"ticket"."${column}"`;

      const [tickets, countsResult] = await Promise.all([
        this.ticketRepository.find(options),

        this.ticketRepository
          .createQueryBuilder('ticket')
          .select('COUNT(*)', 'total')
          .addSelect(
            `SUM(CASE WHEN ${quotedColumnName('closedAt')} IS NULL THEN 1 ELSE 0 END)`,
            'open',
          )
          .addSelect(
            `SUM(CASE WHEN ${quotedColumnName('closedAt')} IS NOT NULL THEN 1 ELSE 0 END)`,
            'closed',
          )
          .addSelect(
            `SUM(CASE WHEN ${quotedColumnName('createdAt')} < CURRENT_DATE - INTERVAL '4 days' THEN 1 ELSE 0 END)`,
            'aging',
          )
          .getRawOne(),
      ]);

      const analysis = {
        open: Number(countsResult.open),
        closed: Number(countsResult.closed),
        aging: Number(countsResult.aging),
      };
      return { ticket: tickets, analysis };
    } catch (error) {
      this.logger.log(error);
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
    const ticket = await this.ticketRepository.findOneByOrFail({
      id: ticketId,
    });

    const data: Partial<Ticket> = {
      status,
      assignedAt: ticket.assignedAt ?? new Date(),
      support: user,
    };
    const { affected } = await this.ticketRepository.update(ticketId, data);
    if (affected) {
      return this.ticketRepository.findOneByOrFail({ id: ticketId });
    }
  }
}
