import data from './Common-Currency.json';

export interface ICommonCurrency {
  symbol: string;
  name: string;
  symbol_native: string;
  decimal_digits: number;
  rounding: number;
  code: string;
  name_plural: string;
}

export { data };
