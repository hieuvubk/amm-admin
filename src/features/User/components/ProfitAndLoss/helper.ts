import { BigNumber } from 'bignumber.js';
import { getRateFromCurrencies } from 'src/features/User/helpers/helper';
import { SeriesChartBalances } from 'src/features/User/interfaces';
import { FunctionCurrency } from 'src/interfaces/user';
import { RootState } from 'src/store/store';
import { IPnl, IPnlResponse, IPnlsReduceAmount } from './interface';
const DEFAULT_PNL = {
  date: '',
  balance_value: 0,
  trade_value: 0,
  transfer_value: 0,

  pnlDaily: 0,
  pnlCommulativeAmount: 0,
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const qsStringRemoveFalsy = (obj: { [key: string]: any }): { [key: string]: any } => {
  Object.keys(obj).forEach((k) => obj[k] == null && delete obj[k]);
  return obj;
};

export const renderDateSubmit = (date: Date): string => {
  return `${new Date(date).getFullYear()}-${` 0${new Date(date).getMonth() + 1}`.slice(-2)}-${` 0${new Date(
    date,
  ).getDate()}`.slice(-2)}`;
};

export const setTimeUTC = (hour = 0, min = 0, s = 0, ms = 0): Date => {
  return new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), hour, min, s, ms));
};

export const convertTimeSubmit = (date: Date): Date => {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
};

export const getFirstValueBalance = (arr: IPnl[]): number => {
  return new BigNumber(arr.find((i) => i.balance_value > 0)?.balance_value || 0).toNumber();
};

// Reduce date and total balance_value each symbol
export const reduceTotalBalancesByDate = (arr: IPnlResponse[]): IPnlsReduceAmount[] => {
  return arr.reduce((total: IPnlsReduceAmount[], item: IPnlResponse) => {
    const indexFirstItem = total.findIndex((v) => v.date === item.date);
    if (indexFirstItem !== -1) {
      total.splice(indexFirstItem, 1, {
        date: item.date,
        wallet: item.wallet,
        balance_value: new BigNumber(total[indexFirstItem].balance_value)
          .plus(new BigNumber(item.balance).times(new BigNumber(item.rate)))
          .toNumber(),
        trade_value: new BigNumber(total[indexFirstItem].trade_value)
          .plus(new BigNumber(item.trade_amount).times(new BigNumber(item.rate)))
          .toNumber(),
        transfer_value: new BigNumber(total[indexFirstItem].transfer_value)
          .plus(new BigNumber(item.transfer_amount).times(new BigNumber(item.rate)))
          .toNumber(),
      });
    } else {
      total.push({
        date: item.date,
        wallet: item.wallet,
        balance_value: new BigNumber(item.balance).times(new BigNumber(item.rate)).toNumber(),
        trade_value: new BigNumber(item.trade_amount).times(new BigNumber(item.rate)).toNumber(),
        transfer_value: new BigNumber(item.transfer_amount).times(new BigNumber(item.rate)).toNumber(),
      });
    }
    return total;
  }, []);
};

export const returnPnlFromTotalBalancesByDate = (arr: IPnlsReduceAmount[]): IPnl[] => {
  return arr.reduce((total: IPnl[], item: IPnlsReduceAmount, index: number) => {
    if (index === 0) {
      // const itemNext = arr[1];
      const itemPrev = total[index - 1] || DEFAULT_PNL;
      total.push({
        ...item,
        pnlDaily: new BigNumber(item.balance_value)
          .minus(itemPrev.balance_value)
          .minus(new BigNumber(item.transfer_value))
          .toNumber(),

        pnlCommulativeAmount: 0,
      });
    } else {
      const itemPrev = total[index - 1];
      total.push({
        ...item,
        // pnl =  today_balance - prev_balance - today_transfer
        pnlDaily: new BigNumber(item.balance_value)
          .minus(itemPrev.balance_value)
          .minus(new BigNumber(item.transfer_value))
          .toNumber(),

        pnlCommulativeAmount: new BigNumber(itemPrev.pnlCommulativeAmount)
          .plus(new BigNumber(item.balance_value))
          .minus(new BigNumber(itemPrev.balance_value))
          .minus(new BigNumber(item.transfer_value))
          .toNumber(),
      });
    }
    return total;
  }, []);
};

// Asset Allocation
export const reduceTotalBalancesBySymbol = (arr: IPnlResponse[], state: RootState): SeriesChartBalances[] => {
  return arr.reduce((total: SeriesChartBalances[], item: IPnlResponse) => {
    const index = total.findIndex((v) => v.symbol === item.symbol);
    if (index !== -1) {
      total.splice(index, 1, {
        symbol: item.symbol,
        value: new BigNumber(total[index].value)
          .plus(new BigNumber(item.balance).div(new BigNumber(item.rate)))
          .toNumber(),
      });
    } else {
      total.push({
        symbol: item.symbol,
        value: new BigNumber(item.balance).div(new BigNumber(item.rate)).toNumber(),
      });
    }
    const rs = total
      .filter((item) => item.value > 0)
      .map((item) => ({
        symbol: item.symbol,
        value: new BigNumber(item.value).div(new BigNumber(getRateFromCurrencies(item.symbol, state))).toNumber(),
      }))
      .sort((a, b) => b.value - a.value);
    return rs;
  }, []);
};
export const returnDataChart = (arrDataChart: IPnl[], dateLabel: string[]): IPnl[] => {
  return dateLabel.reduce((total: IPnl[], date: string, index: number) => {
    if (arrDataChart.every((i) => renderDateSubmit(new Date(i.date)) !== date)) {
      total.push(
        index === 0
          ? {
              ...DEFAULT_PNL,
              date: date,
            }
          : {
              ...DEFAULT_PNL,
              date: date,
              balance_value: total[index - 1].balance_value,
              pnlCommulativeAmount: total[index - 1].pnlCommulativeAmount,
            },
      );
    } else {
      total.push(
        arrDataChart.find((i) => renderDateSubmit(new Date(i.date)) === date) || {
          ...DEFAULT_PNL,
          date: date,
          balance_value: total[index - 1].balance_value,
          pnlCommulativeAmount: total[index - 1].pnlCommulativeAmount,
        },
      );
    }
    return total;
  }, []);
};

const UNIT = {
  THOUSAND: 1.0e3,
  MILLION: 1.0e6,
  BILLION: 1.0e9,
};

export const formatCurrencyAmount = (amount: string | number, currency: FunctionCurrency, zeroValue = '-'): string => {
  if (!amount || new BigNumber(amount).eq('0')) {
    return zeroValue;
  }
  const isNegative = new BigNumber(amount).isNegative();

  let result;
  const dataBigNumber = isNegative ? new BigNumber(amount).times(-1) : new BigNumber(amount);

  if (dataBigNumber.div(UNIT.BILLION).gte(1)) {
    result = dataBigNumber.div(UNIT.BILLION).toFixed(1).toString() + 'B';
  } else if (dataBigNumber.div(UNIT.MILLION).gte(1)) {
    result = dataBigNumber.div(UNIT.MILLION).toFixed(1).toString() + 'M';
  } else if (dataBigNumber.div(UNIT.THOUSAND).gte(1)) {
    result = dataBigNumber.div(UNIT.THOUSAND).toFixed(1).toString() + 'K';
  } else {
    result = dataBigNumber.toFixed(1);
  }
  return `${currency.symbol}${isNegative ? '-' : ''}${result}`;
};
