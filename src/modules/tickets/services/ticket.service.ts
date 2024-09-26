/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { TicketRepository } from '../repositories';
import {
  CreateResponseTemplateInput,
  CreateTicketInput,
  DeleteResponsetemplate,
  ListTicketInput,
  UpdateResponseTemplateInput,
  UpdateTicketInput,
} from '../dtos';
import { AppStrings } from 'src/common/messages/app.strings';
import { Ticket, User } from 'src/entities';
import { IssueRepository } from '../../issue/repositories';
import { TicketStatus } from 'src/common/enums';
import { FindManyOptions, In } from 'typeorm';
import { ChildIssueRepository } from '../../issue/repositories/child-issue.repository';
import { ResponseTemplateRepository } from '../repositories/response-template.repository';
import { SuccessResponse } from '../../../common/utils/success.response';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';
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
    try {
      return await this.ticketRepository.findOneOrFail({
        where: { id: id },
        relations: ['reporter'],
      });
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
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
        options.where = { status: input.status, reporter: { id: user.id } };
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
      // Validate and limit the number of results per request
      const take = input.take && input.take <= 20 ? input.take : 20;
      const skip = input.skip || 0;

      // Create a query builder instance for the Ticket entity
      const queryBuilder = this.ticketRepository.createQueryBuilder('ticket');

      // Dynamically add WHERE clause if status is provided in input
      if (input.status) {
        queryBuilder.where('ticket.status = :status', { status: input.status });
      }

      // Utility function to quote column names to prevent SQL injection
      const quotedColumnName = (column: string) => `"ticket"."${column}"`;

      // Build the main query to fetch ticket entities with pagination and joins
      const [tickets, count] = await queryBuilder
        .leftJoinAndSelect('ticket.parentIssue', 'parentIssue')
        .leftJoinAndSelect('ticket.childIssue', 'childIssue')
        .leftJoinAndSelect('ticket.reporter', 'reporter')
        .take(take)
        .skip(skip)
        .getManyAndCount();

      // Calculate counts for open and closed tickets using separate subqueries
      const openCount = await this.ticketRepository
        .createQueryBuilder('ticket')
        .where(`${quotedColumnName('closedAt')} IS NULL`)
        .getCount();

      const closedCount = await this.ticketRepository
        .createQueryBuilder('ticket')
        .where(`${quotedColumnName('closedAt')} IS NOT NULL`)
        .getCount();

      const agingCount = await this.ticketRepository
        .createQueryBuilder('ticket')
        .where(
          `${quotedColumnName('createdAt')} < CURRENT_DATE - INTERVAL '4 days'`,
        )
        .getCount();

      // Construct analysis object for open, closed, and aging tickets
      const analysis = {
        open: openCount,
        closed: closedCount,
        aging: agingCount,
      };

      // Return the results including the ticket list, total count, and analysis
      return { ticket: tickets, total: count, analysis };
    } catch (error) {
      // Log the error for debugging and throw a user-friendly exception
      this.logger.error(
        `Error fetching tickets: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        'Failed to fetch tickets. Please try again later.',
      );
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
  async updateTicket(user: User, input: UpdateTicketInput): Promise<Ticket[]> {
    try {
      const { ticketId, status } = input;
      const tickets = await this.ticketRepository.find({
        where: {
          id: In(ticketId),
        },
      });

      if (tickets.length === 0) {
        throw new NotFoundException('Tickets not found');
      }

      // Prepare tickets for update
      const ticketToUpdate = tickets.map((ticket) => {
        const updatedTicket: Partial<Ticket> = {
          status,
          assignedAt: ticket.assignedAt ?? new Date(),
          isOpen: true,
          support: user,
        };
        return { ...ticket, ...updatedTicket };
      });

      // Save and return the updated tickets
      if (
        status === TicketStatus.IN_PROGRESS ||
        status === TicketStatus.CLOSE ||
        status === TicketStatus.OPEN
      ) {
        return await this.ticketRepository.save(ticketToUpdate);
      }

      throw new BadRequestException('Invalid status update');
    } catch (error) {
      this.logger.error('Error updating tickets', error.stack);
      throw new BadRequestException(error.message);
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

  async findAllResponseTemplate(findOption: PaginateAndSort) {
    try {
      const [responseTemplate, total] =
        await this.responseTemplateRepostiory.findAndCount({
          take: findOption.take,
          skip: findOption.skip,
        });
      return { responseTemplate, total };
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async deleteResponseTemplate(deleteResponseTemplate: DeleteResponsetemplate) {
    try {
      const idsToUpdate: string[] = [];
      const template = await this.responseTemplateRepostiory.find({
        where: {
          id: In(deleteResponseTemplate.id),
        },
      });

      template.map((element) => {
        idsToUpdate.push(element.id);
      });

      if (!template) {
        throw new BadRequestException(AppStrings.NOT_FOUND);
      }

      const { affected } =
        await this.responseTemplateRepostiory.softDelete(idsToUpdate);

      if (affected > 0) {
        return new SuccessResponse(AppStrings.DELETED_SUCCESSFULLY);
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

  async checkIfTicketStillOpen(id: string) {
    try {
      const ticket = await this.ticketRepository.findOneByOrFail({ id });

      if (!ticket.isOpen) {
        return false;
      }
      return true;
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }
}
