export const DEFAULT_PAGE = {
  limit: 10,
  page: 1,
};
export const FORMAT_DATE = 'DD/MM/YYYY';
export const SORT = {
  INCREASE: 'ASC',
  DECREASE: 'DESC',
};
export const renderStatus = (value: number): string => {
  switch (value) {
    case 0:
      return 'Disabled';
    case 1:
      return 'Active';
    default:
      return '-';
  }
};
