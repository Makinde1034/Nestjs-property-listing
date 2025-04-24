import { BadRequestException, Injectable } from '@nestjs/common';
import { SystemFeatureRepository } from '../../listing/repositories/system-feature-settings.repository';
import { SystemFeatureSlug } from '../../../common/enums/system-features';
import { I18nService } from 'nestjs-i18n';
import { messagesKeys } from '../../../common/messages/app.strings';

@Injectable()
export class SystemfeatureService {
  constructor(
    private readonly systemFeatureRepository: SystemFeatureRepository,
    private readonly i18n: I18nService,
  ) { }
  
  async isFeatureEnabled(slug: SystemFeatureSlug) {
    try{
      const systemFeature = await this.systemFeatureRepository.findOne({
        where: {
          slug
        }
      })

      if (!systemFeature.isActive) {
        throw new BadRequestException(
          this.i18n.t(`messages.${messagesKeys.FEATURE_IS_TURNED_OFF}`),
        );
      }
      
    } catch (error) {
      throw new BadRequestException(
        error
      ); 
    }
   
  }


}
  