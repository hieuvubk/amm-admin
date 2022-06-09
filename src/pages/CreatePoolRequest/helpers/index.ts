import { BigNumber } from 'bignumber.js';
import { TokenPrice } from 'src/interfaces/pool';

export const validInputNumber = (value: string, numDecimal?: number): string => {
  value = value.toString();
  if (value && value.includes('.')) {
    return value.split('.')[0] + '.' + value.split('.')[1].slice(0, numDecimal || 18);
  }
  return value.toString();
};

export const filterAsset = (assets: Array<TokenPrice>, tokens: Array<string>): Array<TokenPrice> => {
  const result: Array<TokenPrice> = [];
  assets.forEach((asset) => {
    if (tokens.filter((token) => token === asset.id).length === 0) {
      result.push(asset);
    }
  });
  return result;
};

export const bnum = (val: string | number | BigNumber | undefined): BigNumber => {
  const number = typeof val === 'string' ? val : val ? val.toString() : '0';
  return new BigNumber(number);
};

export const isDigitalCreditSelected = (tokenAddress: string): boolean => {
  return tokenAddress.substring(0, 2) === '0x';
};
