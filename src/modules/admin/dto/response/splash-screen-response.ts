import { Field, ObjectType } from '@nestjs/graphql';
import { SplashScreen } from '../../../../entities/splash-screen.entity';
@ObjectType()
export class SplashScreenResponse {
  @Field(() => [SplashScreen])
  splashScreen: SplashScreen[];
  @Field()
  total: number;
}
