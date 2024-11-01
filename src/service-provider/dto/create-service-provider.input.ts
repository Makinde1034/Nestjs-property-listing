import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateServiceProviderInput {
  @Field()
  id: string;
}
