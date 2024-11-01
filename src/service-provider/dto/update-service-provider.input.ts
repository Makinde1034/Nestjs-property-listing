import { CreateServiceProviderInput } from './create-service-provider.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateServiceProviderInput extends PartialType(
  CreateServiceProviderInput,
) {
  @Field()
  id: string;
}
