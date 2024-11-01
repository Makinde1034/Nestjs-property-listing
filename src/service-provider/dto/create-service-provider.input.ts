import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateServiceProviderInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
