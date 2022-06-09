/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import { Tooltip } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { HelpOutline } from '@material-ui/icons';
import CloseIcon from '@material-ui/icons/Close';
import { Pagination } from '@material-ui/lab';
import BigNumber from 'bignumber.js';
import classnames from 'classnames/bind';
import _ from 'lodash';
import moment from 'moment';
import React, { ChangeEvent, ReactElement, useEffect, useRef, useState } from 'react';
import CsvDownloader from 'react-csv-downloader';
import { Link } from 'react-router-dom';
import { SortDownHighLightIcon, SortDownIcon, SortUpHighLightIcon, SortUpIcon } from 'src/assets/icon';
import { CCheckbox } from 'src/components/Base/Checkbox';
import CustomDateRangePicker from 'src/components/Base/DatePicker';
import DButton from 'src/components/Base/DButton/DButton';
import { CInput } from 'src/components/Base/Input';
import { CSelect } from 'src/components/Base/Select';
import { ISelect } from 'src/components/Base/Select/Select';
import stylesPagition from 'src/components/Pagination/style';
import { DownloadType } from 'src/features/MarketOverview/constants';
import { renderAddressWallet } from 'src/features/MarketOverview/helper';
import { convertTimeSubmit, qsStringRemoveFalsy, setTimeUTC } from 'src/features/User/components/ProfitAndLoss/helper';
import { IPnlResponse, IPnlsLiquidityResponse } from 'src/features/User/components/ProfitAndLoss/interface';
import { DATA_RADIO, DEFAULT_END_DATE, MAX_DATE, MIN_DATE } from 'src/features/User/components/Transactions/Constant';
import {
  HEADER_EXPORT_DC_POOL,
  HEADER_EXPORT_TRANSFER,
  HEADER_EXPORT_USER_BALANCES,
  WalletStatus,
} from 'src/features/User/constants';
import { convertValueUSDToCurSelector, getRateFromCurrencies } from 'src/features/User/helpers/helper';
import { isBscAddress } from 'src/helpers/bssHelper/address';
import { renderDateFormat } from 'src/helpers/date';
import { getAllBalanceInStellar, getBalanceInBsc } from 'src/helpers/getBalance';
import { isStellarPublicKey } from 'src/helpers/stellarHelper/address';
import useOnClickOutside from 'src/hooks/useClickOutside';
import { IResponseService } from 'src/interfaces/response';
import { THEME_MODE } from 'src/interfaces/theme';
import axiosInstance from 'src/services/config';
import { useAppSelector } from 'src/store/hooks';
import { getBalancesInPools, PoolsInfoInPool, totalBalances } from '../../helpers/helper';
import { AllCoin, BalancesInOrderRes, EnumFilterType, IListBalancesInfo, Wallets } from '../../interfaces';
import styles from './Balances.module.scss';
import {
  balancesAddressLowerCase,
  DEFAULT_PAGE,
  HIDE_SMALL_BALANCES,
  IBalanceItem,
  IBalancesInfo,
  KeySortBalancesInfo,
  MAX_SIZE_SHOW_ADDRESS,
  OrderBy,
  Value,
} from './misc';
import PieChartBalances from './PieChartBalane';
import { qsStringify } from 'src/helpers/query-string';
import { currencySelector } from 'src/helpers/functional-currency';
import { TooltipAddress } from 'src/features/User/components/Balances/TooltipAddress';
import { subTimeJS } from 'src/helpers/date';

enum Network {
  Stellar = 1,
  Bsc = 2,
}
const isDateUTCEqualDateTimezone =
  new Date().getUTCDate() === new Date().getDate() && new Date().getHours() >= setTimeUTC(2).getHours();

const cx = classnames.bind(styles);
const Balances: React.FC = () => {
  const classesPagination = stylesPagition();
  const theme = useAppSelector((state) => state.theme.themeMode);
  const rootState = useAppSelector((state) => state);
  const allCoins: AllCoin[] = useAppSelector((state) => state.allCoins.coins.data);
  const selectedFunCurrenciesId = useAppSelector((state) => state.auth.currentUser.selectedFunctionalCurrencyId);
  const [balancesAllInfo, setBalancesAllInfo] = useState<IBalancesInfo[]>([]);
  const [balancesAllInfoShow, setBalancesAllInfoShow] = useState<IBalancesInfo[]>([]);
  const poolInfoRef = useRef<PoolsInfoInPool[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [pagingBlsInfo, setPagingBlsInfo] = useState(DEFAULT_PAGE);
  const [keySortBalanesInfo, setKeySortBalancesInfo] = useState<KeySortBalancesInfo>('total');
  const [sortType, setSortBy] = useState<OrderBy>(OrderBy.Asc);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const isNetworkWallet = useRef<number>(0);

  const [curWalletPage, setCurWalletPage] = useState(1);
  const [totalWalletPage, setTotalWalletPage] = useState(1);
  const [walletOptions, setWalletOptions] = useState<ISelect[]>([]);
  const [filterBalances, setFilterBalances] = useState({
    search: '',
    hideSmall: false,
    wallet: '',
  });
  const [showDigitalCredit, setShowDigitalCredit] = useState<string>('');
  const [openPopup, setOpenPopup] = useState(false);
  const [valueRadio, setValueRadio] = React.useState(DATA_RADIO[0].value);
  const [endDate, setEndDate] = useState(DEFAULT_END_DATE);
  const [startDate, setStartDate] = useState(subTimeJS(new Date(), isDateUTCEqualDateTimezone ? 30 : 31, 'day'));
  const userId = window.location.pathname.split('/')[2];
  const selectedCurrency = useAppSelector(currencySelector);

  const ref = useRef<any>();
  useOnClickOutside(ref, () => setShowDigitalCredit(''));
  const openPopupDownLoad = () => {
    setOpenPopup(true);
    setValueRadio(DATA_RADIO[0].value);
    setStartDate(subTimeJS(new Date(), isDateUTCEqualDateTimezone ? 30 : 31, 'day'));
    setEndDate(DEFAULT_END_DATE);
  };
  const handleSubmitCancel = () => {
    setOpenPopup(false);
  };
  const handleChangeRadio = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValueRadio((event.target as HTMLInputElement).value);
  };
  const changeStartDate = (e: Date) => {
    setStartDate(e);
  };
  const changeEndDate = (e: Date) => {
    setEndDate(e);
  };

  const getValueDownload = (value: number): number => {
    return selectedCurrency.id === 0 ? value : convertValueUSDToCurSelector(value, rootState);
  };

  const renderFileName = () => {
    const valueName = _.find(DATA_RADIO, (item) => {
      return item.value === valueRadio;
    });
    const nameChoose = valueName?.name.replaceAll(' ', '_');
    const startDateFormat = moment(startDate).format('DD/MM/YYYY').replaceAll('/', '');
    const endDateFormat = moment(endDate).format('DD/MM/YYYY').replaceAll('/', '');
    const fileName = 'UserID' + userId + '_' + nameChoose + '_' + startDateFormat + '_' + endDateFormat + '';
    return fileName;
  };
  const handleDownload = async () => {
    let csvData: any[] = [];
    switch (valueRadio) {
      case 'wallet':
        csvData = [];
        const dataExportWalletApi: IResponseService<IPnlResponse[]> = await axiosInstance.get('/admin/users/pnl', {
          params: qsStringRemoveFalsy({
            from: convertTimeSubmit(startDate).getTime(),
            to: convertTimeSubmit(endDate).getTime(),
            wallet: filterBalances.wallet,
            user_id: userId,
          }),
        });
        await axiosInstance.post('/admin/write-log-download', {
          adminEmail: currentUser.email,
          adminId: currentUser.id,
          downloadType: DownloadType.WalletBalances,
        });
        csvData.push(HEADER_EXPORT_USER_BALANCES.map((i) => i.displayName));
        for (const data of dataExportWalletApi.data) {
          csvData.push([
            `${data.user_id}`,
            renderDateFormat(new Date(data.date)),
            data.wallet,
            data.symbol,
            new BigNumber(data.balance).toNumber().toFixed(2),
            getValueDownload(new BigNumber(data.balance).times(new BigNumber(data.rate)).toNumber()).toFixed(2),
          ]);
        }
        return csvData;

      case 'liquidity':
        csvData = [];
        const dataExportLiquidityApi: IResponseService<IPnlsLiquidityResponse[]> = await axiosInstance.get(
          '/admin/users/pool-pnl',
          {
            params: qsStringRemoveFalsy({
              from: convertTimeSubmit(startDate).getTime(),
              to: convertTimeSubmit(endDate).getTime(),
              wallet: filterBalances.wallet,
              user_id: userId,
            }),
          },
        );
        await axiosInstance.post('/admin/write-log-download', {
          adminEmail: currentUser.email,
          adminId: currentUser.id,
          downloadType: DownloadType.AddedLiquidity,
        });
        csvData.push(HEADER_EXPORT_DC_POOL.map((i) => i.displayName));
        for (const data of dataExportLiquidityApi.data) {
          csvData.push([
            `${data.user_id}`,
            renderDateFormat(new Date(data.date)),
            data.wallet,
            data.symbol,
            new BigNumber(data.balance).toNumber().toFixed(2),
            getValueDownload(new BigNumber(data.balance).times(new BigNumber(data.price)).toNumber()).toFixed(2),
            data.pool_id,
          ]);
        }
        return csvData;

      case 'transfer':
        csvData = [];
        const dataExportTransferApi: IResponseService<IPnlResponse[]> = await axiosInstance.get('/admin/users/pnl', {
          params: qsStringRemoveFalsy({
            from: convertTimeSubmit(startDate).getTime(),
            to: convertTimeSubmit(endDate).getTime(),
            wallet: filterBalances.wallet,
            user_id: userId,
          }),
        });
        await axiosInstance.post('/admin/write-log-download', {
          adminEmail: currentUser.email,
          adminId: currentUser.id,
          downloadType: DownloadType.DigitalCreditLPTransfer,
        });
        csvData.push(HEADER_EXPORT_TRANSFER.map((i) => i.displayName));
        for (const data of dataExportTransferApi.data) {
          csvData.push([
            `${data.user_id}`,
            renderDateFormat(new Date(data.date)),
            data.wallet,
            data.symbol,
            Number(data.transfer_amount) > 0 ? Number(data.transfer_amount).toFixed(2) : 0,

            Number(data.transfer_amount) > 0
              ? getValueDownload(
                  new BigNumber(data.transfer_amount).times(new BigNumber(data.rate)).toNumber(),
                ).toFixed(2)
              : 0,
            Number(data.transfer_amount) < 0 ? Number(data.transfer_amount).toFixed(2) : 0,
            Number(data.transfer_amount) < 0
              ? getValueDownload(
                  new BigNumber(data.transfer_amount).times(new BigNumber(data.rate)).toNumber(),
                ).toFixed(2)
              : 0,
          ]);
        }
        return csvData;
      default:
        return [];
    }
  };

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
        setFilterBalances({ ...filterBalances, wallet: data[0].value });
      } else if (curWalletPage <= totalWalletPage) {
        setWalletOptions((prevState) => [...prevState, ...data]);
      }
    })();
  }, [curWalletPage]);

  // Effect filter balances
  useEffect(() => {
    let isMounted = true;
    isNetworkWallet.current = 0;
    if (isMounted && filterBalances.wallet) {
      const initBalances: Array<IBalanceItem[]> = [];
      let listPool: IBalancesInfo[] = [];
      (async () => {
        if (await isStellarPublicKey(filterBalances.wallet)) {
          isNetworkWallet.current = Network.Stellar;
        }
        if (await isBscAddress(filterBalances.wallet)) {
          isNetworkWallet.current = Network.Bsc;
        }
        setLoading(true);
        try {
          // In Order
          const resOrder: IResponseService<BalancesInOrderRes[]> = await axiosInstance.get(`/admin/balances-in-order`, {
            params: { wallet: filterBalances.wallet, user_id: userId },
          });
          if (resOrder.data?.length) {
            const resOrderMap = resOrder.data.map((item) => ({
              ...item,
              type: EnumFilterType.Order,
            }));
            initBalances.push(resOrderMap);
          }

          // Available Stellar => available = balances - selling_liabilities
          if (await isStellarPublicKey(filterBalances.wallet)) {
            const availableStellar = await getAllBalanceInStellar(filterBalances.wallet);
            const availableStellarMap = availableStellar.map((item) => ({
              value: new BigNumber(item.balance).minus(new BigNumber(item.selling_liabilities)).toNumber(),
              symbol: item.asset_code,
              address: filterBalances.wallet,
              type: EnumFilterType.Available,
            }));
            initBalances.push(availableStellarMap);
          }

          // Available BSC
          if (await isBscAddress(filterBalances.wallet)) {
            await Promise.all(
              allCoins.map((item: AllCoin) => getBalanceInBsc(filterBalances.wallet, item.bsc_address, item.decimal)),
            ).then((values) => {
              const availableBSCMap = values.map((v, i) => ({
                symbol: allCoins[i]?.symbol,
                value: new BigNumber(v).toNumber(),
                address: filterBalances.wallet,
                type: EnumFilterType.Available,
              }));
              initBalances.push(availableBSCMap);
            });

            // In Pools only BSC
            const balancesPools = await getBalancesInPools(
              filterBalances.wallet,
              allCoins.map((i) => i.symbol),
            );
            const balancesPoolsMap = balancesPools.poolsBalances.map((item) => ({
              ...item,
              address: filterBalances.wallet,
              type: EnumFilterType.Pool,
            }));
            initBalances.push(balancesPoolsMap);

            // set pool info merge to balances info
            poolInfoRef.current = balancesPools.poolsInfo;
            listPool = poolInfoRef.current.map((i) => ({
              symbol: i.symbol,
              total: i.myShareBalance,
              available: i.myShareBalance,
              order: 0,
              pool: 0,
              address: [filterBalances.wallet],
              urlBsc: i.urlBsc,
              value: totalBalances(
                i.value.map((it) => ({
                  symbol: it.digitalCredits,
                  value: new BigNumber(it.myAssetValue).toNumber(),
                })),
              ),
            }));
          }
        } catch (error) {
          throw error;
        } finally {
          setLoading(false);
          const data: IListBalancesInfo[] = initBalances.flat().map((item) => ({
            ...item,
            amount: item.value,
            address: item.address,
          }));

          const res = data.reduce((arrayTotal: IBalancesInfo[], item: IListBalancesInfo) => {
            const index = arrayTotal.findIndex((v) => v.symbol === item.symbol);
            if (index !== -1) {
              const totalIndex = arrayTotal[index];
              if (item.type === EnumFilterType.Order) {
                totalIndex.order = new BigNumber(totalIndex.order).plus(new BigNumber(item.amount)).toNumber();
              }
              if (item.type === EnumFilterType.Pool || item.type === EnumFilterType.LpToken) {
                totalIndex.pool = new BigNumber(totalIndex.pool).plus(new BigNumber(item.amount)).toNumber();
              }
              if (item.type === EnumFilterType.Available) {
                totalIndex.available = new BigNumber(totalIndex.available).plus(new BigNumber(item.amount)).toNumber();
              }

              arrayTotal.splice(index, 1, {
                ...arrayTotal[index],
                value: new BigNumber(arrayTotal[index]?.value)
                  .plus(new BigNumber(item.amount).div(new BigNumber(getRateFromCurrencies(item.symbol, rootState))))
                  .toNumber(),
                total: new BigNumber(arrayTotal[index]?.total).plus(new BigNumber(item.amount)).toNumber(),
                address: !arrayTotal[index]?.address.includes(item.address)
                  ? arrayTotal[index]?.address.concat(item.address)
                  : arrayTotal[index]?.address,
              });
            } else {
              arrayTotal.push({
                total: new BigNumber(item.amount).toNumber(),
                symbol: item.symbol,
                address: [item.address],
                order: item.type === EnumFilterType.Order ? item.amount : 0,
                available: item.type === EnumFilterType.Available ? item.amount : 0,
                pool: item.type === EnumFilterType.Pool ? item.amount : 0,
                value: new BigNumber(item.amount)
                  .div(new BigNumber(getRateFromCurrencies(item.symbol, rootState)))
                  .toNumber(),
              });
            }
            const rs = arrayTotal.filter((item) => item.total > 0);
            return rs;
          }, []);
          setPagingBlsInfo({
            ...pagingBlsInfo,
            totalPage: Math.ceil((res.length + poolInfoRef.current.length) / DEFAULT_PAGE.limit),
          });

          const reducePoolIdbyDigital = allCoins.map((coin) => ({
            symbol: coin.symbol,
            poolId: poolInfoRef.current
              .filter((pool) => pool.value.find((i) => i.digitalCredits === coin.symbol))
              .map((i) => i.address),
          }));

          setBalancesAllInfo(
            res
              .map((i) => ({
                ...i,
                address: i.address.concat(reducePoolIdbyDigital.find((dig) => dig.symbol === i.symbol)?.poolId || []),
              }))
              .concat(listPool),
          );
        }
      })();
    }
    return () => {
      isMounted = false;
    };
  }, [filterBalances.wallet]);

  useEffect(() => {
    const data = balancesAllInfo.sort((a: IBalancesInfo, b: IBalancesInfo) =>
      sortType === OrderBy.Asc
        ? b[keySortBalanesInfo] - a[keySortBalanesInfo]
        : a[keySortBalanesInfo] - b[keySortBalanesInfo],
    );
    setBalancesAllInfoShow(() =>
      data.map((i) => ({
        ...i,
        value: convertValueUSDToCurSelector(i.value, rootState),
      })),
    );

    if (filterBalances.hideSmall) {
      setBalancesAllInfoShow((bls) => bls.filter((item) => item.total > HIDE_SMALL_BALANCES));
    }
    if (filterBalances.search) {
      setBalancesAllInfoShow((bls) =>
        bls.filter((item) =>
          `${item.symbol}${item.urlBsc}`.toLowerCase().includes(filterBalances.search.toLowerCase()),
        ),
      );
    }
    setPagingBlsInfo((pagingBlsInfo) => ({
      ...pagingBlsInfo,
      totalPage: Math.ceil(balancesAllInfoShow.length / DEFAULT_PAGE.limit),
    }));
  }, [
    filterBalances.search,
    filterBalances.hideSmall,
    filterBalances.wallet,
    pagingBlsInfo.page,
    keySortBalanesInfo,
    sortType,
    selectedFunCurrenciesId,
    balancesAllInfo,
  ]);

  useEffect(() => {
    setPagingBlsInfo({
      ...pagingBlsInfo,
      page: 1,
    });
  }, [filterBalances.wallet, filterBalances.search, filterBalances.hideSmall]);

  const renderSortItem = (title: string, key: KeySortBalancesInfo) => {
    return (
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          justifyContent: 'flex-end',
        }}
        onClick={() => {
          setKeySortBalancesInfo(key);
          setSortBy(sortType === OrderBy.Asc ? OrderBy.Desc : OrderBy.Asc);
        }}
      >
        {key === 'order' && (
          <Tooltip
            title={`When users place an order, the balance to execute the order will be locked in a smart contract. This will be displayed as “In order”`}
          >
            <span style={{ marginRight: 4 }} className={cx('chart-element__info--tooltip')}>
              <HelpOutline
                style={{ color: 'var(--title-active)' }}
                fontSize={'inherit'}
                className={cx('tooltip-icon')}
              />
            </span>
          </Tooltip>
        )}
        {title}
        <span
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginLeft: 4,
          }}
        >
          <img
            width={6}
            height={6}
            src={sortType === OrderBy.Desc && keySortBalanesInfo === key ? SortUpHighLightIcon : SortUpIcon}
          />
          <img
            width={6}
            height={6}
            src={sortType === OrderBy.Asc && keySortBalanesInfo === key ? SortDownHighLightIcon : SortDownIcon}
          />
        </span>
      </span>
    );
  };

  const handleChangePage = (event: ChangeEvent<unknown>, value: number) => {
    setPagingBlsInfo({
      ...pagingBlsInfo,
      page: value,
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 20 }}>
        <div
          className={cx('open-order__select')}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div style={{ marginRight: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ marginRight: 20, color: 'var(--title-active)' }}>Wallet: </label>
            <CSelect
              options={walletOptions}
              value={{ value: filterBalances.wallet, label: renderAddressWallet(filterBalances.wallet) }}
              onMenuScrollToBottom={() => setCurWalletPage((state) => (state < totalWalletPage ? state + 1 : state))}
              onChange={(wallet: string) =>
                setFilterBalances({
                  ...filterBalances,
                  wallet,
                })
              }
            />
          </div>
          <DButton onClick={openPopupDownLoad} classNamePrefix={cx('btn-export')}></DButton>
        </div>
      </div>

      <PieChartBalances wallet={filterBalances.wallet} userId={userId} />

      <div className={cx('table-info')}>
        <div className={cx('open-order')}>
          <div className={cx('open-order__search')}>
            <div style={{ marginRight: 20, minWidth: 350 }}>
              <CInput
                isSearch
                size="sm"
                placeholder="Search"
                // onChange={(e: string) =>
                //   setFilterBalances({
                //     ...filterBalances,
                //     search: e,
                //   })
                // }
                onKeyPress={(e: string) =>
                  setFilterBalances({
                    ...filterBalances,
                    search: e,
                  })
                }
                onBlur={(e: string) =>
                  setFilterBalances({
                    ...filterBalances,
                    search: e,
                  })
                }
              />
            </div>
            <div className={cx('open-order__search')}>
              <CCheckbox
                size="small"
                content="Hide small balances"
                onClick={() =>
                  setFilterBalances({
                    ...filterBalances,
                    hideSmall: !filterBalances.hideSmall,
                  })
                }
                checked={filterBalances.hideSmall}
              />
              <Tooltip
                title={`Your digital credits that have total smaller than ${HIDE_SMALL_BALANCES} are classified as small balances`}
              >
                <span className={cx('chart-element__info--tooltip')}>
                  <HelpOutline
                    style={{ color: 'var(--title-active)' }}
                    fontSize={'inherit'}
                    className={cx('tooltip-icon')}
                  />
                </span>
              </Tooltip>
            </div>
          </div>
        </div>
        {/* <FilterBarUser /> */}
        <div className={cx('table')}>
          <table>
            <thead>
              <tr>
                <th>Digital Credit</th>
                <th>{renderSortItem('Total', 'total')}</th>
                <th>{renderSortItem('Available', 'available')}</th>
                <th>{renderSortItem('In order', 'order')}</th>
                <th>{renderSortItem('In pool', 'pool')}</th>
                <th>{renderSortItem(`Value (${selectedCurrency.symbol})`, 'value')}</th>
                <th>Sources</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                balancesAllInfoShow.length > 0 &&
                balancesAllInfoShow
                  ?.slice((pagingBlsInfo.page - 1) * DEFAULT_PAGE.limit, pagingBlsInfo.page * DEFAULT_PAGE.limit)
                  ?.map((balance: IBalancesInfo, index: number) => (
                    <tr className="cursor-pointer" key={index}>
                      <td>
                        {balance.symbol.includes('0x') ? (
                          <a
                            className={cx('detail__link')}
                            style={{ color: 'var(--color-primary)' }}
                            target="_blank"
                            rel="noreferrer"
                            href={`${process.env.REACT_APP_ETHERSCAN || ''}/token/${balance.urlBsc}`}
                          >
                            {balance.symbol}
                          </a>
                        ) : (
                          balance.symbol
                        )}
                      </td>
                      <td className={cx('td-right')}>{new BigNumber(balance.total.toFixed(2)).toFormat()}</td>
                      <td className={cx('td-right')}>
                        {new BigNumber(new BigNumber(balance.available).toFixed(2)).toFormat()}
                      </td>
                      <td className={cx('td-right')}>
                        {new BigNumber(new BigNumber(balance.order).toFixed(2)).toFormat()}
                      </td>
                      <td className={cx('td-right')}>
                        {new BigNumber(new BigNumber(balance.pool).toFixed(2)).toFormat()}
                      </td>
                      <td className={cx('td-right')}>
                        {`${selectedCurrency.symbol}${new BigNumber(
                          new BigNumber(balance.value).toFixed(2),
                        ).toFormat()}`}
                      </td>
                      <td>
                        {isNetworkWallet.current === Network.Stellar ? (
                          <TooltipAddress title={filterBalances.wallet}>
                            <span>{renderAddressWallet(filterBalances.wallet)}</span>
                          </TooltipAddress>
                        ) : (
                          <span>
                            {balancesAddressLowerCase(balance.address).length > MAX_SIZE_SHOW_ADDRESS ? (
                              <span>
                                {balancesAddressLowerCase(balance.address)
                                  .slice(0, MAX_SIZE_SHOW_ADDRESS)
                                  .map((item, index) => (
                                    <TooltipAddress key={item} title={item}>
                                      {filterBalances.wallet.toLowerCase() === item ? (
                                        <span key={item}>{`${renderAddressWallet(item)}${
                                          index < MAX_SIZE_SHOW_ADDRESS - 1 ? ', ' : ''
                                        }`}</span>
                                      ) : (
                                        <Link
                                          className={cx('detail__link')}
                                          target="_blank"
                                          rel="noreferrer"
                                          to={`/pools/${item}`}
                                          style={{ color: 'var(--color-primary)' }}
                                        >
                                          {renderAddressWallet(item)}
                                          {`${index < MAX_SIZE_SHOW_ADDRESS - 1 ? ', ' : ''}`}
                                        </Link>
                                      )}
                                    </TooltipAddress>
                                  ))}
                                <span
                                  className={cx('see-more')}
                                  onClick={() => setShowDigitalCredit(balance.symbol)}
                                  style={{ position: 'relative' }}
                                >
                                  See more
                                  {showDigitalCredit && showDigitalCredit === balance.symbol && (
                                    <div
                                      ref={ref}
                                      style={{
                                        position: 'absolute',
                                        padding: 8,
                                        background: 'var(--block-background)',
                                        zIndex: 2,
                                        border: '1px solid var(--color-line)',
                                        borderRadius: 10,
                                        maxHeight: 200,
                                        overflowY: 'auto',
                                      }}
                                    >
                                      {balance.address.slice(MAX_SIZE_SHOW_ADDRESS).map((i) => (
                                        <div
                                          style={{
                                            margin: '5px 0',
                                          }}
                                          key={i}
                                        >
                                          <Link
                                            className={cx('detail__link')}
                                            target="_blank"
                                            rel="noreferrer"
                                            to={`/pools/${i}`}
                                            style={{ color: 'var(--color-primary)' }}
                                          >
                                            {i}
                                          </Link>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </span>
                              </span>
                            ) : (
                              <span>
                                {balancesAddressLowerCase(balance.address).map((item, index) =>
                                  filterBalances.wallet.toLowerCase() === item ? (
                                    <TooltipAddress title={filterBalances.wallet || item}>
                                      <span key={item}>{`${renderAddressWallet(filterBalances.wallet || item)}${
                                        index < MAX_SIZE_SHOW_ADDRESS - 1 && index < balance.address.length - 1
                                          ? ', '
                                          : ''
                                      }`}</span>
                                    </TooltipAddress>
                                  ) : (
                                    <TooltipAddress title={item}>
                                      <Link
                                        className={cx('detail__link')}
                                        target="_blank"
                                        rel="noreferrer"
                                        to={`/pools/${item}`}
                                        style={{ color: 'var(--color-primary)' }}
                                      >
                                        {renderAddressWallet(item)}
                                        {`${
                                          index < MAX_SIZE_SHOW_ADDRESS - 1 && index !== balance.address.length - 1
                                            ? ', '
                                            : ''
                                        }`}
                                      </Link>
                                    </TooltipAddress>
                                  ),
                                )}
                              </span>
                            )}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {loading && <div className={cx('table-no-data')}>Loading...</div>}
          {!loading && !filterBalances.search && !balancesAllInfoShow.length && (
            <div className={cx('table-no-data')}>No record</div>
          )}
          {!loading && filterBalances.search && !balancesAllInfoShow.length && (
            <div className={cx('table-no-data')}>Not found</div>
          )}
          {Math.ceil(balancesAllInfoShow.length / DEFAULT_PAGE.limit) > 1 && (
            <div className={cx('footer-pagination')}>
              <Pagination
                className={classesPagination.pagination}
                count={Math.ceil(balancesAllInfoShow.length / DEFAULT_PAGE.limit)}
                page={pagingBlsInfo.page}
                variant="outlined"
                shape="rounded"
                onChange={handleChangePage}
              />
            </div>
          )}
          {
            <Dialog
              className={cx('modal-type')}
              // open={openPopup}
              open={openPopup && !!filterBalances.wallet}
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
                  <div className={cx('box-radio')}>
                    <FormControl component="fieldset">
                      <RadioGroup aria-label="gender" name="balances" value={valueRadio} onChange={handleChangeRadio}>
                        {DATA_RADIO.length > 0 &&
                          DATA_RADIO.map((item: Value, index: number): ReactElement => {
                            return (
                              <FormControlLabel
                                key={index}
                                value={item.value}
                                control={<Radio className={cx('radio')} color="primary" />}
                                label={item.name}
                              />
                            );
                          })}
                      </RadioGroup>
                    </FormControl>
                  </div>
                  <div className={cx('box-search')}>
                    <div className={cx('box-start')}>
                      <label className={cx('text-start')} htmlFor="">
                        Start
                      </label>
                      <CustomDateRangePicker
                        selected={startDate}
                        minDate={MIN_DATE}
                        maxDate={endDate}
                        onChange={changeStartDate}
                      ></CustomDateRangePicker>
                    </div>
                    <div className={cx('box-end')}>
                      <label className={cx('text-end')} htmlFor="">
                        End
                      </label>
                      <CustomDateRangePicker
                        selected={endDate}
                        minDate={startDate}
                        maxDate={MAX_DATE}
                        onChange={changeEndDate}
                      ></CustomDateRangePicker>
                    </div>
                  </div>
                </DialogContent>
                <DialogActions>
                  <div className={cx('btn-action')}>
                    <CsvDownloader
                      className={cx('btn-download')}
                      filename={renderFileName()}
                      extension=".csv"
                      separator=";"
                      wrapColumnChar=""
                      datas={handleDownload}
                      text="Download"
                    />
                  </div>
                </DialogActions>
              </div>
            </Dialog>
          }
        </div>
      </div>
    </div>
  );
};
export default Balances;
