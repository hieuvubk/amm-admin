import { STELLAR_ASSET_TYPE } from 'src/constants/stellarAssetType';

export const getStellarAssetType = (type: number): string => {
  return type === STELLAR_ASSET_TYPE.NATIVE
    ? 'native'
    : type === STELLAR_ASSET_TYPE.CREDIT_ALPHANUM4
    ? 'credit_alphanum4'
    : 'credit_alphanum12';
};
