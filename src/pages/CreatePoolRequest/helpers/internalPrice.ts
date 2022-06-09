import BigNumber from 'bignumber.js';
import { setDataPrecision } from 'src/features/Pools/helper/dataFormater';

export interface TokenPriceParam {
  symbol: string;
  balance: string;
  weight: string;
}

export function getPrice(rowToken: TokenPriceParam, colToken: TokenPriceParam): string {
  const price = new BigNumber(colToken.balance)
    .div(colToken.weight)
    .div(new BigNumber(rowToken.balance).div(rowToken.weight))
    .toString();
  return setDataPrecision(price, 4);
}
