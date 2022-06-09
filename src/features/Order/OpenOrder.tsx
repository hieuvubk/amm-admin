/* eslint-disable react-hooks/exhaustive-deps */
import Pagination from '@material-ui/lab/Pagination';
import classnames from 'classnames/bind';
import React, { ChangeEvent, ReactElement, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { CSelect } from 'src/components/Base/Select';
import { useAppSelector } from 'src/store/hooks';
import styles from 'src/features/wallet/Wallets.module.scss';
import { InputLabel } from '@material-ui/core';
import moment from 'moment';
import FilterOrderForm from 'src/features/Order/FilterForm/FilterForm';
import { HISTORY_TYPE, IOrder, Market, TFilter } from 'src/features/Order/Constant';
import { getOrdersApi } from 'src/features/Order/openOrder.slice';

const cx = classnames.bind(styles);

const OpenOrder: React.FC = () => {
  const dispatch = useDispatch();
  const [listRecordChecked, setListRecordChecked] = useState<Array<IOrder>>([]);
  const [conditionFilter, setConditionFilter] = useState<TFilter>({
    limit: 10,
    page: 1,
  });
  const orderStore = useAppSelector((state) => state.order.order.data);
  const totalPage = useAppSelector((state) => state.order.order.metadata.totalPage);
  useEffect(() => {
    dispatch(getOrdersApi(conditionFilter));
  }, [conditionFilter]);
  useEffect(() => {
    setListRecordChecked(orderStore);
  }, [orderStore]);
  const handleFilterCondition = (condition: TFilter): void => {
    dispatch(getOrdersApi(condition));
    setConditionFilter(condition);
  };
  const handleChangeHistoryType = (value: number): void => {
    setConditionFilter({
      ...conditionFilter,
      status: value,
    });
  };
  const handleChange = (event: ChangeEvent<unknown>, value: number): void => {
    conditionFilter.page = value;
    dispatch(getOrdersApi(conditionFilter));
    setConditionFilter(conditionFilter);
  };
  return (
    <div className={cx('wallets')}>
      <div>
        <div className={cx('title')}>
          <div className={cx('wallets-title')}>Open Order</div>
          <div className={cx('network-input')}>
            <InputLabel className={cx('network-input-label')}>History type:</InputLabel>
            <CSelect
              className={cx('select-network')}
              options={HISTORY_TYPE}
              onChange={(value): void => {
                handleChangeHistoryType(value);
              }}
              placeholder="history type"
            />
          </div>
        </div>
        <div className={cx('wrap-container')}>
          <FilterOrderForm dataFilter={conditionFilter} setDataFilter={handleFilterCondition} />
          <div className={cx('data-grid-wrap')}>
            <table className={cx('theme-custom-table')}>
              <thead>
                <tr>
                  <th>Pair</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Side</th>
                  <th>Price</th>
                  <th>Amount</th>
                  <th>Total</th>
                  <th>Filled</th>
                </tr>
              </thead>
              <tbody>
                {listRecordChecked?.map((order: IOrder, index: number): ReactElement => {
                  return (
                    <tr className="cursor-pointer" key={index}>
                      <td>{`${order.base_name}/${order.quote_name}`}</td>
                      <td>{moment(order.created_at).format('DD/MM/YYYY')}</td>
                      <td>{order.type}</td>
                      <td>{order.side}</td>
                      <td>{order.price}</td>
                      <td>{order.amount}</td>
                      <td>{order.type === Market ? Number(order.price) * Number(order.amount) : '--'}</td>
                      <td>{(Number(order.filled_amount) / Number(order.amount)).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className={cx('footer-pagination')}>
          <Pagination
            className={cx('MuiPaginationItem-page')}
            count={totalPage}
            variant="outlined"
            shape="rounded"
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};

export default OpenOrder;
