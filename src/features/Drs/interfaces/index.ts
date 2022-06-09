export interface Drs {
  id?: number;
  symbol?: string;
  digital?: string;
  token?: string;
  collateral_fiat?: string;
  collateral_usd?: string;
  coin?: string;
  cash?: string;
}
export interface IFilter {
  limit?: number;
  page?: number;
}
