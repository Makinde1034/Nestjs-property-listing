/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TicketService } from '../services';
import { AccessTokenGuard, PermissionsGuard } from '../../auth/guards';
import { UseGuards } from '@nestjs/common';
import { CreateTicketInput, ListTicketInput, UpdateTicketInput } from '../dtos';
import { Ticket } from 'src/entities';
import { Permissions } from 'src/common/decorator/permission';

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
  @Permissions('read-support-tickets')
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async listTickets(
    @Args({ name: 'QueryInput', nullable: true, type: () => ListTicketInput })
    input: ListTicketInput,
  ): Promise<Ticket[]> {
    return await this.ticketService.listTickets(input);
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
}
