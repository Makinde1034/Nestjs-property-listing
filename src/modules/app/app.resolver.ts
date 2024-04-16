import { Query, Resolver } from '@nestjs/graphql';
import { I18n, I18nContext } from 'nestjs-i18n';

@Resolver()
export class AppResolver {
  @Query(() => String, { name: 'app' })
  index(@I18n() i18n: I18nContext): string {
    return i18n.t('messages.app.hello');
  }
}
