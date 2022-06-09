import { BigNumber } from '@0x/utils';
import { GridCellParams, GridColDef, GridOverlay } from '@material-ui/data-grid';
import classnames from 'classnames/bind';
import _ from 'lodash';
import React, { ChangeEvent, ReactElement, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CDataGrid from 'src/components/DataGrid';
import { RootState } from 'src/store/store';
import {
  EORDER_SIDE,
  OrderStatus,
  EORDER_TYPE,
  ORDER_SIDE,
  ORDER_STATUS,
  ORDER_TYPE,
  TFilter,
  METHOD_FILTER,
  FORMAT_DATE,
  DELAY_TIME,
  ModeDisplay,
  DEFAULT_PAGE,
  TO_FIX_2,
  MESSAGE_TABLE,
} from 'src/features/User/components/Transactions/Constant';
import FilterBar, { ITEMS_FILTER } from 'src/features/User/components/Transactions/FilterBar';
import styles from 'src/features/User/components/Transactions/Transaction.module.scss';
import {
  getCoinsApi,
  getOrderHistoryApi,
  getPairsApi,
} from 'src/features/User/components/Transactions/Transactions.slice';
import { SocketEvent } from 'src/socket/SocketEvent';
import { useAppSelector } from 'src/store/hooks';
import moment from 'moment';
import TooltipText from 'src/components/Tooltip/Tooltip';
import { Pagination } from '@material-ui/lab';
import stylesPagition from 'src/components/Pagination/style';
import { getFilterSize, renderFowardUrl } from 'src/features/User/components/Transactions/Transactions';
import { fixPrecision } from 'src/helpers/fixPrecision';
import eventBus from 'src/event/event-bus';
import { sleep } from 'src/helpers/share';
import { Pair } from 'src/pages/Pair/interfaces/pairs';
import { disableDragDrop } from 'src/helpers/disableDragDrop';

const cx = classnames.bind(styles);

interface IOrderHistory {
  limitRecord?: number;
  modeDisplay: ModeDisplay;
  userId: string;
}

export const OrderHistory: React.FC<IOrderHistory> = (props) => {
  const dispatch = useDispatch();
  const pairList = useSelector((state: RootState) => state.transaction.pairs.data);
  const orderList = useSelector((state: RootState) => state.transaction.orderHistory.data);
  const [orders, setOrders] = useState(orderList);
  const totalPage = useAppSelector((state) => state.transaction.orderHistory.metadata.totalPage);
  const classes = stylesPagition();

  const [conditionFilterOrderHistory, setConditionFilterOrderHistory] = useState<TFilter>({
    page: DEFAULT_PAGE,
    limit: props.limitRecord,
    method: METHOD_FILTER.map((item) => item.value),
    status: [OrderStatus.Fulfill, OrderStatus.PartiallyFilled, OrderStatus.Canceled],
    userId: props.userId,
  });
  const pairs = useAppSelector((state) => state.pair.pairs);

  useEffect(() => {
    setOrders(orderList);
  }, [orderList]);

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
          row.executed = fixPrecision(((row.filled_amount * row.average) / row.total) * 100, TO_FIX_2) + '%';
        } else {
          row.executed = fixPrecision((row.filled_amount / row.amount) * 100, TO_FIX_2) + '%';
        }
      } else {
        row.execute = '-';
      }

      // custom order type
      if (row.type === EORDER_TYPE.Market) {
        row.type = ORDER_TYPE.MARKET;
        row.price = ORDER_TYPE.MARKET;
        if (new BigNumber(row.total || '0').gt('0')) {
          row.amount = fixPrecision(new BigNumber(row.total).div(row.average), pair?.amount_precision);
          row.total = fixPrecision(row.total, pair?.amount_precision);
        } else {
          row.total = row.average
            ? fixPrecision(new BigNumber(row.average).times(row.amount), pair?.amount_precision)
            : '-';
          //custom amount
          row.amount = fixPrecision(row.amount, pair?.amount_precision);
        }
      } else {
        //custom price
        row.price = fixPrecision(row.price, pair?.price_precision);
        row.type = ORDER_TYPE.LIMIT;
        // custom total
        row.total = row.average
          ? fixPrecision(new BigNumber(row.average).times(row.amount), pair?.amount_precision)
          : '-';
        //custom amount
        row.amount = fixPrecision(row.amount, pair?.amount_precision);
      }

      //custom average
      row.average = row.average && row.average !== '0' ? fixPrecision(row.average, pair?.price_precision) : '-';

      //custom order side
      if (row.side === EORDER_SIDE.Buy) {
        row.side = ORDER_SIDE.BUY;
      } else row.side = ORDER_SIDE.SELL;

      //custom order status
      if (row.status === OrderStatus.Canceled) {
        row.status = ORDER_STATUS.CANCELED;
      } else if (row.status === OrderStatus.Fulfill) {
        row.status = ORDER_STATUS.FILLED;
      } else if (row.status === OrderStatus.PartiallyFilled) {
        row.status = ORDER_STATUS.PARTIALLY;
      }

      row.created_at = moment(row.created_at).format(FORMAT_DATE);
    });
    return rows;
  };

  const COLUMNS: GridColDef[] = [
    { field: 'pair', headerName: 'Pair' },
    { field: 'created_at', headerName: 'Date', width: 200 },
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
    { field: 'average', headerName: 'Average', width: 150 },
    { field: 'price', headerName: 'Price', width: 150 },
    { field: 'amount', headerName: 'Amount', width: 150 },
    { field: 'total', headerName: 'Total' },
    { field: 'executed', headerName: 'Executed' },
    {
      field: 'pool_id',
      headerName: 'Pool',
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
    { field: 'id', headerName: 'Order ID' },
    {
      field: 'address',
      headerName: 'Wallet',
      width: 200,
      renderCell: (params: GridCellParams) => {
        return <TooltipText content={params.value} />;
      },
    },
    { field: 'status', headerName: 'Status' },
  ];

  useEffect(() => {
    dispatch(getOrderHistoryApi(conditionFilterOrderHistory));
    dispatch(getPairsApi());
    dispatch(getCoinsApi());
    eventBus.on(SocketEvent.OrdersUpdated, async () => {
      await sleep(DELAY_TIME);
      dispatch(getOrderHistoryApi(conditionFilterOrderHistory));
    });
    disableDragDrop('data-grid');
  }, []);

  const handleFilterCondition = (condition: TFilter) => {
    condition.page = DEFAULT_PAGE;
    condition.limit = props.limitRecord;
    dispatch(getOrderHistoryApi(condition));
    setConditionFilterOrderHistory(condition);
  };

  const customNoRowOverlay = (): ReactElement => {
    return (
      <GridOverlay>
        <div className={cx('text-no-record')}>
          {conditionFilterOrderHistory.pair || conditionFilterOrderHistory.method?.length !== METHOD_FILTER.length
            ? MESSAGE_TABLE.NOT_FOUND
            : MESSAGE_TABLE.NO_RECORD}
        </div>{' '}
      </GridOverlay>
    );
  };

  const handleChangePage = (event: ChangeEvent<unknown>, value: number): void => {
    conditionFilterOrderHistory.page = value;
    dispatch(getOrderHistoryApi(conditionFilterOrderHistory));
    setConditionFilterOrderHistory(conditionFilterOrderHistory);
  };

  return (
    <>
      <FilterBar
        itemFilter={[ITEMS_FILTER.PAIR, ITEMS_FILTER.METHOD]}
        pairList={pairList}
        handleFilterCondition={handleFilterCondition}
        conditionFilter={conditionFilterOrderHistory}
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
          disableColumnMenu
          hideFooterPagination
          hideFooterRowCount
          hideFooterSelectedRowCount
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
            page={conditionFilterOrderHistory.page}
            variant="outlined"
            shape="rounded"
            onChange={handleChangePage}
          />
        </div>
      )}
    </>
  );
};
