import { CreateAdPackageInput } from './create-ad-package.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateAdPackageInput extends PartialType(CreateAdPackageInput) {
  @Field(() => Int)
  id: string;
}
