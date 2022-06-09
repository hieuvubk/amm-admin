import { GridRowData } from '@material-ui/data-grid';
import moment from 'moment';
import {
  ChartDataInterval,
  ChartTabs,
  ChartTabsValue,
  FeeType,
  POOL_TYPE,
  TimeFilterLabel,
  TRANSACTIONS_TYPE,
} from 'src/features/Pools/constants';
import { ExchangeRate } from 'src/interfaces/exchange-rate';
import {
  Pool,
  PoolDashboardTable,
  PoolToken,
  Add,
  Withdraw,
  Swap,
  IPoolOverview,
  ChartDataSwap,
  ChartDataAdd,
  ChartDataRemove,
  PoolSwap,
  PoolAdd,
  PoolWithdrawal,
  PoolVirtualSwap,
  ChartDataPoolVirtualSwap,
} from 'src/interfaces/pool';
import BigNumber from 'bignumber.js';
import { FunctionCurrency } from 'src/interfaces/user';
import {
  formatCurrencyAmount,
  formatPoolPercent,
  formatTokenAmount,
  setDataPrecision,
} from '../features/Pools/helper/dataFormater';
import { calcAPY } from 'src/features/Pools/helper/apy';

export const formatPoolAddress = (address: string): string => {
  return `${address.slice(0, 5)}...${address.slice(-3)}`;
};

export const assetsWeightTotal = (tokens: PoolToken[]): BigNumber => {
  return tokens.reduce((acc, cur) => {
    return new BigNumber(acc).plus(cur.denormWeight); //acc + Number(cur.denormWeight);
  }, new BigNumber(0));
};

export const calcTokenPercentage = (tokens: PoolToken[]): number[] => {
  const tokensWeightTotal = assetsWeightTotal(tokens);

  return tokens.map((token) => Number(new BigNumber(token.denormWeight).div(tokensWeightTotal).times(100).toFixed(2)));
};

export const calculatePriceMatrix = (rowToken: PoolToken, colToken: PoolToken): string => {
  const price = new BigNumber(colToken.balance)
    .div(colToken.denormWeight)
    .div(new BigNumber(rowToken.balance).div(rowToken.denormWeight))
    .toString();

  return setDataPrecision(price, 4);
};

function normalizeChartData<T extends { timestamp: number }>(rawData: { [key: string]: T[] }): T[] {
  const normalizedChartData: T[] = [];

  for (const key in rawData) {
    const [, timestamp] = key.split('_');
    let value;

    if (rawData[key].length) {
      const data = rawData[key][0];
      value = { ...data, updatedAt: (data?.timestamp || 0) * 1000 };
    } else {
      value = normalizedChartData[normalizedChartData.length - 1]
        ? normalizedChartData[normalizedChartData.length - 1]
        : ({ updatedAt: 0 } as unknown as T);
    }
    normalizedChartData.push({ ...value, timestamp: Number(timestamp) });
  }

  return normalizedChartData;
}

export const processPoolOverview = (
  pool: Pool,
  feeType: FeeType,
  exchangeRates: ExchangeRate[],
  selectedCurrency: FunctionCurrency,
): IPoolOverview => {
  let volumeIn24h = '0';
  let fees24h = '0';
  const poolTotalFee = feeType === FeeType.Gross ? 'totalSwapFee' : 'totalNetFee';
  const feeRate = feeType === FeeType.Gross ? 'swapFee' : 'netFee';
  const swapTotalFee = feeType === FeeType.Gross ? 'poolTotalSwapFee' : 'poolTotalNetFee';
  let swapFeeLast24h = '0';
  if (pool.swaps?.length) {
    swapFeeLast24h = pool.swaps[0][swapTotalFee];
  }
  fees24h = new BigNumber(pool[poolTotalFee]).minus(swapFeeLast24h).toString();
  volumeIn24h = new BigNumber(pool.totalSwapVolume).minus(pool.swaps[0]?.poolTotalSwapVolume || 0).toString();

  const apy = !(new BigNumber(pool.liquidity).isZero() || calcAPY(fees24h, pool.liquidity).isZero())
    ? setDataPrecision(calcAPY(fees24h, pool.liquidity), 2) + '%'
    : '-';

  return {
    donutChartSeries: calcTokenPercentage(pool.tokens),
    donutChartLabel: pool.tokens.map((token) => token.symbol),
    name: pool.name,
    address: pool.id,
    type: `${pool.crp === POOL_TYPE.FIXED.value ? POOL_TYPE.FIXED.label : POOL_TYPE.FLEXIBLE.label} pool`,
    liquidity: formatCurrencyAmount(pool.liquidity, selectedCurrency, exchangeRates),
    volumeIn24h: formatCurrencyAmount(volumeIn24h, selectedCurrency, exchangeRates),
    swapFee: `${formatPoolPercent(pool[feeRate], 2, '0')}%`,
    apy: apy,
    lifeTimeFees: formatCurrencyAmount(pool[poolTotalFee], selectedCurrency, exchangeRates),
    numberOfLPer: pool.shares.length,
  };
};

export const processPoolsDashboardTableData = (
  poolsList: Pool[],
  feeType: FeeType,
  exchangeRates: ExchangeRate[],
  selectedCurrency: FunctionCurrency,
): PoolDashboardTable[] => {
  const data: PoolDashboardTable[] = poolsList?.map((pool) => {
    const tokensPercentage = calcTokenPercentage(pool.tokens);

    const assets = tokensPercentage.map((item, index) => {
      return `${formatPoolPercent(item / 100)}% ${pool.tokens[index].symbol}`;
    });

    let volumeIn24h = '0';
    let fees24h = '0';
    const poolTotalFee = feeType === FeeType.Gross ? 'totalSwapFee' : 'totalNetFee';
    const feeRate = feeType === FeeType.Gross ? 'swapFee' : 'netFee';
    const swapTotalFee = feeType === FeeType.Gross ? 'poolTotalSwapFee' : 'poolTotalNetFee';
    let swapFeeLast24h = '0';
    if (pool.swaps?.length) {
      swapFeeLast24h = pool.swaps[0][swapTotalFee];
    }
    fees24h = new BigNumber(pool[poolTotalFee]).minus(swapFeeLast24h).toString();
    volumeIn24h = new BigNumber(pool.totalSwapVolume).minus(pool.swaps[0]?.poolTotalSwapVolume || 0).toString();

    const apy = !(new BigNumber(pool.liquidity).isZero() || calcAPY(fees24h, pool.liquidity).isZero())
      ? setDataPrecision(calcAPY(fees24h, pool.liquidity), 2) + '%'
      : '-';

    return {
      id: pool.id,
      poolAddress: formatPoolAddress(pool.id),
      tokensPercentage: tokensPercentage,
      assets: assets,
      swapFee: `${formatPoolPercent(pool[feeRate], 2, '0')}%`,
      totalLiquidity: formatCurrencyAmount(pool.liquidity, selectedCurrency, exchangeRates),
      myLiquidity: '-',
      volume24: formatCurrencyAmount(volumeIn24h, selectedCurrency, exchangeRates),
      fees24: formatCurrencyAmount(fees24h, selectedCurrency, exchangeRates),
      apy: apy,
      lifeTimeFees: formatCurrencyAmount(pool[poolTotalFee], selectedCurrency, exchangeRates),
      numberOfLPer: pool.shares.length,
    };
  });

  return data;
};

const getLiquidityItem = (
  swaps: PoolSwap[],
  adds: PoolAdd[],
  withdrawals: PoolWithdrawal[],
  virtualSwaps: PoolVirtualSwap[],
  index: number,
): PoolSwap | PoolAdd | PoolWithdrawal | PoolVirtualSwap => {
  let item: PoolSwap | PoolAdd | PoolWithdrawal | PoolVirtualSwap = swaps[index];
  if (index < adds.length && adds[index].poolLiquidity && item.updatedAt < adds[index].updatedAt) {
    item = adds[index];
  }
  if (index < withdrawals.length && withdrawals[index].poolLiquidity && item.updatedAt < withdrawals[index].updatedAt) {
    item = withdrawals[index];
  }
  if (index < virtualSwaps.length && item.updatedAt <= virtualSwaps[index].updatedAt) {
    item = virtualSwaps[index];
  }
  return item;
};

export const formatChartTime = (
  timestamp: number,
  timeFilter: { label: string; value: string },
  startTime: number,
  endTime: number,
): string => {
  const date = new Date(timestamp);
  let format = 'DD';

  switch (timeFilter.label) {
    case TimeFilterLabel.Day:
      if (date.getDate() === 1) {
        format = 'MMM';
      } else {
        format = 'DD';
      }
      break;
    case TimeFilterLabel.Week:
      if (date.getDate() < 7) {
        format = 'MMM';
      } else {
        format = 'DD';
      }
      break;
    case TimeFilterLabel.Month:
      if (date.getMonth() === 0) {
        format = 'yyyy';
      } else {
        format = 'MMM';
      }
      break;
    case TimeFilterLabel.Custom:
      const dayInMilliseconds = 86400000;
      if (endTime - startTime <= dayInMilliseconds * 10) {
        if (date.getDate() === 1) {
          format = 'MMM';
        } else {
          format = 'DD';
        }
      } else {
        const daysPerLabel = Math.ceil((endTime - startTime) / dayInMilliseconds / 10);
        const days = (timestamp - startTime) / dayInMilliseconds;
        if (days % daysPerLabel === 0) {
          if (date.getDate() <= daysPerLabel) {
            format = 'MMM';
          } else {
            format = 'DD';
          }
        } else {
          return '';
        }
      }
      break;
    default:
      break;
  }

  return moment(timestamp).format(format);
};

export const processChartData = (
  data: {
    swaps: ChartDataSwap;
    adds: ChartDataAdd;
    withdraws: ChartDataRemove;
    virtualSwaps: ChartDataPoolVirtualSwap;
  },
  tab = ChartTabs[0],
  feeType: number,
  timeFilter: { label: string; value: string },
): {
  series: {
    name: string;
    data: Array<{ x: string | number; y: string | number }>;
  }[];
  labels: string[];
} => {
  const feeFieldName = feeType === FeeType.Gross ? 'poolTotalSwapFee' : 'poolTotalNetFee';
  const processedChartData: Array<{ x: string | number; y: string | number }> = [];
  const labels: string[] = [];
  const [swaps, adds, withdrawals, virtualSwaps] = [
    normalizeChartData(data.swaps),
    normalizeChartData(data.adds),
    normalizeChartData(data.withdraws),
    normalizeChartData(data.virtualSwaps),
  ];

  let startTime = 0;
  let endTime = 0;
  if (swaps.length > 0) {
    startTime = swaps[0].timestamp;
    endTime = swaps[swaps.length - 1].timestamp;
  }

  switch (tab.value) {
    case ChartTabsValue.Liquidity:
      for (let i = 1; i < swaps.length; i++) {
        const item = getLiquidityItem(swaps, adds, withdrawals, virtualSwaps, i);
        processedChartData.push({
          x: formatChartTime(item.timestamp, timeFilter, startTime, endTime),
          y: item.poolLiquidity || '0',
        });
        labels.push(String(item.timestamp));
      }
      break;

    case ChartTabsValue.Add:
      if (swaps.length > 1) {
        startTime = adds[1].timestamp;
        endTime = adds[adds.length - 1].timestamp;
      }
      for (let i = 1; i < adds.length; i++) {
        const yAdd = new BigNumber(adds[i].poolTotalAddVolume || '0')
          .minus(adds[i - 1].poolTotalAddVolume || '0')
          .toString();
        processedChartData.push({ x: formatChartTime(adds[i].timestamp, timeFilter, startTime, endTime), y: yAdd });
        labels.push(String(adds[i].timestamp));
      }
      break;

    case ChartTabsValue.Remove:
      if (swaps.length > 1) {
        startTime = withdrawals[1].timestamp;
        endTime = withdrawals[withdrawals.length - 1].timestamp;
      }
      for (let i = 1; i < withdrawals.length; i++) {
        const yRemove = new BigNumber(withdrawals[i].poolTotalWithdrawVolume || '0')
          .minus(withdrawals[i - 1].poolTotalWithdrawVolume || '0')
          .toString();
        processedChartData.push({
          x: formatChartTime(withdrawals[i].timestamp, timeFilter, startTime, endTime),
          y: yRemove,
        });
        labels.push(String(withdrawals[i].timestamp));
      }
      break;

    case ChartTabsValue.Volume:
      for (let i = 1; i < swaps.length; i++) {
        const yVolume = new BigNumber(swaps[i].poolTotalSwapVolume || '0')
          .minus(swaps[i - 1].poolTotalSwapVolume || '0')
          .toString();
        processedChartData.push({ x: formatChartTime(swaps[i].timestamp, timeFilter, startTime, endTime), y: yVolume });
        labels.push(String(swaps[i].timestamp));
      }
      break;

    case ChartTabsValue.FeePercentage:
      if (swaps.length > 0) {
        startTime = swaps[0].timestamp;
        endTime = swaps[swaps.length - 1].timestamp;
      }
      for (let i = 1; i < swaps.length; i++) {
        const fee = new BigNumber(swaps[i][feeFieldName] || '0').minus(swaps[i - 1][feeFieldName] || '0');
        const interval =
          timeFilter.label === TimeFilterLabel.Day
            ? ChartDataInterval.Day
            : TimeFilterLabel.Month
            ? ChartDataInterval.Month
            : TimeFilterLabel.Week
            ? ChartDataInterval.Week
            : 1;
        const feeInYear = fee.times(365).times(ChartDataInterval.Day).div(interval);
        const liquidityItem = getLiquidityItem(swaps, adds, withdrawals, virtualSwaps, i);
        let feePercentage = '0';
        const liquidity = liquidityItem.poolLiquidity || '0';
        if (new BigNumber(liquidity).gt('0')) {
          feePercentage = feeInYear.times('100').div(liquidity).toString();
        }

        processedChartData.push({
          x: formatChartTime(liquidityItem.timestamp, timeFilter, startTime, endTime),
          y: feePercentage,
        });
        labels.push(String(liquidityItem.timestamp));
      }
      break;

    case ChartTabsValue.FeeValue:
      for (let i = 1; i < swaps.length; i++) {
        const yFeeValue = new BigNumber(swaps[i][feeFieldName] || '0')
          .minus(swaps[i - 1][feeFieldName] || '0')
          .toString();

        processedChartData.push({
          x: formatChartTime(swaps[i].timestamp, timeFilter, startTime, endTime),
          y: yFeeValue,
        });
        labels.push(String(swaps[i].timestamp));
      }
      break;

    default:
      break;
  }

  return {
    series: [
      {
        name: tab.label,
        data: processedChartData,
      },
    ],
    labels: labels,
  };
};

export const processTransactionsTableData = (data: unknown[], transactionsType: number): readonly GridRowData[] => {
  switch (transactionsType) {
    case TRANSACTIONS_TYPE.SWAP.value:
      return (data as Swap[]).map((swap) => {
        return {
          id: swap.id.split('-')[0],
          description: `Swap ${swap.tokenInSym} for ${swap.tokenOutSym}`,
          digitalCreditAmountIn: `${formatTokenAmount(swap.tokenAmountIn, 2)} ${swap.tokenInSym}`,
          digitalCreditAmountOut: `${formatTokenAmount(swap.tokenAmountOut, 2)} ${swap.tokenOutSym}`,
          time: moment.unix(Number(swap.timestamp)).format('DD/MM/YYYY HH:mm:ss'),
        };
      });

    case TRANSACTIONS_TYPE.ADD.value:
      return (data as Add[]).map((add) => {
        return {
          id: add.id,
          description: 'Add liquidity',
          details: add.tokens.map((token) => {
            return [token.tokenInSym, token.tokenAmountIn];
          }),
          time: moment.unix(Number(add.timestamp)).format('DD/MM/YYYY HH:mm:ss'),
        };
      });

    case TRANSACTIONS_TYPE.REMOVE.value:
      return (data as Withdraw[]).map((withdraw) => {
        return {
          id: withdraw.id,
          description: 'Remove liquidity',
          details: withdraw.tokens.map((token) => {
            return [token.tokenOutSym, token.tokenAmountOut];
          }),
          time: moment.unix(Number(withdraw.timestamp)).format('DD/MM/YYYY HH:mm:ss'),
        };
      });

    default:
      return [] as readonly GridRowData[];
  }
};
