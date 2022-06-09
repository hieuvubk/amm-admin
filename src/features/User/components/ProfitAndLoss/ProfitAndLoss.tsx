import { Tooltip } from '@material-ui/core';
import { HelpOutline } from '@material-ui/icons';
import BigNumber from 'bignumber.js';
import classnames from 'classnames/bind';
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { CSelect } from 'src/components/Base/Select';
import { ISelect } from 'src/components/Base/Select/Select';
import { renderAddressWallet } from 'src/features/MarketOverview/helper';
import { CHART_NO_DATA, optionChartDonutDashboardOverview } from 'src/features/User/components/Balances/donut-chart';
import { TITLE_TOOLTIP } from 'src/features/User/components/ProfitAndLoss/constants';
import { WalletStatus } from 'src/features/User/constants';
import {
  convertValueToUSD,
  convertValueUSDToCurSelector,
  currentCurrenciesSelected,
  getBalancesInPools,
  reduceTotalAmountToken,
  renderDonutChartBalances,
  totalBalances,
} from 'src/features/User/helpers/helper';
import { AllCoin, BalancesInOrderRes, SeriesChartBalances, Wallets } from 'src/features/User/interfaces';
import { isBscAddress } from 'src/helpers/bssHelper/address';
import { addTimeJS, subTimeJS } from 'src/helpers/date';
import { currencySelector } from 'src/helpers/functional-currency';
import { getAllBalanceInStellar, getBalanceInBsc } from 'src/helpers/getBalance';
import { qsStringify } from 'src/helpers/query-string';
import { isStellarPublicKey } from 'src/helpers/stellarHelper/address';
import { IResponseService } from 'src/interfaces/response';
import axiosInstance from 'src/services/config';
import { useAppSelector } from 'src/store/hooks';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import { MAX_DATE } from '../Transactions/Constant';
import { ColumnPnl, LinePnl } from './ChartPnl';
import Donut from './ChartPnl/Donut';
import CustomDateRangePicker, { IDate } from './DateRangePicker';
import {
  convertTimeSubmit,
  formatCurrencyAmount,
  getFirstValueBalance,
  qsStringRemoveFalsy,
  reduceTotalBalancesByDate,
  renderDateSubmit,
  returnPnlFromTotalBalancesByDate,
  setTimeUTC,
} from './helper';
import { IPnl, IPnlResponse, IPnlsLiquidityResponse, ISelectedDate } from './interface';
import styles from './ProfitAndLoss.module.scss';

const cx = classnames.bind(styles);
enum PnlType {
  Trading = 'trading',
  AddedLiquidity = 'liquidity',
}

interface IPnlConstant {
  yesterday: number;
  rateChangePnlYesterday: number;
  thirtyDaysAgo: number;
  rateChangePnl30DayAgo: number;
}

const DEFAULT_PNL = {
  date: '',
  balance_value: 0,
  trade_value: 0,
  transfer_value: 0,

  pnlDaily: 0,
  pnlCommulativeAmount: 0,
};

const IS_COLOR = {
  true: true,
  false: false,
};
const IS_PERCENT = {
  true: true,
  false: false,
};
const isDateUTCEqualDateTimezone =
  new Date().getUTCDate() === new Date().getDate() && new Date().getHours() >= setTimeUTC(2).getHours();
const addDayForUTCTime = (x: number) => {
  return isDateUTCEqualDateTimezone ? x : x + 1;
};

const ProfitAndLoss: React.FC = () => {
  const rootState = useAppSelector((state) => state);
  const selectedCurrency = useAppSelector(currencySelector);
  const [filterWallet, setFilterWallet] = useState<string>('');
  const [filterMethod, setFilterMethod] = useState<string>(PnlType.Trading);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<ISelectedDate>({
    from: convertTimeSubmit(subTimeJS(new Date(), isDateUTCEqualDateTimezone ? 7 : 8, 'day')).getTime(),
    to: convertTimeSubmit(subTimeJS(new Date(), isDateUTCEqualDateTimezone ? 1 : 2, 'day')).getTime(),
  });
  const { veloValuePerUsd } = useAppSelector((state) => state.functionalCurrency);
  const currenciesCurrentUser = useAppSelector(currentCurrenciesSelected);
  const dispatch = useDispatch();
  const allCoins: AllCoin[] = useAppSelector((state) => state.allCoins.coins.data);
  const [assetAllocation, setAssetAllocation] = useState<SeriesChartBalances[]>([]);
  const [walletOptions, setWalletOptions] = useState<ISelect[]>([]);
  const [isShowPnl, setIsShowPnl] = useState(false);
  const [curWalletPage, setCurWalletPage] = useState(1);
  const [totalWalletPage, setTotalWalletPage] = useState(1);

  // calc pnl for trading
  const [pnl, setPnl] = useState<IPnl[]>([]);
  const [pnlConstant, setPnlConstant] = useState<IPnlConstant>({
    yesterday: 0,
    rateChangePnlYesterday: 0,
    thirtyDaysAgo: 0,
    rateChangePnl30DayAgo: 0,
  });

  // calc pnl for liquidity

  const returnDateChart = (from: Date, to: Date) => {
    const totalDate = (to.getTime() - from.getTime()) / 86400000;
    const arr = [renderDateSubmit(from)];
    for (let i = 0; i < totalDate; i++) {
      arr.push(renderDateSubmit(addTimeJS(from, 1, 'day')));
    }
    return arr;
  };

  const returnDataChartPnl = (arrDateLabel: string[], arrDataPnlChart: IPnl[]): IPnl[] => {
    return arrDateLabel.reduce((total: IPnl[], date: string, index: number) => {
      if (arrDataPnlChart.every((i) => renderDateSubmit(new Date(i.date)) !== date)) {
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
          arrDataPnlChart.find((i) => renderDateSubmit(new Date(i.date)) === date) || {
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

  const returnValueCommulativePnlPercent = (pnl: IPnl[]) => {
    return (
      new BigNumber(
        new BigNumber(pnl[pnl.length - 1]?.pnlCommulativeAmount)
          .div(
            new BigNumber(getFirstValueBalance(pnl)).plus(
              pnl.reduce(
                (t, i) =>
                  new BigNumber(t).plus(new BigNumber(i.transfer_value).div(new BigNumber(pnl.length))).toNumber(),
                0,
              ),
            ),
          )
          .times(100)
          .toFixed(2),
      ).toNumber() || 0
    );
  };

  const userId = window.location.pathname.split('/')[2];

  useEffect(() => {
    if (new Date().getHours() >= setTimeUTC(0).getHours() && new Date().getHours() < setTimeUTC(2).getHours()) {
      setIsShowPnl(false);
    } else setIsShowPnl(true);
  }, []);

  useEffect(() => {
    (async () => {
      const query = {
        page: curWalletPage,
        limit: 10,
        user_id: userId,
        status: [WalletStatus.Whitelisted],
      };
      const listWallet: IResponseService<Wallets[]> = await axiosInstance.get(
        `/admin/user-wallet${qsStringify(query)}`,
      );

      let data: ISelect[] = [];
      if (!!listWallet.data?.length) {
        data = listWallet.data?.map((item: Wallets) => ({
          value: item.address,
          label: renderAddressWallet(item.address),
        }));
      }

      if (curWalletPage === 1 && !!data.length) {
        setWalletOptions(data);
        setTotalWalletPage(listWallet.metadata.totalPage);
        setFilterWallet(data[0].value);
      } else if (curWalletPage <= totalWalletPage) {
        setWalletOptions((prevState) => [...prevState, ...data]);
      }
    })();
  }, [curWalletPage]);

  useEffect(() => {
    let isMounted = true;
    setPnl(() => []);

    const dateLabel = returnDateChart(new Date(selectedDate.from), new Date(selectedDate.to));
    if (isMounted && filterWallet) {
      setLoading(true);
      (async () => {
        try {
          if ((await isStellarPublicKey(filterWallet)) && filterMethod === PnlType.AddedLiquidity) {
            dispatch(
              openSnackbar({
                message: 'Wallet is not BSC Network.',
                variant: SnackbarVariant.ERROR,
              }),
            );
            return;
          }

          let pnlRes: IPnlResponse[] = [];
          // trading
          if (filterMethod === PnlType.Trading) {
            const pnlsTradeApi: IResponseService<IPnlResponse[]> = await axiosInstance.get('/admin/users/pnl', {
              params: qsStringRemoveFalsy({
                from: subTimeJS(convertTimeSubmit(new Date(selectedDate.from)), 1, 'day').getTime(),
                to: addTimeJS(convertTimeSubmit(new Date(selectedDate.to)), 1, 'day').getTime(),
                wallet: filterWallet,
                user_id: userId,
              }),
            });
            pnlRes = pnlsTradeApi.data;
          }

          // liquidity
          if ((await isBscAddress(filterWallet)) && filterMethod === PnlType.AddedLiquidity) {
            const pnls: IResponseService<IPnlsLiquidityResponse[]> = await axiosInstance.get('/admin/users/pool-pnl', {
              params: qsStringRemoveFalsy({
                from: subTimeJS(convertTimeSubmit(new Date(selectedDate.from)), 1, 'day').getTime(),
                to: addTimeJS(convertTimeSubmit(new Date(selectedDate.to)), 1, 'day').getTime(),
                wallet: filterWallet,
                user_id: userId,
              }),
            });
            pnlRes = pnls.data.map((i) => ({
              balance: `${new BigNumber(i.balance).times(new BigNumber(i.price))}`,
              created_at: i.created_at,
              date: i.date,
              rate: '1',
              symbol: i.symbol,
              trade_amount: '0',
              transfer_amount: `${new BigNumber(i.transfer_amount).times(new BigNumber(i.price))}`,
              updated_at: i.updated_at,
              user_id: i.user_id,
              wallet: i.wallet,
            }));
          }

          const returnDataChartByDate = returnDateChart(
            subTimeJS(convertTimeSubmit(new Date(selectedDate.from)), 1, 'day'),
            addTimeJS(convertTimeSubmit(new Date(selectedDate.to)), 1, 'day'),
          ).map((i) => {
            const findItem = reduceTotalBalancesByDate(pnlRes).find(
              (item) => renderDateSubmit(new Date(item.date)) === renderDateSubmit(new Date(i)),
            ) || {
              date: i,
              wallet: filterWallet,
              balance_value: 0,
              trade_value: 0,
              transfer_value: 0,
            };
            return findItem;
          });

          setPnl(returnDataChartPnl(dateLabel, returnPnlFromTotalBalancesByDate(returnDataChartByDate)));
        } catch (error) {
        } finally {
          setLoading(false);
        }
      })();
    }

    return () => {
      isMounted = false;
    };
  }, [selectedDate.from, selectedDate.to, filterMethod, filterWallet]);

  // calc asset allocation
  useEffect(() => {
    let mounted = true;
    const initBalances: SeriesChartBalances[] = [];
    setAssetAllocation(() => []);
    if (mounted && filterWallet) {
      (async () => {
        try {
          setLoading(true);
          if (filterMethod === PnlType.Trading) {
            const resOrder: IResponseService<BalancesInOrderRes[]> = await axiosInstance.get(
              `/admin/balances-in-order`,
              {
                params: { wallet: filterWallet, user_id: userId },
              },
            );
            if (resOrder.data?.length) {
              const resOrderMap = resOrder.data.map((item) => ({
                value: convertValueToUSD(new BigNumber(item.value).toNumber(), item.symbol, rootState),
                symbol: item.symbol,
              }));
              initBalances.push(...reduceTotalAmountToken(resOrderMap));
            }

            // Stellar => available = balances - selling_liabilities
            if (await isStellarPublicKey(filterWallet)) {
              const availableStellar = await getAllBalanceInStellar(filterWallet);
              const availableStellarMap = availableStellar.map((item) => ({
                value: convertValueToUSD(
                  new BigNumber(item.balance).minus(new BigNumber(item.selling_liabilities)).toNumber(),
                  item.asset_code,
                  rootState,
                ),
                symbol: item.asset_code,
              }));
              initBalances.push(...reduceTotalAmountToken(availableStellarMap));
            }
            // BSC
            if (await isBscAddress(filterWallet)) {
              await Promise.all(
                allCoins.map((item: AllCoin) => getBalanceInBsc(filterWallet, item.bsc_address, item.decimal)),
              ).then((values) => {
                const availableBSCMap = values.map((v, i) => ({
                  symbol: allCoins[i]?.symbol,
                  value: convertValueToUSD(new BigNumber(v).toNumber(), allCoins[i]?.symbol, rootState),
                }));
                initBalances.push(...reduceTotalAmountToken(availableBSCMap));
              });
            }
          }
          if (filterMethod === PnlType.AddedLiquidity) {
            const balancesPools = await getBalancesInPools(
              filterWallet,
              allCoins.map((i) => i.symbol),
            );
            initBalances.push(...reduceTotalAmountToken(balancesPools.poolsAssetValue));
          }
        } catch (error) {
        } finally {
          setAssetAllocation(reduceTotalAmountToken(initBalances));

          setLoading(false);
        }
      })();
    }

    return () => {
      mounted = false;
    };
  }, [selectedDate.from, selectedDate.to, filterMethod, filterWallet]);

  // Calc params header : Yesterday, 30 days ago
  useEffect(() => {
    let isMounted = true;
    // calc pnl for trading
    const dateLabel = returnDateChart(
      new Date(subTimeJS(new Date(), addDayForUTCTime(30), 'day')),
      new Date(subTimeJS(new Date(), addDayForUTCTime(1), 'day')),
    );

    if (isMounted && filterWallet) {
      // calc pnl for trading
      (async () => {
        setLoading(true);
        try {
          if ((await isStellarPublicKey(filterWallet)) && filterMethod === PnlType.AddedLiquidity) {
            dispatch(
              openSnackbar({
                message: 'Wallet is not BSC Network.',
                variant: SnackbarVariant.ERROR,
              }),
            );
            return;
          }
          let pnlsDataHeader: IPnlResponse[] = [];
          if (filterMethod === PnlType.Trading) {
            const pnlsTradeApi: IResponseService<IPnlResponse[]> = await axiosInstance.get('/admin/users/pnl', {
              params: qsStringRemoveFalsy({
                from: subTimeJS(convertTimeSubmit(new Date()), addDayForUTCTime(30), 'day').getTime(),
                to: addTimeJS(convertTimeSubmit(new Date()), addDayForUTCTime(1), 'day').getTime(),
                wallet: filterWallet,
                user_id: userId,
              }),
            });
            pnlsDataHeader = pnlsTradeApi.data;
          }

          // calc pnl for liquidity
          if ((await isBscAddress(filterWallet)) && filterMethod === PnlType.AddedLiquidity) {
            const pnlsTradeApi: IResponseService<IPnlsLiquidityResponse[]> = await axiosInstance.get(
              '/admin/users/pool-pnl',
              {
                params: qsStringRemoveFalsy({
                  from: subTimeJS(convertTimeSubmit(new Date()), addDayForUTCTime(30), 'day').getTime(),
                  to: addTimeJS(convertTimeSubmit(new Date()), addDayForUTCTime(1), 'day').getTime(),
                  wallet: filterWallet,
                  user_id: userId,
                }),
              },
            );
            pnlsDataHeader = pnlsTradeApi.data.map((i) => ({
              balance: `${new BigNumber(i.balance).times(new BigNumber(i.price))}`,
              created_at: i.created_at,
              date: i.date,
              rate: '1',
              symbol: i.symbol,
              trade_amount: '0',
              transfer_amount: `${new BigNumber(i.transfer_amount).times(new BigNumber(i.price))}`,
              updated_at: i.updated_at,
              user_id: i.user_id,
              wallet: i.wallet,
            }));
          }

          const return30DaysAgoByDate = returnDateChart(
            subTimeJS(convertTimeSubmit(new Date()), addDayForUTCTime(30), 'day'),
            addTimeJS(convertTimeSubmit(new Date()), addDayForUTCTime(1), 'day'),
          ).map((i) => {
            const findItem = reduceTotalBalancesByDate(pnlsDataHeader).find(
              (item) => renderDateSubmit(new Date(item.date)) === renderDateSubmit(new Date(i)),
            ) || {
              date: i,
              wallet: filterWallet,
              balance_value: 0,
              trade_value: 0,
              transfer_value: 0,
            };
            return findItem;
          });
          const returnYtdDataByDate = returnDateChart(
            subTimeJS(convertTimeSubmit(new Date()), addDayForUTCTime(2), 'day'),
            addTimeJS(convertTimeSubmit(new Date()), addDayForUTCTime(1), 'day'),
          ).map((i) => {
            const findItem = reduceTotalBalancesByDate(pnlsDataHeader).find(
              (item) => renderDateSubmit(new Date(item.date)) === renderDateSubmit(new Date(i)),
            ) || {
              date: i,
              wallet: filterWallet,
              balance_value: 0,
              trade_value: 0,
              transfer_value: 0,
            };
            return findItem;
          });

          const pnlDataYtd = returnDataChartPnl(dateLabel, returnPnlFromTotalBalancesByDate(returnYtdDataByDate));
          const pnlData30DaysAgo = returnDataChartPnl(
            dateLabel,
            returnPnlFromTotalBalancesByDate(return30DaysAgoByDate),
          );

          const pnlYesterday =
            pnlDataYtd.find(
              (i) =>
                renderDateSubmit(new Date(i.date)) ===
                renderDateSubmit(subTimeJS(new Date(), addDayForUTCTime(1), 'day')),
            )?.pnlDaily || 0;
          setPnlConstant((pnl) => ({
            ...pnl,
            yesterday: pnlYesterday,
            rateChangePnlYesterday: returnValueCommulativePnlPercent(pnlDataYtd),
          }));

          // pnl 30day ago
          const pnl30DaysAgo =
            pnlData30DaysAgo.find(
              (i) =>
                renderDateSubmit(new Date(i.date)) ===
                renderDateSubmit(subTimeJS(new Date(), addDayForUTCTime(1), 'day')),
            )?.pnlCommulativeAmount || 0;
          setPnlConstant((pnl) => ({
            ...pnl,
            thirtyDaysAgo: pnl30DaysAgo,
            rateChangePnl30DayAgo: returnValueCommulativePnlPercent(pnlData30DaysAgo),
          }));
        } catch (error) {
        } finally {
          setLoading(false);
        }
      })();
    }

    return () => {
      isMounted = false;
    };
  }, [filterWallet, filterMethod]);

  const pnlMemo = useMemo(
    () =>
      pnl.map((i) => {
        return {
          ...i,
          balance_value: convertValueUSDToCurSelector(i.balance_value, rootState),
          trade_value: convertValueUSDToCurSelector(i.trade_value, rootState),
          transfer_value: convertValueUSDToCurSelector(i.transfer_value, rootState),

          pnlDaily: convertValueUSDToCurSelector(i.pnlDaily, rootState),
          pnlCommulativeAmount: convertValueUSDToCurSelector(i.pnlCommulativeAmount, rootState),
        };
      }),
    [pnl, currenciesCurrentUser.id],
  );

  const pnlConstantMemo = useMemo(
    () => ({
      ...pnlConstant,
      yesterday: convertValueUSDToCurSelector(pnlConstant.yesterday, rootState),
      thirtyDaysAgo: convertValueUSDToCurSelector(pnlConstant.thirtyDaysAgo, rootState),
    }),
    [pnlConstant, currenciesCurrentUser.id],
  );
  const assetAllocationMemo = useMemo(
    () =>
      assetAllocation.map((i) => ({
        ...i,
        value: convertValueUSDToCurSelector(i.value, rootState),
      })),
    [assetAllocation, currenciesCurrentUser.id],
  );

  const renderValueProfitAndLoss = (value: number, isPercent = false, isColor = false) => {
    return (
      <span className={cx(isColor ? (value > 0 ? 'text-success' : value < 0 ? 'text-error' : 'text-normal') : '')}>{`${
        !isNaN(value)
          ? `${value > 0 ? '+' : value < 0 ? '-' : ''}${!isPercent ? currenciesCurrentUser.symbol : ''}${new BigNumber(
              new BigNumber(value).abs(),
            ).toFormat()}`
          : 0
      }${isPercent ? '%' : ''}`}</span>
    );
  };

  const renderToolTip = (title: string) => (
    <Tooltip title={title}>
      <span className={cx('chart-element__info--tooltip')}>
        <HelpOutline fontSize={'inherit'} className={cx('tooltip-icon', 'text-normal')} />
      </span>
    </Tooltip>
  );

  const formatValueCommulativePersent = (arr: IPnl[]): number[] => {
    return arr.map((item) => {
      const itemFormatted = new BigNumber(
        new BigNumber(item.pnlCommulativeAmount)
          .div(
            new BigNumber(getFirstValueBalance(pnl))
              .plus(pnl.reduce((t, i) => t + i.transfer_value / pnl.length, 0))
              .toNumber(),
          )
          .times(100)
          .toFixed(2),
      ).toNumber();

      return Number.isNaN(itemFormatted) ? 0 : itemFormatted;
    });
  };

  const formatterYAxis = (value: number) => {
    return formatCurrencyAmount(value, selectedCurrency, '0');
  };

  return (
    <div>
      <div className={cx('header')}>
        <h3>Profit and loss {renderToolTip(TITLE_TOOLTIP.profitAndLoss)}</h3>

        <div className={cx('select-form')}>
          <div className={cx('select-element')}>
            <label>Type: </label>
            <CSelect
              options={
                filterWallet.includes('0x') || !walletOptions.length
                  ? [
                      { value: PnlType.Trading, label: 'Trading' },
                      { value: PnlType.AddedLiquidity, label: 'Added liquidity' },
                    ]
                  : [{ value: PnlType.Trading, label: 'Trading' }]
              }
              defaultValue={{ value: PnlType.Trading, label: 'Trading' }}
              onChange={(v: string) => setFilterMethod(v)}
            />
          </div>
          <div className={cx('select-element')}>
            <label>Wallet: </label>

            <CSelect
              placeholder="Wallet"
              options={
                filterMethod === PnlType.AddedLiquidity
                  ? walletOptions.filter((i) => `${i.value}`.includes('0x'))
                  : walletOptions
              }
              value={{ value: filterWallet, label: renderAddressWallet(filterWallet) }}
              onMenuScrollToBottom={() => setCurWalletPage((state) => (state < totalWalletPage ? state + 1 : state))}
              onChange={(value: string) => setFilterWallet(value)}
            />
          </div>
        </div>
      </div>

      <div className={cx('info-account')}>
        <div className={cx('info-element')}>
          <div>
            <div>{filterMethod === PnlType.Trading ? 'Account balance' : 'Liquidity'}</div>
            {filterWallet && isShowPnl ? (
              <div className={cx('big-small-text')}>
                <div className={cx('txt-big')}>
                  {`${new BigNumber(
                    new BigNumber(totalBalances(assetAllocationMemo)).div(new BigNumber(veloValuePerUsd)).toFixed(2),
                  ).toFormat()}`}{' '}
                  in VELO terms
                  <span className={cx('txt-small')}>
                    ~{' '}
                    {`${currenciesCurrentUser.symbol} ${new BigNumber(totalBalances(assetAllocationMemo)).toFormat()}`}
                  </span>
                </div>
              </div>
            ) : (
              <div className={cx('big-small-text')}>
                <div className={cx('txt-big')}>
                  {'--'}
                  <span className={cx('txt-small')}>{'--'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className={cx('info-element')}>
          <div>
            <div>Yesterday PNL</div>
            {filterWallet && isShowPnl && isDateUTCEqualDateTimezone ? (
              <div className={cx('big-small-text')}>
                <div className={cx('txt-big')}>
                  {renderValueProfitAndLoss(
                    new BigNumber(new BigNumber(pnlConstantMemo.yesterday).toFixed(2)).toNumber(),
                  )}
                  <span className={cx('txt-small')}>
                    {renderValueProfitAndLoss(
                      new BigNumber(new BigNumber(pnlConstantMemo.rateChangePnlYesterday).toFixed(2)).toNumber(),
                      IS_PERCENT.true,
                      IS_COLOR.true,
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <div className={cx('big-small-text')}>
                <div className={cx('txt-big')}>
                  {'--'}
                  <span className={cx('txt-small')}>{'--'}</span>
                </div>
              </div>
            )}
          </div>
          <div>
            <div>30 days PNL</div>
            {filterWallet && isShowPnl ? (
              <div className={cx('big-small-text')}>
                <div className={cx('txt-big')}>
                  {renderValueProfitAndLoss(
                    new BigNumber(new BigNumber(pnlConstantMemo.thirtyDaysAgo).toFixed(2)).toNumber(),
                  )}
                  <span className={cx('txt-small')}>
                    {renderValueProfitAndLoss(
                      new BigNumber(new BigNumber(pnlConstantMemo.rateChangePnl30DayAgo).toFixed(2)).toNumber(),
                      IS_PERCENT.true,
                      IS_COLOR.true,
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <div className={cx('big-small-text')}>
                <div className={cx('txt-big')}>
                  {'--'}
                  <span className={cx('txt-small')}>{'--'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ padding: '20px 0', pointerEvents: filterWallet ? 'auto' : 'none' }}>
        <CustomDateRangePicker
          classNameProps={'fix-style-date-range'}
          activeSelected={!!pnl.length}
          showOptionDate
          monthDisplayFormat="MMMM yyyy"
          onChange={(v: IDate) => {
            setSelectedDate({
              from: convertTimeSubmit(new Date(v.startDate)).getTime(),
              to: convertTimeSubmit(new Date(v.endDate)).getTime(),
            });
          }}
          maxDate={MAX_DATE}
          minDate={subTimeJS(new Date(), 1, 'year')}
        />
      </div>

      {loading || !isShowPnl ? (
        <div className={cx('no-data')}>Your Profit and Loss is currently recalculated. Please wait for some time.</div>
      ) : (
        <div>
          {!filterWallet ? (
            <div className={cx('no-data')}>No record</div>
          ) : (
            <div className={cx('chart')}>
              <div style={{ flex: 1 }}>
                {/* Cummulative % */}
                <div className={cx('chart-element')}>
                  <div className={cx('chart-element__info', 'absolute-info')}>
                    <div className={cx('chart-element__info--value')}>
                      {renderValueProfitAndLoss(
                        returnValueCommulativePnlPercent(pnlMemo),
                        IS_PERCENT.true,
                        IS_COLOR.true,
                      )}
                    </div>
                    <div className={cx('chart-element__info--sub-value')}>
                      Cumulative PNL(%)
                      {renderToolTip(TITLE_TOOLTIP.commulativePNLPersent)}
                    </div>
                  </div>

                  <LinePnl
                    startDate={pnlMemo && pnlMemo.length > 0 ? pnlMemo[0].date : undefined}
                    endDate={pnlMemo && pnlMemo.length > 0 ? pnlMemo[pnlMemo.length - 1].date : undefined}
                    labels={pnlMemo.map((item) => item.date)}
                    series={[
                      {
                        name: 'Cumulative PNL(%)',
                        data: formatValueCommulativePersent(pnlMemo),
                      },
                      {
                        name: 'Cumulative VELO trend',
                        data: formatValueCommulativePersent(
                          pnlMemo.map((i) => ({
                            ...i,
                            pnlCommulativeAmount: new BigNumber(i.pnlCommulativeAmount)
                              .div(new BigNumber(veloValuePerUsd))
                              .toNumber(),
                            transfer_value: new BigNumber(i.transfer_value)
                              .div(new BigNumber(veloValuePerUsd))
                              .toNumber(),
                          })),
                        ),
                      },
                    ]}
                  />
                </div>

                {/* Daily PNL */}
                <div className={cx('chart-element')}>
                  <div className={cx('chart-element__info')}>
                    <div className={cx('chart-element__info--value')}>
                      {renderValueProfitAndLoss(
                        new BigNumber(new BigNumber(pnlMemo[pnlMemo.length - 1]?.pnlDaily).toFixed(2)).toNumber() || 0,
                        IS_PERCENT.false,
                        IS_COLOR.true,
                      )}
                    </div>
                    <div className={cx('chart-element__info--sub-value')}>
                      Daily PNL
                      {renderToolTip(TITLE_TOOLTIP.dailyPNL)}
                    </div>
                  </div>
                  <ColumnPnl
                    startDate={pnlMemo && pnlMemo.length > 0 ? pnlMemo[0].date : undefined}
                    endDate={pnlMemo && pnlMemo.length > 0 ? pnlMemo[pnlMemo.length - 1].date : undefined}
                    labels={pnlMemo.map((item) => item.date)}
                    series={[
                      {
                        name: 'Daily PNL',
                        data: pnlMemo.map((item) => new BigNumber(item.pnlDaily.toFixed(2)).toNumber()),
                      },
                    ]}
                    formatterYAxis={formatterYAxis}
                  />
                </div>

                {/* Profit */}
                <div className={cx('chart-element')}>
                  <div className={cx('chart-element__info')}>
                    <div className={cx('chart-element__info--value')}>
                      {renderValueProfitAndLoss(
                        new BigNumber(
                          new BigNumber(pnlMemo[pnlMemo.length - 1]?.pnlCommulativeAmount).toFixed(2),
                        ).toNumber() || 0,
                        IS_PERCENT.false,
                        IS_COLOR.true,
                      )}
                    </div>
                    <div className={cx('chart-element__info--sub-value')}>
                      Profits
                      {renderToolTip(TITLE_TOOLTIP.profit)}
                    </div>
                  </div>
                  <LinePnl
                    startDate={pnlMemo && pnlMemo.length > 0 ? pnlMemo[0].date : undefined}
                    endDate={pnlMemo && pnlMemo.length > 0 ? pnlMemo[pnlMemo.length - 1].date : undefined}
                    labels={pnlMemo.map((item) => item.date)}
                    series={[
                      {
                        name: 'Profit',
                        data: pnlMemo.map((item) => new BigNumber(item.pnlCommulativeAmount.toFixed(2)).toNumber()),
                      },
                    ]}
                    formatterYAxis={formatterYAxis}
                  />
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div className={cx('chart-element')}>
                  <div className={cx('chart-element__info')}>
                    <div className={cx('chart-element__info--sub-value')}>
                      Asset Allocation
                      {renderToolTip(TITLE_TOOLTIP.assetAllocation)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Donut
                      widthChart={!assetAllocationMemo.length ? 260 : 360}
                      options={{
                        ...optionChartDonutDashboardOverview,
                        colors: !assetAllocationMemo.length ? ['#848E9C'] : optionChartDonutDashboardOverview.colors,
                        legend: {
                          ...optionChartDonutDashboardOverview.legend,
                          show: !assetAllocationMemo.length ? false : true,
                        },
                        tooltip: {
                          ...optionChartDonutDashboardOverview.tooltip,
                          enabled: !assetAllocationMemo.length ? false : true,
                          y: {
                            formatter: (v: number) => `${new BigNumber(v).times(new BigNumber(100)).toFixed(2)}%`,
                          },
                        },
                        labels: !assetAllocationMemo.length
                          ? CHART_NO_DATA.Label
                          : renderDonutChartBalances(assetAllocationMemo).map((item) => item.symbol),
                      }}
                      series={
                        !assetAllocationMemo.length
                          ? CHART_NO_DATA.Value
                          : renderDonutChartBalances(assetAllocationMemo).map((item) => item.value)
                      }
                    />
                  </div>
                </div>
                <div className={cx('chart-element')}>
                  <div className={cx('chart-element__info')}>
                    <div className={cx('chart-element__info--value')}>
                      <span className={cx('text-normal')}>
                        {`${currenciesCurrentUser.symbol}${new BigNumber(
                          pnlMemo[pnlMemo.length - 1]?.balance_value.toFixed(2),
                        ).toFormat()}`}
                      </span>
                    </div>
                    <div className={cx('chart-element__info--sub-value')}>
                      Asset Net Worth
                      {renderToolTip(TITLE_TOOLTIP.assetNetWorth)}
                    </div>
                  </div>
                  <LinePnl
                    startDate={pnlMemo && pnlMemo.length > 0 ? pnlMemo[0].date : undefined}
                    endDate={pnlMemo && pnlMemo.length > 0 ? pnlMemo[pnlMemo.length - 1].date : undefined}
                    labels={pnlMemo.map((item) => item.date)}
                    series={[
                      {
                        name: 'Asset Net Worth',
                        data: pnlMemo.map((item) => new BigNumber(item.balance_value.toFixed(2)).toNumber()),
                      },
                    ]}
                    formatterYAxis={formatterYAxis}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfitAndLoss;
