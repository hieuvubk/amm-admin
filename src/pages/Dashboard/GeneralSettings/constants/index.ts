export interface General {
  id?: number;
  interval: string;
  by_the_interval: string;
  annualized: string;
  intervalData: number;
}

export interface UpdateInterval {
  interval: Array<General>;
  filter: IFilter;
}
export interface File {
  size?: number;
  name?: string;
  type?: string;
}
export interface IFilter {
  limit?: number;
  page?: number;
}
export const GENERAL_DATA = [
  {
    id: 1,
    interval: '1',
    by_interval: '0.123456',
    annualized: '4.72%',
    width: 200,
  },
  {
    id: 2,
    interval: '5',
    by_interval: '0.123456',
    annualized: '4.72%',
    width: 200,
  },
  {
    id: 3,
    interval: '15',
    by_interval: '0.445566',
    annualized: '8.32%',
    width: 200,
  },
  {
    id: 4,
    interval: '60',
    by_interval: '0.987654',
    annualized: '99.9%',
    width: 200,
  },
  {
    id: 5,
    interval: '1440',
    by_interval: '0.987654',
    annualized: '99.9%',
    width: 200,
  },
  {
    id: 6,
    interval: '43200',
    by_interval: '0.987654',
    annualized: '99.9%',
    width: 200,
  },
];
export const CUSTOMER_TITLE_GENERAL_CSV = [
  { id: 'interval', displayName: 'Interval' },
  { id: 'by_the_interval', displayName: 'By the interval' },
  { id: 'annualized', displayName: 'Annualized' },
];
export const FIX_VALUE_GENERAL_CSV = ['1 minute', '5 minutes', '15 minutes', '1 hour', '1 day', '1 month'];
export const PAGINATION = {
  DEFAULT_CURRENT_PAGE: 1,
};

export const ONE_MINUTE = 60;
export const PERCENT_NUMBER_REGEX = `^[0-9]{0,9}.[0-9]{0,9}$`;
export const FLOAT_NUMBER = `^\d{0,3}\.\d{0,4}$`;
