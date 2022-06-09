/* eslint-disable @typescript-eslint/no-explicit-any */
import { Asset } from 'stellar-sdk';
import { getAsset } from 'src/helpers/stellarHelper/getAsset';

export const getAllAssetsFromCoins = (coins: any[]): Array<Asset> => {
  // filter stellar coin
  let stellarCoins = [];
  if (coins.length) {
    stellarCoins = coins.filter((value: any) => {
      return value.symbol && value.stellar_issuer && value.type;
    });
  }

  return stellarCoins.map((value: any) => {
    return getAsset(value.symbol, value.stellar_issuer, value.type);
  });
};

export default { getAllAssetsFromCoins };
