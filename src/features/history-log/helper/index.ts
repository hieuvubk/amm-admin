import { ActivityList } from 'src/features/history-log/constants/index';
import _ from 'lodash';
export const renderActivites = (activity_type: string): string | undefined => {
  const list = _.find(ActivityList, (item) => {
    {
      return item.value === activity_type;
    }
  });
  return list?.label;
};
