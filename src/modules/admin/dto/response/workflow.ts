import { Field, ObjectType } from '@nestjs/graphql';
import { WorkFlow } from '../../../../entities/workFlow.entity';
@ObjectType()
export class WorkFlowResponse {
  @Field(() => [WorkFlow], { nullable: true })
  workflow: WorkFlow[];

  @Field()
  total: number;
}
