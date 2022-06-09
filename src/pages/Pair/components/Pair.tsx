import Pagination from '@material-ui/lab/Pagination';
import classnames from 'classnames/bind';
import React, { ReactElement, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'src/store/hooks';
import { useHistory } from 'react-router-dom';
import styles from 'src/pages/Pair/styles/Pairs.module.scss';
import { getPairsApi } from 'src/pages/Pair/api/index';
import { IFilter, IPair } from 'src/pages/Pair/constants/Constant';
import { FilterForm } from 'src/pages/Pair/FilterForm/index';
import LinksBreadcrumbs from 'src/features/Admin/components/LinksBreadcrumbs/LinksBreadcrumbs';
import routeConstants from 'src/constants/routeConstants';
import stylesPagition from 'src/components/Pagination/style';
import { DEFAULT_PAGE } from 'src/helpers/const';
import { STATUS } from 'src/pages/Pair/constants/Constant';
const cx = classnames.bind(styles);
const Pair: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const classes = stylesPagition();
  const [listRecordChecked, setListRecordChecked] = useState<Array<IPair>>([]);
  const [totalPage, setTotalPage] = useState(1);
  const [conditionFilter, setConditionFilter] = useState<IFilter>({
    limit: DEFAULT_PAGE.limit,
    page: DEFAULT_PAGE.page,
    status: STATUS[0].value,
  });
  const pairStore = useAppSelector((state) => state.pair.pair);
  useEffect(() => {
    dispatch(getPairsApi(conditionFilter));
  }, [dispatch, conditionFilter]);
  const setNetwork = (
    base_coin_stellar_issuer: string,
    base_coin_evrynet_address: string,
    target_coin_stellar_issuer: string,
    target_coin_evrynet_address: string,
  ): string[] => {
    const network: string[] = [];
    if (base_coin_stellar_issuer && target_coin_stellar_issuer) network.push('Stellar');
    if (base_coin_evrynet_address && target_coin_evrynet_address) network.push('BSC');
    return network;
  };
  useEffect(() => {
    setTotalPage(pairStore.metadata.totalPage);
    const pairSetting = pairStore.data.map((res: IPair) => {
      return {
        ...res,
        network: setNetwork(
          res.base_stellar_issuer,
          res.base_coin_bsc_address,
          res.quote_stellar_issuer,
          res.quote_coin_bsc_address,
        ),
      };
    });
    setListRecordChecked(pairSetting);
  }, [pairStore]);
  const handleChange = (event: unknown, value: number): void => {
    conditionFilter.page = value;
    dispatch(getPairsApi(conditionFilter));
    setConditionFilter(conditionFilter);
  };
  const handleFilterCondition = (condition: IFilter): void => {
    dispatch(getPairsApi(condition));
    setConditionFilter(condition);
  };
  return (
    <div className={cx('pairs')}>
      <div>
        <LinksBreadcrumbs
          value={[
            {
              content: 'Order book',
              onClick: (): void => history.push(routeConstants.TRADING_FEE_SETTINGS),
            },
            {
              content: 'Pair settings',
              onClick: (): void => history.push(routeConstants.PAIR_SETTINGS),
            },
          ]}
        />
        <div className={cx('pairs-title')}>Pair settings</div>
        <div className={cx('wrap-container')}>
          <div className={cx('filter-container')}>
            <FilterForm conditionFilter={conditionFilter} handleFilterCondition={handleFilterCondition} />
          </div>
          <table className={cx('theme-custom-table')}>
            <thead>
              <tr>
                <th>Base</th>
                <th>Quote</th>
                <th className={cx('title-right')}>Quote ID</th>
                <th className={cx('title-right')}>Base ID</th>
                <th className={cx('title-right')}>Minimum amount</th>
                <th className={cx('title-right')}>Minimum total</th>
                <th className={cx('title-right')}>Amount precision</th>
                <th className={cx('title-right')}>Price precision</th>
                <th className={cx('title-right')}>Total precision</th>
                <th>Status</th>
                <th>Network</th>
              </tr>
            </thead>
            <tbody>
              {listRecordChecked?.map((pair: IPair, index: number): ReactElement => {
                return (
                  <tr className="cursor-pointer" key={index}>
                    <td>{pair.base_symbol}</td>
                    <td>{pair.quote_symbol}</td>
                    <td className={cx('title-right')}>{'--'}</td>
                    <td className={cx('title-right')}>{'--'}</td>
                    <td className={cx('title-right')}>{pair.pairs_minimum_amount}</td>
                    <td className={cx('title-right')}>{pair.pairs_minimum_total}</td>
                    <td className={cx('title-right')}>{pair.pairs_amount_precision}</td>
                    <td className={cx('title-right')}>{pair.pairs_price_precision}</td>
                    <td className={cx('title-right')}>{pair.pairs_amount_precision}</td>
                    <td>{pair.pairs_is_active === 0 ? 'Disabled' : 'Active'}</td>
                    <td>
                      {pair.network.reduce((prev, network, index) => {
                        prev += `${network}${index !== pair.network.length - 1 ? ', ' : ''}`;
                        return prev;
                      }, '')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!listRecordChecked.length && <p className={cx('table-no-data')}>Not found</p>}
        </div>
        {totalPage > 1 ? (
          <div className={cx('footer-pagination')}>
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
    </div>
  );
};
export default Pair;
