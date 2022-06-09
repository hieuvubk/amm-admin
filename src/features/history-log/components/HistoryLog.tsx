import React, { useEffect, useState } from 'react';
import LinksBreadcrumbs from 'src/features/Admin/components/LinksBreadcrumbs';
import LayoutAccount from 'src/layouts/LayoutAccount/LayoutAccount';
import styles from '../style/history-log.module.scss';
import classnames from 'classnames/bind';
import { useDispatch } from 'react-redux';
import { DEFAULT_FILTER } from 'src/features/history-log/redux/history.slice';
import { getHistoryLog } from 'src/features/Admin/redux/apis';
import { useAppSelector } from 'src/store/hooks';
import { formatWalletAddress } from 'src/helpers/address';
import moment from 'moment';
import { IHistoryLog } from '../interfaces';
import { FilterFormHisToryLog } from 'src/features/history-log/FilterForm/index';
import { IFilterHistoryLog } from 'src/features/history-log/interfaces/index';
import { SortDownHighLightIcon, SortDownIcon, SortUpHighLightIcon, SortUpIcon } from 'src/assets/icon';
import stylesPagition from 'src/components/Pagination/style';
import { FORMAT_DATE, SORT } from 'src/helpers/const';
import { renderActivites } from 'src/features/history-log/helper/index';
import Pagination from '@material-ui/lab/Pagination';
import Tooltip from '@material-ui/core/Tooltip';
const cx = classnames.bind(styles);

const HistoryLog: React.FC = () => {
  const dispatch = useDispatch();
  const classes = stylesPagition();
  const historyLog = useAppSelector((state) => state.history.history.data);
  const totalPage = useAppSelector((state) => state.history.history.metadata.totalPage);
  const [sortingDate, setSortingDate] = useState(SORT.DECREASE);
  const [conditionFilter, setConditionFilter] = useState<IFilterHistoryLog>({
    page: DEFAULT_FILTER.page,
    size: DEFAULT_FILTER.size,
    from: DEFAULT_FILTER.from,
    to: DEFAULT_FILTER.to,
    created_at: DEFAULT_FILTER.create_at,
  });

  const handleFilterCondition = (condition: IFilterHistoryLog): void => {
    dispatch(getHistoryLog(condition));
    setConditionFilter(condition);
  };

  useEffect(() => {
    conditionFilter.created_at = sortingDate;
    dispatch(getHistoryLog(conditionFilter));
  }, [sortingDate]);
  const handleSort = () => {
    sortingDate === SORT.INCREASE ? setSortingDate(SORT.DECREASE) : setSortingDate(SORT.INCREASE);
  };
  const handleChange = (event: unknown, value: number): void => {
    conditionFilter.page = value;
    dispatch(getHistoryLog(conditionFilter));
    setConditionFilter(conditionFilter);
  };
  return (
    <LayoutAccount>
      <LinksBreadcrumbs
        value={[
          {
            content: 'History log',
          },
        ]}
      />
      <h3 className={cx('title')}>History Log</h3>
      <div className={cx('table')}>
        <FilterFormHisToryLog
          conditionFilter={conditionFilter}
          handleFilterCondition={handleFilterCondition}
          validateNumber={true}
        />
        <table>
          <thead>
            <tr>
              <th>Admin ID</th>
              <th className={cx('th-sort')} onClick={handleSort}>
                <div className={cx('th-sort-box')}>
                  <span>Date</span>
                  <div className={cx('sort')}>
                    <img
                      src={historyLog.length > 0 && sortingDate === SORT.INCREASE ? SortUpHighLightIcon : SortUpIcon}
                    />
                    <img
                      src={
                        historyLog.length > 0 && sortingDate === SORT.DECREASE ? SortDownHighLightIcon : SortDownIcon
                      }
                    />
                  </div>
                </div>
              </th>
              <th>Activity type</th>
              <th>Wallet</th>
              <th className={cx('th-activities')}>Activities</th>
            </tr>
          </thead>
          <tbody>
            {historyLog.map((item: IHistoryLog) => (
              <tr key={item.id}>
                <td>{item.admin_id}</td>
                <td>{moment(item.created_at).format(FORMAT_DATE)}</td>
                <td>{item.activity_type ? renderActivites(item.activity_type) : '-'} </td>
                {item.wallet && item.wallet !== ' ' ? (
                  <Tooltip title={item.wallet} placement={'top-start'}>
                    <td>{formatWalletAddress(item.wallet)}</td>
                  </Tooltip>
                ) : (
                  <td>-</td>
                )}
                {item.activities ? (
                  // <Tooltip title={item.activities} placement={'top-start'}>
                  //   <td>{formatWalletAddress(item.activities)}</td>
                  // </Tooltip>
                  <td>{item.activities}</td>
                ) : (
                  <td>-</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {historyLog.length <= 0 && <p className={cx('table-no-data')}>Not found</p>}
      </div>
      <div className={cx('footer-pagination')}>
        {totalPage > 1 ? (
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
        ) : (
          <div></div>
        )}
      </div>
    </LayoutAccount>
  );
};

export default HistoryLog;
