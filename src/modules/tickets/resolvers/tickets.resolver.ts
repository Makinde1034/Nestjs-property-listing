/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TicketService } from '../services';
import { AccessTokenGuard, PermissionsGuard } from '../../auth/guards';
import { UseGuards } from '@nestjs/common';
import {
  CreateResponseTemplateInput,
  CreateTicketInput,
  ListTicketInput,
  UpdateResponseTemplateInput,
  UpdateTicketInput,
} from '../dtos';
import { Ticket } from 'src/entities';
import { Permissions } from 'src/common/decorator/permission';
import { TicketResponse } from '../dtos/response/ticket-response';
import { ResponseTemplate } from '../../../entities/response-template.entity';
import { SuccessResponse } from '../../../common/utils/success.response';

@Resolver()
export class TicketsResolver {
  constructor(private readonly ticketService: TicketService) {}

  /**
   * Create Issue
   *
   * @async
   * @param {CreateIssueInput} RequestInput
   * @returns {Promise<string>}
   */
  @Mutation(() => String)
  @UseGuards(AccessTokenGuard)
  // @Permissions('create-support-tickets')
  async createTicket(
    @Args('RequestInput') RequestInput: CreateTicketInput,
    @Context() ctx: any,
  ): Promise<string> {
    return await this.ticketService.raiseTicket(ctx.req.user, RequestInput);
  }

  /**
   * Get Ticket
   *
   * @async
   * @param {string} ticketId
   * @returns {Promise<Ticket>}
   */
  @Query(() => Ticket)
  @Permissions('read-support-tickets')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async getTicket(@Args('ticketId') ticketId: string): Promise<Ticket> {
    return await this.ticketService.getTicket(ticketId);
  }

  /**
   * Get Ticket
   *
   * @async
   * @param {ListTicketInput} input
   * @returns {Promise<Ticket>}
   */
  @Query(() => [Ticket])
  // @Permissions('read-support-tickets')
  @UseGuards(AccessTokenGuard)
  async listTickets(
    @Context() ctx: any,
    @Args({ name: 'findOptions', nullable: true, type: () => ListTicketInput })
    input: ListTicketInput,
  ): Promise<Ticket[]> {
    return await this.ticketService.listTickets(ctx.req.user, input);
  }

  /**
   * Get Ticket
   *
   * @async
   * @param {ListTicketInput} input
   * @returns {Promise<Ticket>}
   */
  @Query(() => TicketResponse)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions('read-support-tickets')
  async listTicketsForAdminAndStaff(
    @Context() ctx: any,
    @Args({ name: 'findOptions', nullable: true, type: () => ListTicketInput })
    input: ListTicketInput,
  ) {
    return await this.ticketService.listTicketsForAdminAndStaff(input);
  }

  /**
   * Update Ticket
   *
   * @async
   * @param {UpdateTicketInput} RequestInput
   * @returns {Promise<Ticket>}
   */
  @Mutation(() => Ticket)
  @Permissions('update-support-tickets')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async manageTicket(
    @Args('RequestInput') RequestInput: UpdateTicketInput,
    @Context() ctx: any,
  ): Promise<Ticket> {
    return await this.ticketService.updateTicket(ctx.req.user, RequestInput);
  }

  @Permissions('create-support-tickets')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => ResponseTemplate)
  async createResponseTemplate(
    @Args('createResponseTemplateInput')
    createResponseTemplateInput: CreateResponseTemplateInput,
  ) {
    return await this.ticketService.createResponseTemplate(
      createResponseTemplateInput,
    );
  }

  @Permissions('create-support-tickets')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Query(() => ResponseTemplate)
  async fetchOneResponseTemplate(
    @Args('id')
    id: string,
  ) {
    return await this.ticketService.findOneResponseTemplate(id);
  }

  @Permissions('create-support-tickets')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Query(() => [ResponseTemplate])
  async fetchResponseTemplate() {
    return await this.ticketService.findAllResponseTemplate();
  }

  @Permissions('create-support-tickets')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => SuccessResponse)
  async deleteResponseTemplate(
    @Args('id')
    id: string,
  ) {
    return await this.ticketService.deleteResponseTemplate(id);
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions('create-support-tickets')
  @Mutation(() => ResponseTemplate)
  async updateResponseTemplate(
    @Args('updateResponseTemplateInput')
    updateResponseTemplateInput: UpdateResponseTemplateInput,
  ) {
    return await this.ticketService.updateResponseTemplate(
      updateResponseTemplateInput,
    );
  }
}
