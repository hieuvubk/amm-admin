import React from 'react';
import classNames from 'classnames/bind';
import styles from './Activities.module.scss';
import { CSelect } from 'src/components/Base/Select';
import Pagination from '@material-ui/lab/Pagination';
import paginationStyles from 'src/features/Admin/styles/pagination';

const cx = classNames.bind(styles);

const Activities: React.FC = () => {
  const classes = paginationStyles();
  return (
    <div className={cx('activities-container')}>
      <div className={cx('title')}>Admin activities</div>

      <div className={cx('filter-container')}>
        <label className={cx('label-select')}>Activity type: </label>
        <CSelect
          options={[
            { value: 'all', label: 'All' },
            { value: 'temp', label: 'temp' },
          ]}
          defaultValue={{ value: 'all', label: 'All' }}
          onChange={(): void => {}}
        />

        <label className={cx('label-select', 'date-label')}>Date: </label>
        <CSelect
          options={[
            { value: 'all', label: 'All' },
            { value: 'temp', label: 'temp' },
          ]}
          defaultValue={{ value: 'all', label: 'All' }}
          onChange={(): void => {}}
        />
      </div>

      <div className={cx('table-container')}>
        <table className={cx('theme-custom-table')}>
          <thead>
            <tr>
              <th className={cx('title')}>Activities</th>
              <th className={cx('title')}>Date</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((value, idx) => (
              <tr key={idx}>
                <td>abcxyz@gmail.com has changed Settings name</td>
                <td>25/06/2021</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={cx('footer-pagination')}>
        <div>
          <Pagination
            className={classes.pagination}
            count={8}
            variant="outlined"
            shape="rounded"
            onChange={(): void => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default Activities;
