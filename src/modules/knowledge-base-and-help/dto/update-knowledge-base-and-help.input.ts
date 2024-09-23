import { CreateKnowledgeBaseAndHelpInput } from './create-knowledge-base-and-help.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateKnowledgeBaseAndHelpInput extends PartialType(CreateKnowledgeBaseAndHelpInput) {
  @Field(() => Int)
  id: number;
}
