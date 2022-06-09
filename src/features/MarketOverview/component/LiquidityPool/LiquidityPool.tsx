/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
/* eslint-disable react-hooks/exhaustive-deps */
import Pagination from '@material-ui/lab/Pagination';
import classnames from 'classnames/bind';
import React, { ChangeEvent, ReactElement, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'src/store/hooks';
import { InputLabel } from '@material-ui/core';
import { CSelect } from 'src/components/Base/Select';
import { IFilter, PAGINATION, OPTION_TRANSACTION_TYPE } from 'src/features/MarketOverview/constants/index';
import { LiquidityPool } from 'src/features/MarketOverview/constants/index';
import styles from 'src/features/MarketOverview/style/MarketOverView.module.scss';
import { getLiquidityPoolApi } from 'src/features/MarketOverview/api/index';
import Moment from 'react-moment';
import { FilterLiquidityPool } from 'src/features/MarketOverview/FilterForm/filterLiquidityPool';
import { renderAddressWallet } from 'src/features/MarketOverview/helper';
import stylesPagition from 'src/components/Pagination/style';
import { DEFAULT_PAGE, FORMAT_DATE, SORT } from 'src/helpers/const';
import { SortDownHighLightIcon, SortDownIcon, SortUpHighLightIcon, SortUpIcon } from 'src/assets/icon';
const cx = classnames.bind(styles);
const LiquidityPoolList: React.FC = () => {
  const dispatch = useDispatch();
  const classes = stylesPagition();
  const [, setCurrentPage] = useState(PAGINATION.DEFAULT_CURRENT_PAGE);
  const [listLiquidityPool, setListLiquidityPool] = useState<Array<LiquidityPool>>([]);
  const [conditionFilter, setConditionFilter] = useState<IFilter>({
    limit: DEFAULT_PAGE.limit,
    page: DEFAULT_PAGE.page,
  });
  const [sortingDate, setSortingDate] = useState(SORT.DECREASE);
  const [typeTransaction, setTypeTransaction] = useState<string>(OPTION_TRANSACTION_TYPE[0].value);
  const totalPage = useAppSelector((state) => state.marketOverView.liquidity_pools.metadata.totalPage);
  const liquidityPoolStore = useAppSelector((state) => state.marketOverView.liquidity_pools.data);
  useEffect(() => {
    dispatch(getLiquidityPoolApi(conditionFilter));
  }, []);

  useEffect(() => {
    setListLiquidityPool(liquidityPoolStore);
    conditionFilter.created_at = sortingDate;
  }, [liquidityPoolStore, typeTransaction, sortingDate]);

  const handleFilterCondition = (condition: IFilter): void => {
    dispatch(getLiquidityPoolApi(condition));
    setConditionFilter(condition);
  };

  const handleChange = (event: ChangeEvent<unknown>, value: number): void => {
    conditionFilter.page = value;
    dispatch(getLiquidityPoolApi(conditionFilter));
    setConditionFilter(conditionFilter);
    setCurrentPage(value);
  };
  const handleChangeTransactionType = (value: string): void => {
    setTypeTransaction(value);
  };
  const handleSort = () => {
    if (sortingDate === SORT.INCREASE) {
      setSortingDate(SORT.DECREASE);
    } else setSortingDate(SORT.INCREASE);
  };
  return (
    <div>
      <div className={cx('transaction-type')}>
        <InputLabel className={cx('text-filter-bar')}>Transaction type:</InputLabel>
        <CSelect
          options={OPTION_TRANSACTION_TYPE}
          defaultValue={OPTION_TRANSACTION_TYPE[0]}
          onChange={(value: string): void => {
            handleChangeTransactionType(value);
          }}
          placeholder="All"
        />
      </div>
      <div className={cx('wrap-container')}>
        <FilterLiquidityPool
          conditionFilter={conditionFilter}
          typeTransaction={typeTransaction}
          handleFilterCondition={handleFilterCondition}
        />
        <div className={cx('data-grid-wrap')}>
          <table className={cx('theme-custom-table')}>
            <thead>
              <tr>
                {typeTransaction && typeTransaction === OPTION_TRANSACTION_TYPE[0].value ? (
                  <>
                    <th>Swap</th>
                    <th className={cx('th-sort')} onClick={handleSort}>
                      <span>Date</span>
                      <div className={cx('sort')}>
                        <img src={totalPage > 0 && sortingDate === SORT.INCREASE ? SortUpHighLightIcon : SortUpIcon} />
                        <img
                          src={totalPage > 0 && sortingDate === SORT.DECREASE ? SortDownHighLightIcon : SortDownIcon}
                        />
                      </div>
                    </th>
                    <th>Price</th>
                    <th>Digital credit amount</th>
                    <th>Pool</th>
                    <th>Wallet</th>
                    <th>User ID</th>
                  </>
                ) : (
                  <>
                    <th>Add</th>
                    <th className={cx('th-sort')} onClick={handleSort}>
                      <span>Date</span>
                      <div className={cx('sort')}>
                        <img src={totalPage > 0 && sortingDate === SORT.INCREASE ? SortUpHighLightIcon : SortUpIcon} />
                        <img
                          src={totalPage > 0 && sortingDate === SORT.DECREASE ? SortDownHighLightIcon : SortDownIcon}
                        />
                      </div>
                    </th>
                    <th>Detail</th>
                    <th>Pool</th>
                    <th>Wallet</th>
                    <th>User ID</th>
                  </>
                )}
                ;
              </tr>
            </thead>
            <tbody>
              {listLiquidityPool.length > 0 &&
                listLiquidityPool.map((item: LiquidityPool, index: number): ReactElement => {
                  return (
                    <tr className="cursor-pointer" key={index}>
                      <>
                        {typeTransaction && typeTransaction === OPTION_TRANSACTION_TYPE[0].value ? (
                          <>
                            <td className={cx('tile-active')}>{item.pair_name}</td>
                            <td>
                              <Moment format={FORMAT_DATE}>{item.created_at}</Moment>
                            </td>
                            <td className={cx('tile-active')}>{item.price}</td>
                            <td className={cx('tile-active')}>{item.digital_amount}</td>
                            <td className={cx('tile-active')}>{item.digital_amount}</td>
                            <td className={cx('tile-active')}>{renderAddressWallet(item.pool_address)}</td>
                            <td className={cx('tile-active')}>{renderAddressWallet(item.wallet)}</td>
                            <td className={cx('tile-active')}>{item.user_id}</td>
                          </>
                        ) : (
                          <>
                            <td className={cx('tile-active')}>{item.add}</td>
                            <td>
                              <Moment format="DD/MM/YYYY">{item.created_at}</Moment>
                            </td>
                            <td className={cx('tile-active')}>{item.detais}</td>
                            <td className={cx('tile-active')}>{renderAddressWallet(item.pool_address)}</td>
                            <td className={cx('tile-active')}>{renderAddressWallet(item.wallet)}</td>
                            <td className={cx('tile-active')}>{item.user_id}</td>
                          </>
                        )}
                      </>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          {listLiquidityPool.length <= 0 && <p className={cx('table-no-data')}>Not found</p>}
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

export default LiquidityPoolList;
