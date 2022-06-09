import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import BigNumber from 'bignumber.js';
import classnames from 'classnames/bind';
import React, { useState } from 'react';
import CsvDownloader from 'react-csv-downloader';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { DButton } from 'src/components/Base/DButton';
import Spline from 'src/components/Chart/Spline';
import CustomDateRangePicker from 'src/components/DateRangePicker';
import routeConstants from 'src/constants/routeConstants';
import LinksBreadcrumbs from 'src/features/Admin/components/LinksBreadcrumbs/LinksBreadcrumbs';
import { downloadCollectedFee, getCollectedFee } from 'src/features/MarketOverview/api';
import { TradeHistory } from 'src/features/MarketOverview/component/TradeHistory';
import {
  DownloadCollectedFee,
  DownloadType,
  ICollectedFee,
  IDownloadCollectedFee,
  TRANSACTION_ADD_REMOVE_COLUM,
  TRANSACTION_OB_COLUM,
  TRANSACTION_SWAP_COLUM,
} from 'src/features/MarketOverview/constants/index';
import { FilterChart } from 'src/features/MarketOverview/FilterForm/filterChart';
import { calcTimestamp } from 'src/features/MarketOverview/helper';
import TabsSwitch from 'src/features/Pools/component/TabsSwitch';
import { ChartDataInterval, TimeFilterLabel, TimeFilterTabs } from 'src/features/Pools/constants';
import { formatCurrencyAmount } from 'src/features/Pools/helper/dataFormater';
import {
  LqTrade,
  METHOD_FILTER,
  ModeDisplay,
  TFilter,
  TTrade,
  TTransactionFilterDownload,
} from 'src/features/User/components/Transactions/Constant';
import {
  getDowloadTradesLiqApi,
  getDownloadTradesOBApi,
  getDownloadTransactionsApi,
} from 'src/features/User/components/Transactions/Transactions.slice';
import { Pair } from 'src/pages/Pair/interfaces/pairs';
import { NETWORK } from 'src/features/wallet/Constant';
import { dateBeforeMonth, subTimeJS } from 'src/helpers/date';
import { fixPrecision } from 'src/helpers/fixPrecision';
import { currencySelector } from 'src/helpers/functional-currency';
import { formatChartTime } from 'src/helpers/pool';
import { ExchangeRate } from 'src/interfaces/exchange-rate';
import { THEME_MODE } from 'src/interfaces/theme';
import { FunctionCurrency } from 'src/interfaces/user';
import axiosInstance from 'src/services/config';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { RootState } from 'src/store/store';
import styles from '../style/MarketOverView.module.scss';
import { getExchangeRatesAtDate } from 'src/services/functionalCurrencies';
import { TradingMethod } from 'src/constants/dashboard';

const cx = classnames.bind(styles);

const METHOD_FILTER_WITHOUT_PANCAKESWAP = METHOD_FILTER.filter((i) => {
  return i.value !== TradingMethod.PancakeswapPool;
});

const MarketOverView: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const theme = useAppSelector((state) => state.theme.themeMode);
  const exchangeRates: ExchangeRate[] = useAppSelector((state) => state.functionalCurrency.exchangeRates);
  const functionalCurrency = useAppSelector((state) => state.functionalCurrency.functionalCurrencies);
  const selectedCurrency: FunctionCurrency = useAppSelector(currencySelector);
  const chartDataStore = useAppSelector((state) => state.marketOverView.chart.data);
  const chartData =
    chartDataStore[chartDataStore.length - 1]?.timestamp - new Date().getTime() > 0
      ? chartDataStore.slice(0, chartDataStore.length - 1)
      : chartDataStore;
  const downloadCollectedFeeData = useAppSelector((state) => state.marketOverView.downloadCollectedFee.data);
  const tradeListOB: TTrade[] = useSelector((state: RootState) => state.transaction.downloadTradesOB.data);
  const tradeListLiq: TTrade[] = useSelector((state: RootState) => state.transaction.downloadTradesLiq.data);
  const transactionList: LqTrade[] = useSelector((state: RootState) => state.transaction.downloadTransactions?.data);
  const allCoin = useAppSelector((state) => state.allCoins.coins);

  const [timeFilterTab, setTimeFilterTab] = React.useState(TimeFilterTabs[0]);
  const [conditionFilter, setConditionFilter] = React.useState<ICollectedFee>(() => {
    const data = { ...calcTimestamp(TimeFilterTabs[0]) };
    return {
      ...calcTimestamp(TimeFilterTabs[0]),
      endTime:
        new Date(data.endTime || 0).getDate() === new Date().getDate()
          ? data.endTime
          : new Date(data.endTime || 0).setDate(new Date().getDate()),
    };
  });
  const [downloadConditionFilter, setDownloadConditionFilter] = useState<IDownloadCollectedFee>({
    startTime: dateBeforeMonth(new Date(), 1).getTime(),
    endTime: new Date().getTime(),
  });
  const [transactionFilter, setTransactionFilter] = useState<TTransactionFilterDownload>({});
  const pairs = useAppSelector((state) => state.pair.pairs);
  const [showDownloadCollectedFee, setShowDownloadCollectedFee] = useState(true);
  const [showDownloadTransactionBtn, setshowDownloadTransactionBtn] = useState(true);

  React.useEffect(() => {
    dispatch(getCollectedFee(conditionFilter));
  }, [conditionFilter]);

  React.useEffect(() => {
    dispatch(downloadCollectedFee(downloadConditionFilter));
  }, [downloadConditionFilter]);

  React.useEffect(() => {
    if (transactionFilter.tradeMethodTab) {
      const orderBookFlag = transactionFilter.tradeMethodTab.length > 1 && tradeListOB.length === 0;
      const liquidityFlag =
        transactionFilter.tradeMethodTab.length <= 1 &&
        tradeListLiq.length === 0 &&
        transactionFilter.transactionType === 'Swap';
      const transactionListFlag =
        transactionFilter.tradeMethodTab.length <= 1 &&
        transactionList.length === 0 &&
        transactionFilter.transactionType !== 'Swap';
      if (orderBookFlag || liquidityFlag || transactionListFlag) {
        setshowDownloadTransactionBtn(false);
      } else {
        setshowDownloadTransactionBtn(true);
      }
    } else {
      setshowDownloadTransactionBtn(true);
    }
  }, [tradeListOB, tradeListLiq, transactionList]);

  React.useEffect(() => {
    if (downloadCollectedFeeData.collectedFees.length === 0) {
      setShowDownloadCollectedFee(false);
    } else {
      setShowDownloadCollectedFee(true);
    }
  }, [downloadCollectedFeeData]);

  const handleSelectTimeFilter = (selection: { value: TimeFilterLabel; label: string }) => {
    setTimeFilterTab(selection as typeof TimeFilterTabs[0]);
    selection.label !== TimeFilterLabel.Custom &&
      setConditionFilter((prevState) => ({ ...prevState, ...calcTimestamp(selection) }));
  };

  const handleChangeDateRange = (value: { startDate: Date; endDate: Date }) => {
    downloadConditionFilter.startTime = new Date(value.startDate).getTime();
    downloadConditionFilter.endTime = new Date(value.endDate).getTime();
    setDownloadConditionFilter(downloadConditionFilter);
    setTimeFilterTab(TimeFilterTabs[3]);
    setConditionFilter((prevState) => ({
      ...prevState,
      ...calcTimestamp(TimeFilterTabs[3], value),
    }));
    dispatch(downloadCollectedFee(downloadConditionFilter));
  };

  const [openPopup, setOpenPopup] = useState(false);
  const [openTransactionPopup, setOpenTransactionPopup] = useState(false);
  const downloadData = () => {
    dispatch(downloadCollectedFee(downloadConditionFilter));
    setOpenPopup(true);
  };
  const downloadTransactionData = () => {
    setOpenTransactionPopup(true);
  };
  const handleSubmitCancel = async () => {
    await setOpenPopup(false);
  };
  const handleSubmitCloseTransactionDownload = async () => {
    await setOpenTransactionPopup(false);
  };
  const convertDate = (date: Date): string => {
    const dateStyle = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    const month = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`;
    return `${dateStyle}-${month}-${date.getFullYear()}`;
  };

  const convertDateToIso = (date: Date): string => {
    return `${`0${date.getDate()}`.slice(-2)}/${`0${date.getMonth() + 1}`.slice(
      -2,
    )}/${date.getFullYear()} ${`0${date.getHours()}`.slice(-2)}:${`0${date.getMinutes()}`.slice(
      -2,
    )}:${`0${date.getSeconds()}`.slice(-2)}`;
  };

  const getCsvData = async () => {
    // write to log
    await axiosInstance.post('/admin/write-log-download', {
      downloadType: DownloadType.CollectedFee,
    });
    const csvData = [downloadCollectedFeeData.colums];
    downloadCollectedFeeData.collectedFees.forEach((data: DownloadCollectedFee) => {
      csvData.push([
        `${data.pairName}`,
        `${convertDateToIso(new Date(data.date))}`,
        `${data.network}`,
        `${data.collectedFee}`,
      ]);
    });
    return csvData;
  };

  const getExchangeRates = (isoCode: string, exchangeRate: ExchangeRate[]): number => {
    for (const rate of exchangeRate) {
      if (rate.coin === isoCode) {
        return rate.rate;
      }
    }
    return 0;
  };

  const getExchangeRate = (): { [key: string]: number } => {
    const result: { [key: string]: number } = {};
    if (functionalCurrency) {
      for (const currency of functionalCurrency?.data) {
        result[currency.digital_credits] = getExchangeRates(currency.iso_code, exchangeRates);
      }
      result['USDT'] = 1;
    }
    return result;
  };

  const calcValueExchangeRate = (trade: TTrade, rate: { [key: string]: number }) => {
    if (trade.user_id === trade.buy_user_id) {
      return new BigNumber(trade.buy_fee).times(rate[trade.quote_name]).toString();
    } else {
      return new BigNumber(trade.sell_fee).times(rate[trade.base_name]).toString();
    }
  };

  const calcValueTradeListLiq = (fee: string, currencyName: string, rate: { [key: string]: number }) => {
    return new BigNumber(fee).times(rate[currencyName]).toString();
  };

  const getTransactionCsvData = async () => {
    const csvTransactionData: string[][] = [];
    // write to log
    await axiosInstance.post('/admin/write-log-download', {
      downloadType: DownloadType.Transaction,
    });
    if (transactionFilter.tradeMethodTab && transactionFilter.tradeMethodTab.length > 1) {
      csvTransactionData.push(TRANSACTION_OB_COLUM.map((item) => item.displayName));
      tradeListOB.forEach((item) => {
        const pair = pairs?.find((e: Pair) => e.pairs_id === item.pair_id);

        csvTransactionData.push([
          `${item.base_name}/${item.quote_name}`,
          `${convertDateToIso(new Date(item.created_at))}`,
          `${item.user_id === item.buy_user_id ? 'Buy' : 'Sell'}`,
          `${fixPrecision(item.price, pair?.price_precision)}`,
          `${Number(item.filled_amount)}`,
          `${Number(calcValueExchangeRate(item, getExchangeRate()))}`,
          `${
            item.user_id === item.buy_user_id
              ? fixPrecision(item.buy_fee, pair?.price_precision)
              : fixPrecision(item.sell_fee, pair?.price_precision)
          }`,
          `${fixPrecision(
            new BigNumber(item.price).multipliedBy(new BigNumber(item.filled_amount)),
            pair?.price_precision,
          )}`,
          `${item.user_id === item.buy_user_id ? item.buy_address : item.sell_address}`,
          `${NETWORK.filter((network) => network.value === item.network)[0].label}`,
          `${item.user_id}`,
        ]);
      });
    } else {
      if (transactionFilter.transactionType === 'Swap') {
        csvTransactionData.push(TRANSACTION_SWAP_COLUM.map((item) => item.displayName));

        await Promise.all(
          tradeListLiq.map(async (item) => {
            const pair = pairs?.find((e: Pair) => e.pairs_id === item.pair_id);

            const exchangeRates: ExchangeRate[] = await getExchangeRatesAtDate(
              new Date(item.created_at).toISOString().slice(0, 10),
            );

            const quoteFCExchangeRate = exchangeRates.find((exchangeRate) =>
              exchangeRate.coin.toLowerCase().includes(item.base_name.slice(1, 4).toLowerCase()),
            )?.rate;

            const baseFCExchangeRate = exchangeRates.find((exchangeRate) =>
              exchangeRate.coin.toLowerCase().includes(item.quote_name.slice(1, 4).toLowerCase()),
            )?.rate;

            csvTransactionData.push([
              `${item.base_name}/${item.quote_name}`,
              `${convertDateToIso(new Date(item.created_at))}`,
              `${fixPrecision(item.price, pair?.price_precision)}`,
              `${fixPrecision(Number(item.filled_amount), pair?.amount_precision)}`,
              // `${
              //   item.buy_user_id !== -1
              //     ? item.filled_amount
              //     : new BigNumber(item.filled_amount).times(new BigNumber(item.price))
              // }`,
              `${
                quoteFCExchangeRate
                  ? fixPrecision(Number(item.filled_amount) * quoteFCExchangeRate, pair?.price_precision)
                  : ''
              }`,
              // `${
              //   item.buy_user_id !== -1
              //     ? calcValueTradeListLiq(item.filled_amount, item.quote_name, getExchangeRate())
              //     : calcValueTradeListLiq(
              //         new BigNumber(item.filled_amount).times(new BigNumber(item.price)).toString(),
              //         item.base_name,
              //         getExchangeRate(),
              //       )
              // }`,
              `${fixPrecision(new BigNumber(item.filled_amount).times(item.price), pair?.amount_precision)}`,
              // `${
              //   item.sell_user_id !== -1
              //     ? new BigNumber(item.filled_amount).times(new BigNumber(item.price))
              //     : item.filled_amount
              // }`,
              `${
                baseFCExchangeRate
                  ? fixPrecision(
                      new BigNumber(item.filled_amount).times(item.price).times(baseFCExchangeRate),
                      pair?.price_precision,
                    )
                  : ''
              }`,
              // `${
              //   item.sell_user_id !== -1
              //     ? calcValueTradeListLiq(
              //         new BigNumber(item.filled_amount).times(new BigNumber(item.price)).toString(),
              //         item.base_name,
              //         getExchangeRate(),
              //       )
              //     : calcValueTradeListLiq(item.filled_amount, item.quote_name, getExchangeRate())
              // }`,
              `${item.pool_id}`,
              `${item.buy_user_id !== -1 ? item.buy_address : item.sell_address}`,
              `${item.buy_user_id !== -1 ? item.buy_user_id : item.sell_user_id}`,
            ]);
          }),
        );
      } else {
        const columnsName = TRANSACTION_ADD_REMOVE_COLUM.map((item) => item.displayName);
        columnsName.splice(3, 0, 'Balance');
        csvTransactionData.push(columnsName);

        transactionList.forEach((item) => {
          if (item.tokens && item.tokens.length > 0) {
            item.tokens.forEach((token) => {
              csvTransactionData.push([
                `${transactionFilter.transactionType === 'Add' ? 'Add liquidity' : 'Remove liquidity'}`,
                `${convertDateToIso(new Date(item.timestamp * 1000))}`,
                `${token.tokenInSym ? token.tokenInSym : token.tokenOutSym}`,
                `${
                  transactionFilter.transactionType === 'Add'
                    ? Number(token.tokenAmountIn).toFixed(2)
                    : Number(token.tokenAmountOut).toFixed(2)
                }`,
                `${
                  token.tokenAmountIn
                    ? calcValueTradeListLiq(token.tokenAmountIn.toString(), token.tokenInSym, getExchangeRate())
                    : calcValueTradeListLiq(token.tokenAmountOut.toString(), token.tokenOutSym, getExchangeRate())
                }`,
                `${item.poolAddress.id}`,
                `${item.userAddress.id}`,
                `${item.user_id}`,
              ]);
            });
          } else {
            csvTransactionData.push([
              `${transactionFilter.transactionType === 'Add' ? 'Add liquidity' : 'Remove liquidity'}`,
              `${convertDateToIso(new Date(item.timestamp * 1000))}`,
              ``,
              ``,
              ``,
              `${item.poolAddress.id}`,
              `${item.userAddress.id}`,
              `${item.user_id}`,
            ]);
          }
        });
      }
    }
    return csvTransactionData;
  };

  const transactionFilterFunc = (condition: TFilter) => {
    transactionFilter.endDate = condition.endDate;
    transactionFilter.startDate = condition.startDate;
    transactionFilter.pair = condition.pair;
    transactionFilter.method = condition.method;
    transactionFilter.orderId = condition.orderId;
    transactionFilter.pool = condition.pool;
    transactionFilter.tradeMethodTab = condition.tradeMethodTab;
    transactionFilter.transactionType = condition.transactionType;
    transactionFilter.userId = condition.userId;
    transactionFilter.coinId = condition.coinId;
    setTransactionFilter(transactionFilter);
    dispatch(getDownloadTransactionsApi(transactionFilter));
    dispatch(getDowloadTradesLiqApi(transactionFilter));
    dispatch(getDownloadTradesOBApi(transactionFilter));
  };

  const getMethod = (method: number[] | undefined): string => {
    const methodMap = new Map(METHOD_FILTER.map((item) => [item.value, item.label]));
    const getNetworkOfOrderBook = (item: TradingMethod): string => {
      if (item === TradingMethod.StellarOrderbook) {
        return 'Stellar ';
      } else if (item === TradingMethod.BSCOrderbook) {
        return 'BSC ';
      }
      return '';
    };
    let response = '';
    if (!method || method.length === 0) {
      const res: string[] = [];
      METHOD_FILTER_WITHOUT_PANCAKESWAP.forEach((item) => res.push(item.label));
      response = res.join('/');
    } else {
      method.forEach((item) => {
        if (methodMap.get(item) !== undefined) {
          response = `${response}/${getNetworkOfOrderBook(item)}${methodMap.get(item)}`;
        }
      });
    }
    return response;
  };
  const downloadPopupPool = (tradeMethodTabArr: number[] | undefined) => {
    if (tradeMethodTabArr && tradeMethodTabArr.length > 1) {
      return null;
    } else {
      return (
        <>
          <li className={cx('text-download-svg')}>Pool: {transactionFilter.pool ? transactionFilter.pool : '-'}</li>
          <li className={cx('text-download-svg')}>Transaction Type: {transactionFilter.transactionType}</li>
        </>
      );
    }
  };

  const nameOfPool = (tradeMethodTabArr: number[] | undefined) => {
    if (tradeMethodTabArr && tradeMethodTabArr.length > 1) {
      return '-';
    } else {
      return transactionFilter.pool ? transactionFilter.pool : '-';
    }
  };

  const popupPairOrDc = (transactionFilter: TFilter) => {
    if (
      (transactionFilter.tradeMethodTab && transactionFilter.tradeMethodTab.length > 1) ||
      transactionFilter.transactionType === 'Swap'
    ) {
      return (
        <li className={cx('text-download-svg')}>
          Pair:{' '}
          {transactionFilter.pair && pairs
            ? `${pairs?.filter((pair) => pair.pairs_id === Number(transactionFilter.pair))[0].base_symbol}/${
                pairs?.filter((pair) => pair.pairs_id === Number(transactionFilter.pair))[0].quote_symbol
              }`
            : 'All'}
        </li>
      );
    } else {
      const selectedCoin = allCoin.data.filter((item) => item.id === transactionFilter.coinId);
      return (
        <li className={cx('text-download-svg')}>Digital Credit: {selectedCoin[0] ? selectedCoin[0].name : 'All'}</li>
      );
    }
  };

  const nameOfPairOrDc = (transactionFilter: TFilter) => {
    if (
      (transactionFilter.tradeMethodTab && transactionFilter.tradeMethodTab.length > 1) ||
      transactionFilter.transactionType === 'Swap'
    ) {
      return transactionFilter.pair && pairs
        ? `${pairs?.filter((pair) => pair.pairs_id === Number(transactionFilter.pair))[0].base_symbol}/${
            pairs?.filter((pair) => pair.pairs_id === Number(transactionFilter.pair))[0].quote_symbol
          }`
        : 'All';
    } else {
      const selectedCoin = allCoin.data.filter((item) => item.id === transactionFilter.coinId);
      return selectedCoin[0] ? selectedCoin[0].name : '-';
    }
  };

  const popupTimeField = (transactionFilter: TFilter) => {
    const startDate = transactionFilter.startDate;
    const endDate = transactionFilter.endDate;
    if (startDate && endDate) {
      return (
        <li className={cx('text-download-svg')}>
          Time:{' '}
          {`${startDate.getDate()}-${startDate.getMonth() + 1}-${startDate.getUTCFullYear()} -:- ${endDate.getDate()}-${
            endDate.getMonth() + 1
          }-${endDate.getFullYear()}`}
        </li>
      );
    } else {
      return <li className={cx('text-download-svg')}>Time: -</li>;
    }
  };

  let startTime = 0;
  let endTime = 0;
  if (chartData.length) {
    startTime = chartData[0].timestamp;
    endTime = chartData[chartData.length - 1].timestamp;
  }
  const getPair = () => {
    return conditionFilter.pair && pairs
      ? `${pairs?.filter((pair) => pair.pairs_id === Number(conditionFilter.pair))[0].base_symbol}/${
          pairs?.filter((pair) => pair.pairs_id === Number(conditionFilter.pair))[0].quote_symbol
        }`
      : 'All';
  };

  const getPoolAddress = () => {
    return conditionFilter.poolAddress ? conditionFilter.poolAddress : '-';
  };

  const getTime = () => {
    if (downloadConditionFilter.startTime && downloadConditionFilter.endTime) {
      return `${convertDate(new Date(downloadConditionFilter.startTime))} -:- ${convertDate(
        new Date(downloadConditionFilter.endTime),
      )} `;
    } else {
      return '-';
    }
  };

  const convertString = (name: string) => {
    return name.replace(/[_ /-]/g, '_');
  };

  const transactionTypeToName = (transactionFilter: TFilter) => {
    if (
      transactionFilter.tradeMethodTab &&
      transactionFilter.tradeMethodTab.length > 1 &&
      transactionFilter.transactionType === undefined
    ) {
      return 'OrderBook';
    }
    if (
      transactionFilter.tradeMethodTab &&
      transactionFilter.tradeMethodTab.length === 1 &&
      transactionFilter.transactionType !== undefined
    ) {
      return transactionFilter.transactionType === 'Swap' ? 'Swap' : `${transactionFilter.transactionType}Liquidity`;
    }
  };

  return (
    <div className={cx('market-overview')}>
      <div>
        <LinksBreadcrumbs
          value={[
            {
              content: 'Dashboard',
              onClick: (): void => history.push(routeConstants.FX_CROSS_MATRIX),
            },
            {
              content: 'Market overview',
              onClick: (): void => history.push(routeConstants.MARKETOVERVIEW),
            },
          ]}
        />
        <div className={cx('market-title')}>
          Collected fees
          {showDownloadCollectedFee ? (
            <button onClick={downloadData} className={cx('btn-export')}></button>
          ) : (
            <button className={cx('btn-export-disable')}></button>
          )}
        </div>
        <div className={cx('filter-container')}>
          <FilterChart
            conditionFilter={conditionFilter}
            setConditionFilter={setConditionFilter}
            setDownloadFeeFilter={setDownloadConditionFilter}
          />
        </div>
        <div>
          {/* Chart */}
          <div className={cx('wrap-container')}>
            <div className={cx('time-filter')}>
              <span>Time</span>

              <TabsSwitch
                type="chart"
                options={TimeFilterTabs.slice(0, 3)}
                defaultOption={timeFilterTab}
                onSelect={handleSelectTimeFilter}
              />

              <CustomDateRangePicker
                onChange={handleChangeDateRange}
                classNameProps={'fix-style-date-range'}
                maxDate={subTimeJS(new Date(), 1, 'day')}
                minDate={subTimeJS(new Date(), 1, 'year')}
                inChart
                defaultEndDate={subTimeJS(new Date(new Date().setHours(0, 0, 0, 0)), 1, 'day')}
              />
            </div>

            <Spline
              theme={theme}
              animationsEnable
              series={[
                {
                  name: 'Collected fee',
                  data:
                    chartData.length > 0
                      ? chartData.map((item) => ({
                          x: formatChartTime(Number(item.timestamp), timeFilterTab, startTime, endTime),
                          y: item.value,
                        }))
                      : [],
                },
              ]}
              labels={chartData.length > 0 ? chartData.map((item) => String(item.timestamp)) : []}
              formatterYAxis={(value) => formatCurrencyAmount(value, selectedCurrency, exchangeRates, '0')}
            />
          </div>
        </div>
        <div className={cx('tabs-market-overview')}>
          <div className={cx('market-title')}>
            Transactions
            {showDownloadTransactionBtn ? (
              <DButton onClick={downloadTransactionData} classNamePrefix={cx('btn-export')}></DButton>
            ) : (
              <DButton classNamePrefix={cx('btn-export-disable')}></DButton>
            )}
          </div>
          <div className={cx('table-info')}>
            <TradeHistory
              modeDisplay={ModeDisplay.user}
              limitRecord={10}
              historyTransactionFilter={transactionFilterFunc}
            />
          </div>
        </div>
      </div>
      {/* POPUP DOWNLOAD COLLECTED FEES */}
      <>
        {
          <Dialog
            className={cx('modal-type')}
            open={openPopup}
            onClose={() => setOpenPopup(false)}
            aria-labelledby="responsive-dialog-title"
          >
            <div>
              <DialogTitle id="responsive-dialog-title" className={cx('title-download')}>
                <p className={cx('title-download-svg')}>
                  Download
                  <IconButton aria-label="close" onClick={handleSubmitCancel} className={cx('btn-close')}>
                    <CloseIcon className={cx('csv-close')} />
                  </IconButton>
                </p>
                <button
                  className={
                    theme === THEME_MODE.DARK
                      ? cx('img-download-svg', 'csv-common')
                      : cx('csv-common', 'img-download-light')
                  }
                ></button>
              </DialogTitle>
              <DialogContent className={cx('modal-content')}>
                <p className={cx('text-download-svg')}>
                  Are you sure want to download CSV file for Collected fees filtered by:
                </p>
                <ul>
                  <li className={cx('text-download-svg')}>Method: {getMethod(conditionFilter.methods)}</li>
                  <li className={cx('text-download-svg')}>Pair: {getPair()}</li>
                  <li className={cx('text-download-svg')}>Pool: {getPoolAddress()}</li>
                  <li className={cx('text-download-svg')}>Time: {getTime()}</li>
                </ul>
              </DialogContent>
              <DialogActions onClick={handleSubmitCancel}>
                <div className={cx('btn-action')}>
                  <CsvDownloader
                    filename={convertString(
                      `Collectedfees_${
                        conditionFilter.startTime
                          ? convertDate(new Date(conditionFilter.startTime - 7 * ChartDataInterval.Hour)).replaceAll(
                              '-',
                              '',
                            )
                          : ''
                      }_${
                        conditionFilter.endTime
                          ? convertDate(new Date(conditionFilter.endTime - 7 * ChartDataInterval.Hour)).replaceAll(
                              '-',
                              '',
                            )
                          : ''
                      }_${getMethod(conditionFilter.methods)}_${getPair()}${
                        getPoolAddress() && getPoolAddress() !== '-' ? `_${getPoolAddress()}` : ''
                      }`,
                    )}
                    extension=".csv"
                    separator=";"
                    wrapColumnChar=""
                    datas={getCsvData}
                    text="Download"
                  />
                </div>
              </DialogActions>
            </div>
          </Dialog>
        }
      </>
      {/* POPUP DOWNLOAD TRANSACTION */}
      <>
        {
          <Dialog
            className={cx('modal-type')}
            open={openTransactionPopup}
            onClose={() => setOpenTransactionPopup(false)}
            aria-labelledby="responsive-dialog-title"
          >
            <div>
              <DialogTitle id="responsive-dialog-title" className={cx('title-download')}>
                <p className={cx('title-download-svg')}>
                  Download
                  <IconButton
                    aria-label="close"
                    onClick={handleSubmitCloseTransactionDownload}
                    className={cx('btn-close')}
                  >
                    <CloseIcon className={cx('csv-close')} />
                  </IconButton>
                </p>
                <button
                  className={
                    theme === THEME_MODE.DARK
                      ? cx('img-download-svg', 'csv-common')
                      : cx('csv-common', 'img-download-light')
                  }
                ></button>
              </DialogTitle>
              <DialogContent className={cx('modal-content')}>
                <p className={cx('text-download-svg')}>
                  Are you sure want to download CSV file for Transaction filtered by:
                </p>
                <ul>
                  {popupPairOrDc(transactionFilter)}
                  <li className={cx('text-download-svg')}>
                    User ID: {transactionFilter.userId ? transactionFilter.userId : '-'}
                  </li>
                  {downloadPopupPool(transactionFilter.tradeMethodTab)}
                  {popupTimeField(transactionFilter)}
                </ul>
              </DialogContent>
              <DialogActions onClick={handleSubmitCloseTransactionDownload}>
                <div className={cx('btn-action')}>
                  <CsvDownloader
                    filename={convertString(
                      `Transactions_${transactionTypeToName(transactionFilter)}_${
                        transactionFilter.startDate
                          ? convertDate(new Date(transactionFilter.startDate)).replaceAll('-', '')
                          : ''
                      }_${
                        transactionFilter.endDate
                          ? convertDate(new Date(transactionFilter.endDate)).replaceAll('-', '')
                          : ''
                      }${
                        nameOfPairOrDc(transactionFilter) && nameOfPairOrDc(transactionFilter) !== '-'
                          ? `_${nameOfPairOrDc(transactionFilter)}`
                          : '_All'
                      }${
                        nameOfPool(transactionFilter.tradeMethodTab) &&
                        nameOfPool(transactionFilter.tradeMethodTab) !== '-'
                          ? `_${nameOfPool(transactionFilter.tradeMethodTab)}`
                          : ''
                      }`,
                    )}
                    extension=".csv"
                    separator=";"
                    wrapColumnChar=""
                    datas={getTransactionCsvData}
                    text="Download"
                  />
                </div>
              </DialogActions>
            </div>
          </Dialog>
        }
      </>
    </div>
  );
};

export default MarketOverView;
