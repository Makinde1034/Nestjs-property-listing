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
  DeleteResponsetemplate,
  ListTicketInput,
  UpdateResponseTemplateInput,
  UpdateTicketInput,
} from '../dtos';
import { Ticket } from 'src/entities';
import { Permissions } from 'src/common/decorator/permission';
import {
  ResponseTemplateResponse,
  TicketResponse,
} from '../dtos/response/ticket-response';
import { ResponseTemplate } from '../../../entities/response-template.entity';
import { SuccessResponse } from '../../../common/utils/success.response';
import { PaginateAndSort } from '../../core/dto/pagination-and-sort.dto';

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
  @Mutation(() => Ticket)
  @UseGuards(AccessTokenGuard)
  // @Permissions('create-support-tickets')
  async createTicket(
    @Args('RequestInput') RequestInput: CreateTicketInput,
    @Context() ctx: any,
  ): Promise<Ticket> {
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
  // @Permissions('read-support-tickets')
  @UseGuards(AccessTokenGuard)
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
   * @async
   * @param {UpdateTicketInput} RequestInput
   * @returns {Promise<Ticket[]>}
   */
  @Mutation(() => [Ticket])
  @Permissions('update-support-tickets')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async manageTicket(
    @Args('RequestInput') RequestInput: UpdateTicketInput,
    @Context() ctx: any,
  ): Promise<Ticket[]> {
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
  @Query(() => ResponseTemplateResponse)
  async fetchResponseTemplate(
    @Args('findOption', { nullable: true }) findOption: PaginateAndSort,
  ) {
    return await this.ticketService.findAllResponseTemplate(findOption);
  }

  @Permissions('create-support-tickets')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => SuccessResponse)
  async deleteResponseTemplate(
    @Args('deleteResponseTemplate')
    deleteResponseTemplate: DeleteResponsetemplate,
  ) {
    return await this.ticketService.deleteResponseTemplate(
      deleteResponseTemplate,
    );
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

  @Query(() => [Ticket], { name: 'searchForTickets' })
  @UseGuards(AccessTokenGuard)
  async searchForTickets(@Args('searchParam') searchParam: string) {
    return await this.ticketService.searchForTickets(searchParam);
  }

  @Query(() => [Ticket], { name: 'searchForResponseTemplate' })
  @UseGuards(AccessTokenGuard)
  async searchForResponseTemplate(@Args('searchParam') searchParam: string) {
    return await this.ticketService.searchForResponseTemplate(searchParam);
  }
}
