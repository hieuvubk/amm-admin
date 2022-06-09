import Pagination from '@material-ui/lab/Pagination';
import classnames from 'classnames/bind';
import React, { ChangeEvent, ReactElement, useEffect, useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from 'src/store/hooks';
import { useHistory } from 'react-router-dom';
import {
  IFilter,
  PoolRequest,
  PoolType,
  UserType,
  UserTypeLabel,
  PoolStatus,
  PoolStatusLabel,
  DEFAULT_CONDITION_FILTER,
} from 'src/features/PoolRequest/constants/index';
import { FilterForm } from 'src/features/PoolRequest/FilterForm/index';
import styles from 'src/features/PoolRequest/styles/PoolRequest.module.scss';
import { getPoolRequestsList } from 'src/features/PoolRequest/api/index';
import Moment from 'react-moment';
import LinksBreadcrumbs from 'src/features/Admin/components/LinksBreadcrumbs/LinksBreadcrumbs';
import routeConstants from 'src/constants/routeConstants';
import stylesPagition from 'src/components/Pagination/style';
import { FORMAT_DATE, SORT } from 'src/helpers/const';
import { SortDownHighLightIcon, SortDownIcon, SortUpHighLightIcon, SortUpIcon } from 'src/assets/icon';
import { getCoinsApi } from 'src/features/User/components/Transactions/Transactions.slice';
import { clearPoolRequestList } from 'src/features/PoolRequest/redux/PoolRequest.slice';
import CLoading from 'src/components/Loading';

const cx = classnames.bind(styles);
const PoolRequestList: React.FC = () => {
  const dispatch = useAppDispatch();
  const classes = stylesPagition();
  const history = useHistory();
  const [conditionFilter, setConditionFilter] = useState<IFilter>(DEFAULT_CONDITION_FILTER);
  const totalPage = useAppSelector((state) => state.poolRequest.list.metadata.totalPage);
  const poolRequestsList = useAppSelector((state) => state.poolRequest.list.data);
  const coinsList = useAppSelector((state) => state.allCoins.coins.data);
  const loading = useAppSelector((state) => state.poolRequest.loading);
  const [sortingDate, setSortingDate] = useState(SORT.DECREASE);
  const ref = useRef<HTMLTableSectionElement>(null);

  React.useEffect(() => {
    dispatch(getCoinsApi());

    return () => {
      dispatch(clearPoolRequestList());
    };
  }, []);

  useEffect(() => {
    dispatch(getPoolRequestsList({ ...conditionFilter, create_at_sort: sortingDate }));
  }, [conditionFilter, sortingDate]);

  const handleChangePage = (event: ChangeEvent<unknown>, value: number): void => {
    conditionFilter.page !== value && setConditionFilter({ ...conditionFilter, page: value });
  };

  const handleSort = () => {
    sortingDate === SORT.INCREASE ? setSortingDate(SORT.DECREASE) : setSortingDate(SORT.INCREASE);
  };

  const getDetail = (e: PoolRequest): void => {
    e && e.status === PoolStatus.Rejected
      ? history.push(`/pools-request/rejected/${e.id}`)
      : e.status === PoolStatus.Pending
      ? history.push(`/pools-request/pending/${e.id}`)
      : null;
  };

  const getBalances = (
    coins: Array<{
      coin_id: number;
      weight: string;
    }>,
  ): JSX.Element => {
    const totalWeight = coins.reduce((acc, coin) => acc + Number(coin.weight), 0);
    const length = coins.length;

    return (
      <div>
        {coins.map(({ coin_id, weight }, index) => {
          const currentCoinSymbol = coinsList.find((coin) => coin.id === coin_id)?.symbol;
          const currentCoinPercentage = `${((Number(weight) / totalWeight) * 100).toFixed(2)}%`;
          return (
            <>
              <span key={index} className={index > 3 ? cx('second-line') : undefined}>
                {`${currentCoinPercentage} ${currentCoinSymbol}${index === 3 || index === length - 1 ? '' : ' - '}`}
              </span>
              {index === 3 && <br />}
            </>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cx('poolrequests')}>
      <LinksBreadcrumbs
        value={[
          {
            content: 'Liquidity pool',
            onClick: (): void => history.push(routeConstants.POOL_DASHBOARD),
          },
          {
            content: 'Pool request',
            onClick: (): void => history.push(routeConstants.POOL_REQUEST),
          },
        ]}
      />
      <div className={cx('poolrequest-title')}>Pool request</div>
      <div className={cx('wrap-container')}>
        <FilterForm conditionFilter={conditionFilter} setConditionFilter={setConditionFilter} />
        <div className={cx('data-grid-wrap')}>
          <table className={cx('theme-custom-table')}>
            <thead>
              <tr>
                <th className={cx('th-request-id')}>Request ID</th>
                <th className={cx('th-sort')} onClick={handleSort}>
                  <div>
                    <span>Date</span>
                    <div className={cx('sort')}>
                      <img src={totalPage > 0 && sortingDate === SORT.INCREASE ? SortUpHighLightIcon : SortUpIcon} />
                      <img
                        src={totalPage > 0 && sortingDate === SORT.DECREASE ? SortDownHighLightIcon : SortDownIcon}
                      />
                    </div>
                  </div>
                </th>
                <th className={cx('th-type')}>Pool type</th>
                <th className={cx('th-balances')}>Balances</th>
                <th className={cx('th-user-type')}>User type</th>
                <th className={cx('th-user-id')}>User ID</th>
                <th className={cx('th-status')}>Status</th>
              </tr>
            </thead>
            <tbody ref={ref}>
              {!loading &&
                poolRequestsList.length > 0 &&
                poolRequestsList.map((item: PoolRequest, index: number): ReactElement => {
                  return (
                    <tr className="cursor-pointer" key={index} onClick={(): void => getDetail(item)}>
                      <td className={cx('tile-active')}>{item.id}</td>
                      <td>
                        <Moment format={FORMAT_DATE}>{item.created_at}</Moment>
                      </td>
                      <td>{item.type === PoolType.Fixed ? 'Fixed' : 'Flexible'}</td>
                      <td>{getBalances(item.pool_coins)}</td>
                      <td>
                        {item.user.user_type === UserType.Restricted
                          ? UserTypeLabel.Restricted
                          : UserTypeLabel.Unrestricted}
                      </td>
                      <td>{item.user_id}</td>
                      <td>
                        {item.status === PoolStatus.Pending
                          ? PoolStatusLabel.Pending
                          : item.status === PoolStatus.Rejected
                          ? PoolStatusLabel.Rejected
                          : PoolStatusLabel.Created}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          {loading && (
            <div className={cx('table-no-data')} style={{ height: ref.current?.clientHeight }}>
              <CLoading size="md" type="spin" />
            </div>
          )}

          {!loading && poolRequestsList.length <= 0 && (
            <div className={cx('table-no-data')}>
              {conditionFilter === DEFAULT_CONDITION_FILTER ? 'No record' : 'Not found'}
            </div>
          )}
        </div>
      </div>
      {poolRequestsList && totalPage > 1 ? (
        <div className={cx('footer-pagination')}>
          <div>
            <Pagination
              className={classes.pagination}
              count={totalPage}
              page={conditionFilter.page}
              variant="outlined"
              shape="rounded"
              onChange={handleChangePage}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PoolRequestList;
