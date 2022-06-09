import { InputLabel, Paper, Tab, Tabs } from '@material-ui/core';
import { GridCellParams, GridColDef, GridOverlay } from '@material-ui/data-grid';
import { Pagination } from '@material-ui/lab';
import classnames from 'classnames/bind';
import _ from 'lodash';
import moment from 'moment';
import React, { ChangeEvent, ReactElement, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select2 from 'src/components/Base/Select2';
import CDataGrid from 'src/components/DataGrid';
import stylesPagition from 'src/components/Pagination/style';
import TooltipText from 'src/components/Tooltip/Tooltip';
import { TradingMethod } from 'src/constants/dashboard';
import FilterBar, { ITEMS_FILTER } from 'src/features/User/components/Transactions/FilterBar';
import styles from 'src/features/User/components/Transactions/Transaction.module.scss';
import { getFilterSize, renderFowardUrl } from 'src/features/User/components/Transactions/Transactions';
import {
  getCoinsApi,
  getPairsApi,
  getTradesLiqApi,
  getTradesOBApi,
  getTransactionsApi,
  initTradesLiqApi,
  initTransactionsApi,
} from 'src/features/User/components/Transactions/Transactions.slice';
import { fixPrecision } from 'src/helpers/fixPrecision';
import { useAppSelector } from 'src/store/hooks';
import { RootState } from 'src/store/store';
import {
  COIN,
  DEFAULT_PAGE,
  FORMAT_DATE,
  MESSAGE_TABLE,
  METHOD_FILTER,
  ModeDisplay,
  NETWORK_LABEL,
  TFilter,
  TO_FIX_5,
  TTokenLiq,
  TTrade,
} from 'src/features/User/components/Transactions/Constant';
import { Pair } from 'src/pages/Pair/interfaces/pairs';
import { BigNumber } from '@0x/utils';
import { arrowDownBlue } from 'src/assets/icon';
import { disableDragDrop } from 'src/helpers/disableDragDrop';
import CLoading from 'src/components/Loading';
import PancakeswapPoolIcon from 'src/assets/icon/pool/PancakeswapPoolIcon';
import FCXPoolIcon from 'src/assets/icon/pool/FCXPoolIcon';

const cx = classnames.bind(styles);

const SIDE = {
  SELL: 'Sell',
  BUY: 'Buy',
};

export const OPTION_TRANSACTION_TYPE = [
  { value: 'Swap', label: 'Swap' },
  { value: 'Add', label: 'Add' },
  { value: 'Remove', label: 'Remove' },
];

const TAB_LABEL = {
  OB: 'Order Book',
  LIQ: 'Liquidity pool',
};

enum TAB_ID {
  TRAD_HIS_OB = TradingMethod.StellarOrderbook,
  TRAD_HIS_LIQ = TradingMethod.BSCPool,
}

const TABS = [
  { id: TAB_ID.TRAD_HIS_OB, label: TAB_LABEL.OB },
  { id: TAB_ID.TRAD_HIS_LIQ, label: TAB_LABEL.LIQ },
];

interface ITradeHistory {
  limitRecord?: number;
  modeDisplay: ModeDisplay;
  userId: string;
}

export interface RefObject {
  resetConditon: () => void;
}

export const TradeHistory: React.FC<ITradeHistory> = (props) => {
  const dispatch = useDispatch();
  const pairs: Pair[] | undefined = useAppSelector((state) => state.pair.pairs);
  const tradeListOB: TTrade[] = useSelector((state: RootState) => state.transaction.tradesOB.data);
  const tradeListLiq: TTrade[] = useSelector((state: RootState) => state.transaction.tradesLiq.data);
  const transactionList = useSelector((state: RootState) => state.transaction.transactions?.data);
  const [tradesOB, setTradesOB] = useState(tradeListOB);
  const [tradesLiq, setTradesLiq] = useState(tradeListLiq);
  const [transactions, setTransactions] = useState(transactionList);
  const [tradeMethodTabId, setTradeMethodTabId] = useState(METHOD_FILTER[0].value);
  const pairList = useSelector((state: RootState) => state.transaction.pairs.data);
  const coinList = useSelector((state: RootState) => state.transaction.coins.data);
  const [typeTransaction, setTypeTransaction] = useState<string>(OPTION_TRANSACTION_TYPE[0].value);
  const selectedPair = useAppSelector((state) => state.pair.selectedPair);
  const totalPageOB = useAppSelector((state) => state.transaction.tradesOB.metadata.totalPage);
  const totalPageLiq = useAppSelector((state) => state.transaction.tradesLiq.metadata.totalPage);
  const totalPageTransaction = useAppSelector((state) => state.transaction.transactions.metadata?.totalPage);
  const [totalPage, setTotalPage] = useState(1);
  const lastData = useAppSelector((state) => state.transaction.lastData);
  const classes = stylesPagition();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const initStateConditionLiq = {
    page: DEFAULT_PAGE,
    limit: props.limitRecord,
    tradeMethodTab: [tradeMethodTabId],
    transactionType: typeTransaction,
    userId: props.userId,
  };
  const initStateConditionOB = {
    page: DEFAULT_PAGE,
    limit: props.limitRecord,
    tradeMethodTab: [METHOD_FILTER[0].value, METHOD_FILTER[1].value],
    userId: props.userId,
  };
  const [conditionLiq, setConditionLiq] = useState<TFilter>(initStateConditionLiq);

  const [conditionOB, setConditionOB] = useState<TFilter>(initStateConditionOB);

  useEffect(() => {
    if (tradeMethodTabId === TradingMethod.BSCPool) {
      if (typeTransaction !== OPTION_TRANSACTION_TYPE[0].value) {
        setTotalPage(totalPageTransaction);
      } else {
        setTotalPage(totalPageLiq);
      }
    } else {
      setTotalPage(totalPageOB);
    }
  }, [tradeListLiq, tradeListOB, transactionList]);

  useEffect(() => {
    setTradesOB(tradeListOB);
  }, [tradeListOB]);

  useEffect(() => {
    setTradesLiq(tradeListLiq);
  }, [tradeListLiq]);

  useEffect(() => {
    setTransactions(transactionList);
  }, [transactionList]);

  const callApi = (condition: TFilter, isInit?: boolean) => {
    try {
      setIsLoading(true);
      if (tradeMethodTabId === TradingMethod.BSCPool) {
        if (typeTransaction !== OPTION_TRANSACTION_TYPE[0].value) {
          if (!isInit) {
            dispatch(getTransactionsApi(condition));
          } else dispatch(initTransactionsApi(condition));
        } else {
          if (!isInit) {
            dispatch(getTradesLiqApi(condition));
          } else dispatch(initTradesLiqApi(condition));
        }
      } else {
        dispatch(getTradesOBApi(condition));
      }
    } catch (e) {
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  useEffect(() => {
    setConditionLiq(initStateConditionLiq);
    setConditionOB(initStateConditionOB);
    setTypeTransaction(OPTION_TRANSACTION_TYPE[0].value);
  }, [tradeMethodTabId]);

  useEffect(() => {
    setConditionLiq(initStateConditionLiq);
    callApi(initStateConditionLiq, true);
  }, [typeTransaction]);

  useEffect(() => {
    dispatch(getPairsApi());
    dispatch(getCoinsApi());
  }, []);

  useEffect(() => {
    callApi(tradeMethodTabId === TradingMethod.StellarOrderbook ? conditionOB : conditionLiq, true);
    disableDragDrop('data-grid');
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customTypeTransaction = (row: any, isBuy?: boolean) => {
    let str = '';
    switch (typeTransaction) {
      case OPTION_TRANSACTION_TYPE[0].value:
        if (isBuy) {
          str = 'Swap ' + row.quote_name + ' for ' + row.base_name;
        } else {
          str = 'Swap ' + row.base_name + ' for ' + row.quote_name;
        }
        break;
      case OPTION_TRANSACTION_TYPE[1].value:
        str = 'Add liquidity';
        break;
      case OPTION_TRANSACTION_TYPE[2].value:
        str = 'Remove liquidity';
        break;
      default:
        break;
    }
    return str;
  };

  const getSymbolToken = (tokenSym: string | undefined) => {
    let icon = '';
    COIN.map((item) => {
      if (item.symbol === tokenSym) {
        icon = item.icon;
      }
    });
    return icon;
  };

  const renderToken = (token: TTokenLiq) => {
    return (
      <div className={cx('token')} key={token.id}>
        {typeTransaction === OPTION_TRANSACTION_TYPE[1].value ? (
          <>
            <img className={cx('icon-token')} src={getSymbolToken(token.tokenInSym)} />
            <span className={cx('amount-token')}>
              {fixPrecision(Number(token.tokenAmountIn), selectedPair?.amount_precision)}
            </span>
          </>
        ) : (
          <>
            <img className={cx('icon-token')} src={getSymbolToken(token.tokenOutSym)} />
            <span className={cx('amount-token')}>
              {fixPrecision(Number(token.tokenAmountOut), selectedPair?.amount_precision)}
            </span>
          </>
        )}
      </div>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderDetailColumn = (value: any) => {
    const tokens: TTokenLiq[] = value;
    return (
      <div>
        <div className={cx('column-detail')}>
          {tokens.map((token: TTokenLiq, idx: number) => idx < 4 && renderToken(token))}
        </div>
        {tokens.length > 4 && (
          <div className={cx('column-detail')}>
            {tokens.map((token: TTokenLiq, idx: number) => idx >= 4 && renderToken(token))}
          </div>
        )}
      </div>
    );
  };

  const customRowDB = () => {
    const rows = _.cloneDeep(tradeMethodTabId === TradingMethod.StellarOrderbook ? tradesOB : tradesLiq);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rows.map((row: any, idx: number) => {
      //custom row
      const pair = pairs?.find((e: Pair) => e.pairs_id === row.pair_id);
      row['id'] = idx;
      if (row.buy_user_id === Number(props.userId)) {
        row['side'] = SIDE.BUY;
        row['wallet'] = row.buy_address;
        row['fee'] = fixPrecision(row.buy_fee, pair?.price_precision) + ' ' + row.quote_name;
        row['order_id'] = row.buy_order_id;
        row[typeTransaction] = customTypeTransaction(row, true);
      } else if (row.sell_user_id === Number(props.userId)) {
        row['side'] = SIDE.SELL;
        row['wallet'] = row.sell_address;
        row['fee'] = fixPrecision(row.sell_fee, pair?.price_precision) + ' ' + row.base_name;
        row['order_id'] = row.sell_order_id;
        row[typeTransaction] = customTypeTransaction(row, false);
      }
      row['total'] = row.filled_amount * row.price;
      row.pair = row.base_name + '/' + row.quote_name;
      if (row.network === TradingMethod.StellarOrderbook) {
        row.networkLabel = NETWORK_LABEL.STELLAR_OB;
      } else if (row.network === TradingMethod.BSCOrderbook) {
        row.networkLabel = NETWORK_LABEL.BSC_OB;
      }

      row.filled_amount = fixPrecision(row.filled_amount, TO_FIX_5);
      row.updated_at = moment(row.updated_at).format(FORMAT_DATE);
      // custom precision
      row.base_amount = fixPrecision(Number(row.filled_amount), pair?.amount_precision) + ' ' + row.base_name;
      row.quote_amount =
        fixPrecision(new BigNumber(row.filled_amount).times(row.price), pair?.amount_precision) + ' ' + row.quote_name;
      row.price = fixPrecision(row.price, pair?.price_precision);
      row.priceSwap = fixPrecision(row.price, pair?.price_precision) + ' ' + row.quote_name;
      row.buy_amount = fixPrecision(row.buy_amount, pair?.amount_precision);
      row.sell_amount = fixPrecision(row.sell_amount, pair?.amount_precision);
      row.total = fixPrecision(row.total, pair?.price_precision) + ' ' + row.quote_name;
    });
    return rows;
  };

  const customRowLiquidityAddRemove = () => {
    const rows = _.cloneDeep(transactions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rows.map((row: any) => {
      //custom row
      row['id'] = row.id;
      row[typeTransaction] = customTypeTransaction(row);

      row.updated_at = moment(new Date(row.timestamp * 1000)).format(FORMAT_DATE);
      // custom precision
      row.pool = row.poolAddress.id;
      row.wallet = row.userAddress.id;
      const tokens = row.tokens;
      row.details = tokens;
    });
    return rows;
  };

  const customRow = () => {
    if (tradeMethodTabId === METHOD_FILTER[0].value) {
      return customRowDB();
    } else if (typeTransaction === OPTION_TRANSACTION_TYPE[0].value) {
      return customRowDB();
    } else return customRowLiquidityAddRemove();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gotoTradeDetail = (rowData: any) => {
    if (tradeMethodTabId !== TradingMethod.StellarOrderbook && typeTransaction !== OPTION_TRANSACTION_TYPE[0].value) {
      window.open(`${process.env.REACT_APP_ETHERSCAN}/tx/${rowData.id}`, '_blank');
    } else {
      if (rowData.txid) {
        if (rowData.network === TradingMethod.StellarOrderbook) {
          window.open(`${process.env.REACT_APP_STELLAR_EXPERT}/tx/${rowData.txid}`, '_blank');
        } else {
          window.open(`${process.env.REACT_APP_ETHERSCAN}/tx/${rowData.txid}`, '_blank');
        }
      }
    }
  };

  const COLUMNS_ORDER_BOOK: GridColDef[] = [
    {
      field: 'pair',
      headerName: 'Pair',
      flex: 1,
      renderCell: (params: GridCellParams) => {
        return (
          <div className={cx('div-link')} onClick={() => gotoTradeDetail(params.row)}>
            {params.value}
          </div>
        );
      },
    },
    { field: 'updated_at', headerName: 'Date', flex: 1 },
    {
      field: 'side',
      headerName: 'Side',
      flex: 1,
      renderCell: (params: GridCellParams) => {
        const cellValue = params.value;
        return <span className={cx(`text-side${cellValue === SIDE.BUY ? '-buy' : '-sell'}`)}>{params.value}</span>;
      },
    },
    { field: 'price', headerName: 'Price', flex: 1 },
    { field: 'filled_amount', headerName: 'Filled', flex: 1 },
    { field: 'fee', headerName: 'Fee', flex: 1 },
    { field: 'total', headerName: 'Total', flex: 1 },
    { field: 'order_id', headerName: 'Order ID', flex: 1 },
    {
      field: 'wallet',
      headerName: 'Wallet',
      flex: 1,
      renderCell: (params: GridCellParams) => {
        return <TooltipText content={params.value} />;
      },
    },
    { field: 'networkLabel', headerName: 'Network', flex: 1 },
  ];

  const COLUMNS_LIQ_SWAP: GridColDef[] = [
    {
      field: typeTransaction,
      headerName: typeTransaction,
      flex: 1,
      renderCell: (params: GridCellParams) => {
        return (
          <div className={cx('div-link')} onClick={() => gotoTradeDetail(params.row)}>
            {params.value}
          </div>
        );
      },
    },
    { field: 'updated_at', headerName: 'Date', flex: 1 },
    { field: 'priceSwap', headerName: 'Price', flex: 1 },
    { field: 'base_amount', headerName: 'Digital credit amount', flex: 1 },
    { field: 'quote_amount', headerName: 'Digital credit amount', flex: 1 },
    { field: 'order_id', headerName: 'Order ID' },
    {
      field: 'pool_id',
      headerName: 'Pool',
      flex: 1,
      renderCell: (params: GridCellParams) => {
        return (
          <div className={cx('pool-data-container')}>
            {params.row.network === TradingMethod.PancakeswapPool ? (
              <PancakeswapPoolIcon size={'sm'} />
            ) : params.row.network === TradingMethod.BSCPool ? (
              <FCXPoolIcon size={'sm'} />
            ) : (
              <></>
            )}
            <div
              className={cx('div-link')}
              onClick={() => {
                if (params.row.network === TradingMethod.BSCPool) {
                  window.open(`/pools/${params.value}`);
                }
                if (params.row.network === TradingMethod.PancakeswapPool) {
                  window.open(`${process.env.REACT_APP_PANCAKE_POOL}/pool/${params.value}`);
                }
              }}
            >
              <TooltipText content={params.value} />
            </div>
          </div>
        );
      },
    },
    {
      field: 'wallet',
      headerName: 'Wallet',
      flex: 1,
      renderCell: (params: GridCellParams) => {
        return <TooltipText content={params.value} />;
      },
    },
  ];

  const COLUMNS_LIQ_ADD: GridColDef[] = [
    {
      field: typeTransaction,
      headerName: typeTransaction,
      flex: 0.75,
      renderCell: (params: GridCellParams) => {
        return (
          <div className={cx('div-link')} onClick={() => gotoTradeDetail(params.row)}>
            {params.value}
          </div>
        );
      },
    },
    { field: 'updated_at', headerName: 'Date', flex: 0.75 },
    {
      field: 'details',
      headerName: 'Details',
      flex: 2,
      renderCell: (params: GridCellParams) => {
        const cellValue = params.value;
        return renderDetailColumn(cellValue);
      },
    },
    {
      field: 'pool',
      headerName: 'Pool',
      flex: 1,
      renderCell: (params: GridCellParams) => {
        return renderFowardUrl(
          <div
            className={cx('div-link')}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <TooltipText content={params.value} />{' '}
          </div>,
          { path: `/pools/${params.value}` },
        );
      },
    },
    {
      field: 'wallet',
      headerName: 'wallet',
      flex: 1,
      renderCell: (params: GridCellParams) => {
        return <TooltipText content={params.value} />;
      },
    },
  ];

  const getColumnRender = () => {
    if (tradeMethodTabId === METHOD_FILTER[0].value) {
      return COLUMNS_ORDER_BOOK;
    } else if (typeTransaction === OPTION_TRANSACTION_TYPE[0].value) {
      return COLUMNS_LIQ_SWAP;
    } else return COLUMNS_LIQ_ADD;
  };

  useEffect(() => {
    if (tradeMethodTabId === METHOD_FILTER[0].value) {
      conditionOB.tradeMethodTab = [METHOD_FILTER[0].value, METHOD_FILTER[1].value];
      setConditionOB(conditionOB);
    } else {
      conditionLiq.tradeMethodTab = [METHOD_FILTER[2].value, METHOD_FILTER[3].value];
      setConditionLiq(conditionLiq);
    }
    callApi(tradeMethodTabId === METHOD_FILTER[0].value ? conditionOB : conditionLiq, true);
  }, [tradeMethodTabId]);

  const handleFilterCondition = (condition: TFilter) => {
    condition.page = DEFAULT_PAGE;
    condition.limit = props.limitRecord;
    callApi(condition, true);
    if (tradeMethodTabId === METHOD_FILTER[0].value) {
      setConditionOB(condition);
    } else setConditionLiq(condition);
  };

  const getMessageNoRow = () => {
    let msg = MESSAGE_TABLE.NO_RECORD;
    if (tradeMethodTabId === METHOD_FILTER[0].value) {
      if (conditionOB.pair || conditionOB.orderId) msg = MESSAGE_TABLE.NOT_FOUND;
    } else if (typeTransaction === OPTION_TRANSACTION_TYPE[0].value) {
      if (conditionLiq.pair || conditionLiq.orderId) msg = MESSAGE_TABLE.NOT_FOUND;
    } else if (conditionLiq.coinId || conditionLiq.pool) msg = MESSAGE_TABLE.NOT_FOUND;
    return msg;
  };

  const customNoRowOverlay = (): ReactElement => {
    return (
      <GridOverlay>
        <div className={cx('text-no-record')}>{getMessageNoRow()}</div>{' '}
      </GridOverlay>
    );
  };

  const handleChangePage = (event: ChangeEvent<unknown>, value: number): void => {
    if (tradeMethodTabId === METHOD_FILTER[0].value) {
      conditionOB.page = value;
      callApi(conditionOB);
      setConditionOB(conditionOB);
    } else {
      conditionLiq.page = value;
      callApi(conditionLiq);
      setConditionLiq(conditionLiq);
    }
  };

  const handleChangeTab = (event: unknown, value: number) => {
    setTradeMethodTabId(value);
  };

  const getItemFilter = () => {
    if (typeTransaction === OPTION_TRANSACTION_TYPE[0].value || tradeMethodTabId === METHOD_FILTER[0].value) {
      return [ITEMS_FILTER.PAIR, ITEMS_FILTER.ORDER_ID];
    } else return [ITEMS_FILTER.COIN, ITEMS_FILTER.POOL];
  };

  const showMore = () => {
    const condition = conditionLiq;
    const currentPage = conditionLiq.page ? conditionLiq.page + 1 : 1;
    if (lastData.length > 0) {
      condition.page = currentPage;
    }
    callApi({ ...conditionLiq, page: condition.page });
    setConditionLiq(condition);
  };

  return (
    <>
      {props.modeDisplay === ModeDisplay.dashboard ? (
        <div className={cx('div-pool')}>
          <button
            className={cx('trade-button-ob', tradeMethodTabId === METHOD_FILTER[0].value ? 'active-button' : '')}
            onClick={() => setTradeMethodTabId(METHOD_FILTER[0].value)}
          >
            {TAB_LABEL.OB}
          </button>
          <button
            className={cx('trade-button-liq', tradeMethodTabId === METHOD_FILTER[2].value ? 'active-button' : '')}
            onClick={() => {
              setTradeMethodTabId(METHOD_FILTER[2].value);
            }}
          >
            {TAB_LABEL.LIQ}
          </button>
        </div>
      ) : (
        <Paper square className={cx('paper-root')}>
          <Tabs
            value={tradeMethodTabId}
            onChange={handleChangeTab}
            classes={{ root: cx('tab'), indicator: cx('indicator') }}
          >
            {TABS.map((item, idx) => {
              return <Tab key={idx} value={item.id} label={item.label} />;
            })}
          </Tabs>
        </Paper>
      )}
      {tradeMethodTabId === METHOD_FILTER[2].value && (
        <div className={cx('transaction-type')}>
          <InputLabel className={cx('label-select')}>Transaction type:</InputLabel>
          <Select2
            size={getFilterSize(props.modeDisplay)}
            option={{
              label: OPTION_TRANSACTION_TYPE.filter((e) => e.value === typeTransaction)[0].label,
              value: typeTransaction,
            }}
            onClick={(event) => {
              setTypeTransaction(event.value);
              conditionLiq.transactionType = event.value;
              setConditionLiq(conditionLiq);
            }}
            options={OPTION_TRANSACTION_TYPE}
          />
        </div>
      )}
      <FilterBar
        itemFilter={getItemFilter()}
        coinList={coinList}
        pairList={pairList}
        handleFilterCondition={handleFilterCondition}
        conditionFilter={tradeMethodTabId === METHOD_FILTER[0].value ? conditionOB : conditionLiq}
        size={getFilterSize(props.modeDisplay)}
      />
      <div id="data-grid" className={cx(`data-grid-wrap-${getFilterSize(props.modeDisplay)}`)}>
        {!isLoading ? (
          <CDataGrid
            rows={customRow()}
            columns={getColumnRender().map((column) => ({
              ...column,
              sortable: false,
            }))}
            disableColumnMenu
            hideFooterPagination
            hideFooterRowCount
            hideFooterSelectedRowCount
            scrollbarSize={17}
            hideFooter
            components={{
              NoRowsOverlay: customNoRowOverlay,
            }}
          />
        ) : (
          <div className={cx('loading-center')}>
            <CLoading type={'spin'} size={'md'} />
          </div>
        )}
      </div>
      {props.modeDisplay !== ModeDisplay.dashboard &&
        tradeMethodTabId === TradingMethod.StellarOrderbook &&
        totalPage > 1 && (
          <div className={cx('footer-pagination')}>
            <Pagination
              className={classes.pagination}
              count={totalPage}
              page={tradeMethodTabId === TradingMethod.StellarOrderbook ? conditionOB.page : conditionLiq.page}
              variant="outlined"
              shape="rounded"
              onChange={handleChangePage}
            />
          </div>
        )}
      {props.modeDisplay !== ModeDisplay.dashboard &&
        tradeMethodTabId !== TradingMethod.StellarOrderbook &&
        lastData.length === props?.limitRecord && (
          <div className={cx('footer-showmore')}>
            <div className={cx('btn-show-more')} onClick={showMore}>
              <span>Show more</span>
              <img src={arrowDownBlue} />
            </div>
          </div>
        )}
    </>
  );
};
