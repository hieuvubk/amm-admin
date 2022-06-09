/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
/* eslint-disable react-hooks/exhaustive-deps */
import Pagination from '@material-ui/lab/Pagination';
import classnames from 'classnames/bind';
import React, { ChangeEvent, ReactElement, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'src/store/hooks';
import { PAGINATION, DRS_DATA } from 'src/features/Drs/constants/index';
import { Drs, IFilter } from 'src/features/Drs/interfaces/index';
import styles from 'src/features/Drs/styles/Drs.module.scss';
import { getDrsApi } from 'src/features/Drs/api/index';
import stylesPagition from 'src/components/Pagination/style';
import { DEFAULT_PAGE } from 'src/helpers/const';
const cx = classnames.bind(styles);
const DrsList: React.FC = () => {
  const dispatch = useDispatch();
  const classes = stylesPagition();
  const [, setCurrentPage] = useState(PAGINATION.DEFAULT_CURRENT_PAGE);
  const [listDrs, setListDrs] = useState<Array<Drs>>([]);
  const [conditionFilter, setConditionFilter] = useState<IFilter>({
    limit: DEFAULT_PAGE.limit,
    page: DEFAULT_PAGE.page,
  });
  const totalPage = useAppSelector((state) => state.drs.drs.metadata.totalPage);
  // const drsStore = useAppSelector((state) => state.drs.drs.data);
  useEffect(() => {
    dispatch(getDrsApi(conditionFilter));
  }, []);

  useEffect(() => {
    setListDrs(DRS_DATA);
  }, [DRS_DATA]);

  const handleChange = (event: ChangeEvent<unknown>, value: number): void => {
    conditionFilter.page = value;
    dispatch(getDrsApi(conditionFilter));
    setConditionFilter(conditionFilter);
    setCurrentPage(value);
  };
  return (
    <div>
      <div className={cx('wrap-container')}>
        <div className={cx('data-grid-wrap')}>
          <div className={cx('box-pool')}>
            <div className={cx('box-left')}>
              <p className={cx('reserve_title')}>Reserve_pool</p>
              <p className={cx('reserve_value')}>9,928.35 VELO</p>
            </div>
            <div className={cx('box-line')}></div>
            <div className={cx('box-right')}>
              <p className={cx('collateral_title')}>Collateral_pool</p>
              <p className={cx('collateral_value')}>9,928.35 VELO</p>
            </div>
          </div>
          <table className={cx('theme-custom-table')}>
            <thead>
              <tr>
                <>
                  <th>Underiying Fiat</th>
                  <th>#Digital Credit</th>
                  <th>#VELO Tokens as Collateral backing Digital Credits</th>
                  <th>VELO Collateral Value in Fiat</th>
                  <th>VELO Collateral Value in USD</th>
                  <th>3rd Party Stable coin Collateral</th>
                  <th>Direct Fiat Cash Collateral</th>
                </>
              </tr>
            </thead>
            <tbody>
              {listDrs.length > 0 &&
                listDrs.map((item: Drs, index: number): ReactElement => {
                  return (
                    <tr className="cursor-pointer" key={index}>
                      <>
                        <td className={cx('tile-active')}>{item.symbol}</td>
                        <td className={cx('tile-active')}>{item.digital}</td>
                        <td className={cx('tile-active')}>{item.token}</td>
                        <td className={cx('tile-active')}>{item.collateral_fiat}</td>
                        <td className={cx('tile-active')}>{item.collateral_usd}</td>
                        <td className={cx('tile-active')}>{item.coin}</td>
                        <td className={cx('tile-active')}>{item.cash}</td>
                      </>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          {listDrs.length <= 0 && <p className={cx('table-no-data')}>Not found</p>}
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

export default DrsList;
