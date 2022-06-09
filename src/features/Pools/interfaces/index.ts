import { POOL_TYPE } from 'src/features/Pools/constants';

export interface IFilter {
  id?: string;
  tokensList_contains?: string[];
  crp: boolean;
}

export const DefaultFilter: IFilter = {
  crp: POOL_TYPE.FIXED.value,
};
