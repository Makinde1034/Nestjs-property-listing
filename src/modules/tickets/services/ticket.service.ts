/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { TicketRepository } from '../repositories';
import {
  CreateResponseTemplateInput,
  CreateTicketInput,
  ListTicketInput,
  UpdateResponseTemplateInput,
  UpdateTicketInput,
} from '../dtos';
import { AppStrings } from 'src/common/messages/app.strings';
import { Ticket, User } from 'src/entities';
import { IssueRepository } from '../../issue/repositories';
import { TicketStatus } from 'src/common/enums';
import { FindManyOptions } from 'typeorm';
import { ChildIssueRepository } from '../../issue/repositories/child-issue.repository';
import { ResponseTemplateRepository } from '../repositories/response-template.repository';
import { ResponseTemplate } from '../../../entities/response-template.entity';
import { SuccessResponse } from '../../../common/utils/success.response';
@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private responseTemplateRepostiory: ResponseTemplateRepository,

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
  async raiseTicket(user: User, input: CreateTicketInput): Promise<Ticket> {
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
    const ticket = await this.ticketRepository.save(data);

    return ticket;
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
      const queryBuilder = this.ticketRepository.createQueryBuilder('ticket');

      if (input.status) {
        queryBuilder.where('ticket.status = :status', { status: input.status });
      }

      const quotedColumnName = (column: string) => `"ticket"."${column}"`;

      const result = await queryBuilder
        .addSelect('COUNT(*) OVER()', 'total')
        .addSelect(
          `SUM(CASE WHEN ${quotedColumnName('closedAt')} IS NULL THEN 1 ELSE 0 END) OVER()`,
          'open',
        )
        .addSelect(
          `SUM(CASE WHEN ${quotedColumnName('closedAt')} IS NOT NULL THEN 1 ELSE 0 END) OVER()`,
          'closed',
        )
        .addSelect(
          `SUM(CASE WHEN ${quotedColumnName('createdAt')} < CURRENT_DATE - INTERVAL '4 days' THEN 1 ELSE 0 END) OVER()`,
          'aging',
        )
        .getRawAndEntities();

      const tickets = result.entities;
      const countsResult = result.raw[0];

      const analysis = {
        open: Number(countsResult.open),
        closed: Number(countsResult.closed),
        aging: Number(countsResult.aging),
      };

      return { tickets, analysis };
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

  /***************************
   *Response template
   ***************************/

  async createResponseTemplate(
    createResponseTemplateInput: CreateResponseTemplateInput,
  ) {
    try {
      return await this.responseTemplateRepostiory.save(
        createResponseTemplateInput,
      );
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async findOneResponseTemplate(id: string) {
    try {
      return await this.responseTemplateRepostiory.findOneByOrFail({ id });
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async findAllResponseTemplate(): Promise<ResponseTemplate[]> {
    try {
      return await this.responseTemplateRepostiory.find();
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException();
    }
  }

  async deleteResponseTemplate(id: string) {
    try {
      const template = await this.responseTemplateRepostiory.findOneBy({
        id: id,
      });

      if (!template) {
        throw new BadRequestException(AppStrings.NOT_FOUND);
      }

      const { affected } = await this.responseTemplateRepostiory.softDelete({
        id: template.id,
      });

      if (affected > 0) {
        return new SuccessResponse(AppStrings.ATTRIBUTE_DELETED_SUCCESSFULLY);
      }
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(AppStrings.NOT_FOUND, error.error);
    }
  }
  async updateResponseTemplate(
    updateResponseTemplate: UpdateResponseTemplateInput,
  ) {
    try {
      const template = await this.responseTemplateRepostiory.findOneByOrFail({
        id: updateResponseTemplate.id,
      });
      if (!template) {
        throw new BadRequestException(AppStrings.NOT_FOUND);
      }
      const { affected } = await this.responseTemplateRepostiory.update(
        template.id,
        {
          ...updateResponseTemplate,
        },
      );

      if (affected > 0) {
        return await this.responseTemplateRepostiory.findOneByOrFail({
          id: template.id,
        });
      }
    } catch (error) {
      this.logger.log(error);

      throw new BadRequestException(error);
    }
  }
}
