/*
 * Copyright (c) 2024, Waseet LLC. All rights reserved.
 * For license. See license.txt
 */

import { Field, ObjectType } from '@nestjs/graphql';
import { WorkFlow } from '../../../../entities/workFlow.entity';
@ObjectType()
export class WorkFlowResponse {
  @Field(() => [WorkFlow], { nullable: true })
  workflow: WorkFlow[];

  @Field()
  total: number;
}
