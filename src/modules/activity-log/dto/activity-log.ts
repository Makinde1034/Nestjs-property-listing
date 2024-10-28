import { ActivityEnum } from '../../../common/enums/activitys';

export class CreateActivityLog {
  userId: string;
  scope: string;
  action: ActivityEnum;
  details?: Record<string, any>;
}
