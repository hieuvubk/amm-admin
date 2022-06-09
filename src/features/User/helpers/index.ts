import { WALLET_STATUS } from 'src/features/User/constants';

export const formatStatusToString = (status: number): string | undefined => {
  const result = WALLET_STATUS.find((value) => value.value === status);

  return result?.label;
};
