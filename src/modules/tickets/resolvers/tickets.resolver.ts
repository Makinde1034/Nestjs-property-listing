/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TicketService } from '../services';
import { AccessTokenGuard, PermissionsGuard } from '../../auth/guards';
import { UseGuards, UseInterceptors } from '@nestjs/common';
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
import { Public } from '../../auth/decorators/permision.decorator';

import { AdminDashboardSort } from '../../admin/dto/request/admin-request';
import { PermissionsEnum } from '../../../common/enums/permission.enum';
import { GqlCacheInterceptor } from '../../../common/interceptors/cache-middleware';

@Resolver()
@Public()
export class TicketsResolver {
  constructor(private readonly ticketService: TicketService) {}

  /**
   * Create Issue
   * @async
   * @param {CreateIssueInput} RequestInput
   * @returns {Promise<string>}
   */
  @Mutation(() => Ticket)
  @UseGuards(AccessTokenGuard)
  @Public()
  // @Permissions(PermissionsEnum.Ticket)
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
  @Public()
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
  @Public()
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
  @UseInterceptors(GqlCacheInterceptor)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.SUPPORT_TICKETS_READ)
  async listTicketsForAdminAndStaff(
    @Context() ctx: any,
    @Args({ name: 'findOptions', nullable: true })
    findOptions: ListTicketInput,
  ) {
    return await this.ticketService.listTicketsForAdminAndStaff(findOptions);
  }
  @Query(() => TicketResponse)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.DASHBOARD_SUPPORT_RESPONSE_CARD)
  async listTicketsForAdminDashboard(
    @Context() ctx: any,
    @Args('findOptions')
    input: AdminDashboardSort,
  ) {
    return await this.ticketService.listTicketsForAdminDashboard(input);
  }
  /**
   * Update Ticket
   * @async
   * @param {UpdateTicketInput} RequestInput
   * @returns {Promise<Ticket[]>}
   */
  @Mutation(() => [Ticket])
  @Permissions(PermissionsEnum.SUPPORT_TICKETS_CHANGE_STATUS)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  async manageTicket(
    @Args('RequestInput') RequestInput: UpdateTicketInput,
    @Context() ctx: any,
  ): Promise<Ticket[]> {
    return await this.ticketService.updateTicket(ctx.req.user, RequestInput);
  }

  @Permissions(PermissionsEnum.RESPONSE_TEMPLATES_CREATE)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => ResponseTemplate)
  async createResponseTemplate(
    @Context()
    ctx: any,

    @Args('createResponseTemplateInput')
    createResponseTemplateInput: CreateResponseTemplateInput,
  ) {
    return await this.ticketService.createResponseTemplate(
      createResponseTemplateInput,
      ctx.req.user,
    );
  }

  @Permissions(PermissionsEnum.RESPONSE_TEMPLATES_READ)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Query(() => ResponseTemplate)
  async fetchOneResponseTemplate(
    @Args('id')
    id: string,
  ) {
    return await this.ticketService.findOneResponseTemplate(id);
  }

  @Permissions(PermissionsEnum.RESPONSE_TEMPLATES_READ)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Query(() => ResponseTemplateResponse)
  async fetchResponseTemplate(
    @Args('findOption', { nullable: true }) findOption: PaginateAndSort,
  ) {
    return await this.ticketService.findAllResponseTemplate(findOption);
  }

  @Permissions(PermissionsEnum.RESPONSE_TEMPLATES_DELETE)
  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Mutation(() => SuccessResponse)
  async deleteResponseTemplate(
    @Context()
    ctx: any,
    @Args('deleteResponseTemplate')
    deleteResponseTemplate: DeleteResponsetemplate,
  ) {
    return await this.ticketService.deleteResponseTemplate(
      deleteResponseTemplate,
      ctx.req.user,
    );
  }

  @UseGuards(AccessTokenGuard, PermissionsGuard)
  @Public()
  @Permissions(PermissionsEnum.RESPONSE_TEMPLATES_EDIT)
  @Mutation(() => ResponseTemplate)
  async updateResponseTemplate(
    @Context()
    ctx: any,
    @Args('updateResponseTemplateInput')
    updateResponseTemplateInput: UpdateResponseTemplateInput,
  ) {
    return await this.ticketService.updateResponseTemplate(
      updateResponseTemplateInput,
      ctx.req.user,
    );
  }

  @Query(() => [Ticket], { name: 'searchForTickets' })
  @Permissions(PermissionsEnum.SUPPORT_TICKETS_READ)
  @UseGuards(AccessTokenGuard)
  async searchForTickets(@Args('searchParam') searchParam: string) {
    return await this.ticketService.searchForTickets(searchParam);
  }

  @Query(() => [ResponseTemplate], { name: 'searchForResponseTemplate' })
  @Permissions(PermissionsEnum.RESPONSE_TEMPLATES_READ)
  @UseGuards(AccessTokenGuard)
  async searchForResponseTemplate(@Args('searchParam') searchParam: string) {
    return await this.ticketService.searchForResponseTemplate(searchParam);
  }
}
