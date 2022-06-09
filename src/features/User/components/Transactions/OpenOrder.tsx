/* eslint-disable react-hooks/exhaustive-deps */
import { BigNumber } from '@0x/utils';
import { Box, ButtonBase, Dialog, IconButton, Typography } from '@material-ui/core';
import { GridCellParams, GridColDef, GridOverlay, GridRowSelectedParams } from '@material-ui/data-grid';
import classnames from 'classnames/bind';
import _ from 'lodash';
import React, { ChangeEvent, ReactElement, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CDataGrid from 'src/components/DataGrid';
import { TradingMethod } from 'src/constants/dashboard';
import { HardwareWalletType } from 'src/features/OrderForm/constants/hardwareWallet';
import { sleep } from 'src/helpers/share';
import { useAppSelector } from 'src/store/hooks';
import { RootState } from 'src/store/store';
import eventBus from 'src/event/event-bus';
import {
  DEFAULT_PAGE,
  DELAY_TIME,
  EORDER_SIDE,
  EORDER_TYPE,
  FORMAT_DATE,
  MESSAGE_TABLE,
  METHOD_FILTER,
  ModeDisplay,
  ORDER_SIDE,
  ORDER_TYPE,
  OrderStatus,
  TFilter,
  TO_FIX_2,
} from './Constant';
import FilterBar, { ITEMS_FILTER } from 'src/features/User/components/Transactions/FilterBar';
import styles from 'src/features/User/components/Transactions/Transaction.module.scss';
import {
  cancelOrderApi,
  getCoinsApi,
  getOpenOrdersApi,
  getPairsApi,
} from 'src/features/User/components/Transactions/Transactions.slice';
import { SocketEvent } from 'src/socket/SocketEvent';
import { fixPrecision } from 'src/helpers/fixPrecision';
import moment from 'moment';
import CloseIcon from '@material-ui/icons/Close';
import { getFilterSize } from 'src/features/User/components/Transactions/Transactions';
import TooltipText from 'src/components/Tooltip/Tooltip';
import stylesPagition from 'src/components/Pagination/style';
import { Pagination } from '@material-ui/lab';
import { cancelStellarOffer } from 'src/features/OrderForm/helpers/cancelStellarOffer';
import LoadingSVG from 'src/assets/icon/LoadingSVG';
import { Pair } from 'src/pages/Pair/interfaces/pairs';
import { disableDragDrop } from 'src/helpers/disableDragDrop';
import CleanNumber from 'src/components/CleanNumber';

const cx = classnames.bind(styles);

interface IOpenOrder {
  limitRecord?: number;
  modeDisplay: ModeDisplay;
  userId: string;
}

const DEFAULT_PRECISION = 5;

const getAmountPrecision = (selectedPair: Pair) => {
  if (selectedPair) {
    const precision = parseFloat(selectedPair?.amount_precision);
    return Math.log10(1 / precision);
  }

  return DEFAULT_PRECISION;
};

export const OpenOrder: React.FC<IOpenOrder> = (props) => {
  const dispatch = useDispatch();
  const [selectedRow, setSelectedRow] = useState<GridRowSelectedParams>();
  const [isCancelOrder, setIsCancelOrder] = useState(false);
  const orderList = useSelector((state: RootState) => state.transaction.openOrders.data);
  const [orders, setOrders] = useState(orderList);
  const [conditionFilterOpenOrder, setConditionFilterOpenOrder] = useState<TFilter>({
    page: DEFAULT_PAGE,
    limit: props.limitRecord,
    method: METHOD_FILTER.map((item) => item.value),
    status: [OrderStatus.Fillable, OrderStatus.Filling, OrderStatus.Pending],
    userId: props.userId,
  });
  const pairList = useSelector((state: RootState) => state.transaction.pairs.data);
  const wallet = useAppSelector((state) => state.wallet);
  const pairs = useAppSelector((state) => state.pair.pairs);
  const [openCancelDialog, setOpenCancelDialog] = useState<boolean>(false);
  const [isCanceling, setIsCanceling] = useState<boolean>(false);
  const totalPage = useAppSelector((state) => state.transaction.openOrders.metadata.totalPage);
  const classes = stylesPagition();

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
  };

  useEffect(() => {
    dispatch(getOpenOrdersApi(conditionFilterOpenOrder));
    dispatch(getPairsApi());
    dispatch(getCoinsApi());
    eventBus.on(SocketEvent.OrdersUpdated, async () => {
      await sleep(DELAY_TIME);
      dispatch(getOpenOrdersApi(conditionFilterOpenOrder));
    });
    disableDragDrop('data-grid');
  }, []);
  useEffect(() => {
    setOrders(orderList);
  }, [orderList]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cancelOrder = async (order: any) => {
    setIsCanceling(true);
    try {
      if (order.method === TradingMethod.StellarOrderbook) {
        // cancel stellar offer
        const offerId = order.stellar_id.toString();
        const pair = pairs?.find((p) => p.pairs_id === order.pair_id);
        let path;
        let hardwareWalletType;
        let publicKey;
        if (wallet.trezor.publicKey) {
          path = wallet.trezor.path;
          hardwareWalletType = HardwareWalletType.TREZOR;
          publicKey = wallet.trezor.publicKey;
        } else if (wallet.ledger.publicKey) {
          path = wallet.ledger.path;
          hardwareWalletType = HardwareWalletType.LEDGER;
          publicKey = wallet.ledger.publicKey;
        } else {
          path = null;
          hardwareWalletType = null;
          publicKey = null;
        }
        await cancelStellarOffer(path, hardwareWalletType, offerId, publicKey, wallet.privateKey, pair);
      } else {
        await dispatch(cancelOrderApi(order.id));
        await dispatch(getOpenOrdersApi(conditionFilterOpenOrder));
      }
    } catch (e) {
      handleCloseCancelDialog();
    }
    handleCloseCancelDialog();
  };

  useEffect(() => {
    if (selectedRow && isCancelOrder) {
      cancelOrder(selectedRow.data);
      setIsCancelOrder(false);
    }
  }, [isCancelOrder, selectedRow]);

  const handleFilterCondition = (condition: TFilter) => {
    condition.page = DEFAULT_PAGE;
    condition.limit = props.limitRecord;
    dispatch(getOpenOrdersApi(condition));
    setConditionFilterOpenOrder(condition);
  };
  const customRow = () => {
    const rows = _.cloneDeep(orders);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rows.map((row: any) => {
      const pair = pairs?.find((e: Pair) => e.pairs_id === row.pair_id);
      //custom order pair
      row.pair = row.base_name + '/' + row.quote_name;

      //custom filled
      if (new BigNumber(row.filled_amount).gte(0)) {
        if (new BigNumber(row.total || '0').gt('0')) {
          row.filled_amount = fixPrecision(((row.filled_amount * row.average) / row.total) * 100, TO_FIX_2) + '%';
        } else {
          row.filled_amount = fixPrecision((row.filled_amount / row.amount) * 100, TO_FIX_2) + '%';
        }
      } else {
        row.filled_amount = '-';
      }

      if (row.type === EORDER_TYPE.Market) {
        row.type = ORDER_TYPE.MARKET;
        row.price = ORDER_TYPE.MARKET;
        if (new BigNumber(row.total || '0').gt('0')) {
          row.amount = '-';
          row.total = fixPrecision(row.total, pair?.amount_precision);
        } else {
          row.total = '-';
          //custom amount
          row.amount = fixPrecision(row.amount, pair?.amount_precision);
        }
      } else {
        //custom price
        row.price = fixPrecision(row.price, pair?.price_precision);
        row.type = ORDER_TYPE.LIMIT;
        // custom total
        row.total = row.amount ? fixPrecision(new BigNumber(row.price).times(row.amount), pair?.amount_precision) : '-';
        //custom amount
        row.amount = fixPrecision(row.amount, pair?.amount_precision);
      }

      //custom order side
      if (row.side === EORDER_SIDE.Buy) {
        row.side = ORDER_SIDE.BUY;
      } else {
        row.side = ORDER_SIDE.SELL;
      }
      row.created_at = moment(row.created_at).format(FORMAT_DATE);

      row.total = fixPrecision(row.total, pair?.price_precision);
    });
    return rows;
  };

  const COLUMNS: GridColDef[] = [
    { field: 'pair', headerName: 'Pair', flex: 1 },
    { field: 'created_at', headerName: 'Date' },
    { field: 'type', headerName: 'Type' },
    {
      field: 'side',
      headerName: 'Side',
      renderCell: (params: GridCellParams) => {
        const cellValue = params.value;
        return (
          <span className={cx(`text-side${cellValue === ORDER_SIDE.BUY ? '-buy' : '-sell'}`)}>{params.value}</span>
        );
      },
    },
    { field: 'price', headerName: 'Price', width: 150 },
    { field: 'amount', headerName: 'Amount', width: 150 },
    {
      field: 'total',
      headerName: 'Total',
      width: 150,
      renderCell: (params: GridCellParams) => {
        let precision;
        if (pairs) {
          const pairInRow = pairs.find((i) => {
            return i.pairs_id === params.row.pair_id;
          });
          if (pairInRow) {
            precision = getAmountPrecision(pairInRow);
          }
        }

        const roundedNumber = precision ? new BigNumber(params.row.total).dp(precision).toString() : params.row.total;
        return (
          <>
            <CleanNumber number={roundedNumber} maxDigits={10} fixedDecimal={precision} />
          </>
        );
      },
    },
    { field: 'filled_amount', headerName: 'Filled' },
    { field: 'id', headerName: 'Order ID' },
    {
      field: 'address',
      headerName: 'Wallet',
      width: 200,
      renderCell: (params: GridCellParams) => {
        return <TooltipText content={params.value} />;
      },
    },
  ];

  const customNoRowOverlay = (): ReactElement => {
    return (
      <GridOverlay>
        <div className={cx('text-no-record')}>
          {conditionFilterOpenOrder.pair || conditionFilterOpenOrder.method?.length !== METHOD_FILTER.length
            ? MESSAGE_TABLE.NOT_FOUND
            : MESSAGE_TABLE.NO_RECORD}
        </div>{' '}
      </GridOverlay>
    );
  };

  const handleChangePage = (event: ChangeEvent<unknown>, value: number): void => {
    conditionFilterOpenOrder.page = value;
    dispatch(getOpenOrdersApi(conditionFilterOpenOrder));
    setConditionFilterOpenOrder(conditionFilterOpenOrder);
  };

  return (
    <>
      <FilterBar
        itemFilter={[ITEMS_FILTER.PAIR, ITEMS_FILTER.METHOD]}
        pairList={pairList}
        handleFilterCondition={handleFilterCondition}
        conditionFilter={conditionFilterOpenOrder}
        size={getFilterSize(props.modeDisplay)}
      />
      <div id="data-grid" className={cx(`data-grid-wrap-${getFilterSize(props.modeDisplay)}`)}>
        <CDataGrid
          rows={customRow()}
          columns={COLUMNS.map((column) => ({
            ...column,
            sortable: false,
            flex: 1,
          }))}
          onRowSelected={(row) => setSelectedRow(row)}
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
      </div>
      {props.modeDisplay !== ModeDisplay.dashboard && totalPage > 1 && (
        <div className={cx('footer-pagination')}>
          <Pagination
            className={classes.pagination}
            count={totalPage}
            page={conditionFilterOpenOrder.page}
            variant="outlined"
            shape="rounded"
            onChange={handleChangePage}
          />
        </div>
      )}

      {/* Cancel order dialog*/}
      <Dialog
        open={openCancelDialog}
        onClose={handleCloseCancelDialog}
        maxWidth={'sm'}
        disableBackdropClick={isCanceling}
      >
        <Box display={'flex'} justifyContent={'space-between'}>
          <Typography component={'div'}>
            <IconButton size={'small'} className={cx('hidden')}>
              <CloseIcon />
            </IconButton>
          </Typography>

          <Typography component={'div'} className={cx('title')}>
            <Box>Cancel order</Box>
          </Typography>

          <Typography component={'div'}>
            <IconButton
              onClick={handleCloseCancelDialog}
              size={'small'}
              className={cx('close-button')}
              disabled={isCanceling}
            >
              <CloseIcon />
            </IconButton>
          </Typography>
        </Box>

        <div className={cx('cancel-container')}>
          <div className={cx('body')}>
            The remainder of the order will be canceled. <br /> Are you sure?
          </div>
          <div className={cx('btn-group')}>
            <ButtonBase
              className={cx('btn-close')}
              disableRipple={true}
              onClick={handleCloseCancelDialog}
              disabled={isCanceling}
            >
              Close
            </ButtonBase>
            <ButtonBase
              className={cx('btn-cancel')}
              disableRipple={true}
              onClick={() => {
                setIsCancelOrder(true);
              }}
              disabled={isCanceling}
            >
              {isCanceling ? <LoadingSVG size={'lg'} activeColor={'#fff'} /> : 'Cancel Order'}
            </ButtonBase>
          </div>
        </div>
      </Dialog>
    </>
  );
};
