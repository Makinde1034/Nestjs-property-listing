/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { TicketService } from '../services';
import { AccessTokenGuard } from '../../auth/guards';
import { UseGuards } from '@nestjs/common';
import { CreateTicketInput } from '../dtos';

@Resolver()
export class TicketsResolver {
  constructor(private readonly ticketService: TicketService) {}

  /**
   * Create Issue
   *
   * @async
   * @param {CreateIssueInput} RequestInput
   * @returns {Promise<Issue>}
   */
  @Mutation(() => String)
  @UseGuards(AccessTokenGuard)
  async createIssue(
    @Args('RequestInput') RequestInput: CreateTicketInput,
    @Context() ctx: any,
  ): Promise<string> {
    return await this.ticketService.raiseTicket(ctx.req.user, RequestInput);
  }
}
