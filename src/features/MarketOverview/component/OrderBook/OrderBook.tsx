/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
/* eslint-disable react-hooks/exhaustive-deps */
import Pagination from '@material-ui/lab/Pagination';
import classnames from 'classnames/bind';
import React, { ChangeEvent, ReactElement, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'src/store/hooks';
import { IFilter, PAGINATION } from 'src/features/MarketOverview/constants/index';
import { OrderBook } from 'src/features/MarketOverview/constants/index';
import styles from 'src/features/MarketOverview/style/MarketOverView.module.scss';
import { getOrderBooksApi } from 'src/features/MarketOverview/api/index';
import Moment from 'react-moment';
import { FilterOrderBook } from 'src/features/MarketOverview/FilterForm/filterOrderBook';
import { renderAddressWallet } from 'src/features/MarketOverview/helper';
import stylesPagition from 'src/components/Pagination/style';
import { DEFAULT_PAGE, FORMAT_DATE, SORT } from 'src/helpers/const';
import { SortDownHighLightIcon, SortDownIcon, SortUpHighLightIcon, SortUpIcon } from 'src/assets/icon';
const cx = classnames.bind(styles);
const OrderBookList: React.FC = () => {
  const dispatch = useDispatch();
  const classes = stylesPagition();
  const [, setCurrentPage] = useState(PAGINATION.DEFAULT_CURRENT_PAGE);
  const [listOrderBook, setlistOrderBook] = useState<Array<OrderBook>>([]);
  const [conditionFilter, setConditionFilter] = useState<IFilter>({
    limit: DEFAULT_PAGE.limit,
    page: DEFAULT_PAGE.page,
  });
  const [sortingDate, setSortingDate] = useState(SORT.DECREASE);
  const totalPage = useAppSelector((state) => state.marketOverView.orderbooks.metadata.totalPage);
  const orderBookStore = useAppSelector((state) => state.marketOverView.orderbooks.data);
  useEffect(() => {
    dispatch(getOrderBooksApi(conditionFilter));
  }, []);

  useEffect(() => {
    conditionFilter.created_at = sortingDate;
    setlistOrderBook(orderBookStore);
  }, [orderBookStore, sortingDate]);

  const handleFilterCondition = (condition: IFilter): void => {
    dispatch(getOrderBooksApi(condition));
    setConditionFilter(condition);
  };

  const handleChange = (event: ChangeEvent<unknown>, value: number): void => {
    conditionFilter.page = value;
    dispatch(getOrderBooksApi(conditionFilter));
    setConditionFilter(conditionFilter);
    setCurrentPage(value);
  };
  const handleSort = () => {
    if (sortingDate === SORT.INCREASE) {
      setSortingDate(SORT.DECREASE);
    } else setSortingDate(SORT.INCREASE);
  };
  return (
    <div>
      <div className={cx('wrap-container')}>
        <FilterOrderBook
          conditionFilter={conditionFilter}
          handleFilterCondition={handleFilterCondition}
          validateNumber={true}
        />
        <div className={cx('data-grid-wrap')}>
          <table className={cx('theme-custom-table')}>
            <thead>
              <tr>
                <th>Pair</th>
                <th className={cx('th-sort')} onClick={handleSort}>
                  <span>Date</span>
                  <div className={cx('sort')}>
                    <img src={totalPage > 0 && sortingDate === SORT.INCREASE ? SortUpHighLightIcon : SortUpIcon} />
                    <img src={totalPage > 0 && sortingDate === SORT.DECREASE ? SortDownHighLightIcon : SortDownIcon} />
                  </div>
                </th>
                <th>Side</th>
                <th>Price</th>
                <th>Filled</th>
                <th>Fee</th>
                <th>Total</th>
                <th>Wallet</th>
                <th>Network</th>
                <th>User ID</th>
              </tr>
            </thead>
            <tbody>
              {listOrderBook.length > 0 &&
                listOrderBook.map((item: OrderBook, index: number): ReactElement => {
                  return (
                    <tr className="cursor-pointer" key={index}>
                      <>
                        <td className={cx('tile-active')}>{item.pair_name}</td>
                        <td>
                          <Moment format={FORMAT_DATE}>{item.created_at}</Moment>
                        </td>
                        <td className={cx('tile-active')}>{item.side}</td>
                        <td className={cx('tile-active')}>{item.price}</td>
                        <td className={cx('tile-active')}>{item.filled}</td>
                        <td className={cx('tile-active')}>{item.fee}</td>
                        <td className={cx('tile-active')}>{item.total}</td>
                        <td className={cx('tile-active')}>{renderAddressWallet(item.wallet)}</td>
                        <td className={cx('tile-active')}>{renderAddressWallet(item.network)}</td>
                        <td className={cx('tile-active')}>{item.user_id}</td>
                      </>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          {listOrderBook.length <= 0 && <p className={cx('table-no-data')}>Not found</p>}
        </div>
      </div>
      {totalPage > 1 ? (
        <div className={cx('footer-pagination')}>
          <div>
            <Pagination
              className={classes.pagination}
              count={totalPage}
              page={conditionFilter.page}
              variant="outlined"
              shape="rounded"
              onChange={handleChange}
            />
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default OrderBookList;
