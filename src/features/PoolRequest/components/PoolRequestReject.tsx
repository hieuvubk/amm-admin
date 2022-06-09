import React from 'react';
import classNames from 'classnames/bind';
import { useHistory, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import styles from 'src/features/PoolRequest/styles/PoolRequestReject.module.scss';
import LinksBreadcrumbs from 'src/features/Admin/components/LinksBreadcrumbs';
import routeConstants from 'src/constants/routeConstants';
import { PoolType, PoolTypeLabel } from 'src/features/PoolRequest/constants/index';
import { getPoolRequestDetail } from 'src/features/PoolRequest/api';
import { FLEXIBLE_POOL_RIGHTS } from 'src/features/Pools/constants';
import { getCoinsApi } from 'src/helpers/coinHelper/coin.slice';
import TokenIcon from 'src/helpers/coinHelper/TokenIcon';
import { setDataPrecision } from 'src/features/Pools/helper/dataFormater';
import { clearPoolRequestDetail } from 'src/features/PoolRequest/redux/PoolRequest.slice';

const cx = classNames.bind(styles);

const PoolRequestRejectDetail: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const poolRequestDetail = useAppSelector((state) => state.poolRequest.current.data);
  const coinsList = useAppSelector((state) => state.allCoins.coins.data);

  React.useEffect(() => {
    dispatch(getPoolRequestDetail(Number(id)));
    dispatch(getCoinsApi());

    return () => {
      dispatch(clearPoolRequestDetail());
    };
  }, []);

  const totalWeight =
    poolRequestDetail.pool_coins &&
    poolRequestDetail.pool_coins.reduce((prevTotal, coin) => prevTotal + Number(coin.weight), 0);

  return (
    <div>
      <div className={cx('poolrequest-reject')}>
        <LinksBreadcrumbs
          value={[
            {
              content: 'Liquidity pool',
              onClick: (): void => history.push(routeConstants.POOL_REQUEST),
            },
            {
              content: 'Pool request',
              onClick: (): void => history.push(routeConstants.POOL_REQUEST),
            },
            {
              content: 'Rejected pool request detail',
            },
          ]}
        />
        <div className={cx('poolrequest-title')}>Rejected pool request</div>
        <div className={cx('item-detail')}>
          <div className={cx('rowdetail')}>
            <p className={cx('title')}>From</p>
            <p className={cx('text')}>
              {poolRequestDetail && poolRequestDetail.user_id ? poolRequestDetail.user_id : null}
            </p>
          </div>
        </div>
        <div className={cx('item-detail')}>
          <div className={cx('rowdetail')}>
            <p className={cx('title')}>Email</p>
            <p className={cx('text')}>
              {poolRequestDetail && poolRequestDetail.user ? poolRequestDetail.user.email : null}
            </p>
          </div>
        </div>
        <div className={cx('item-detail')}>
          <div className={cx('rowdetail')}>
            <p className={cx('title')}>Pool type</p>
            <p className={cx('text')}>
              {poolRequestDetail && poolRequestDetail.type && poolRequestDetail.type === PoolType.Fixed
                ? PoolTypeLabel.Fixed
                : PoolTypeLabel.Flexible}
            </p>
          </div>
        </div>
        <div className={cx('item-detail', 'table-digital-credits')}>
          <div className={cx('rowdetail')}>
            <table className={cx('theme-custom-table-poolrequest')}>
              <thead>
                <tr>
                  <th className={cx('digital-credits-th')}>Digital credits</th>
                  <th className={cx('weight-th')}>Weight</th>
                  <th className={cx('percent-th')}>Percent</th>
                  <th className={cx('empty')}></th>
                </tr>
              </thead>
              <tbody>
                {poolRequestDetail.pool_coins?.map((item, index) => {
                  const tokenSymbol = coinsList.find((coin) => coin.id === item.coin_id)?.symbol;

                  return (
                    <tr className="cursor-pointer" key={index}>
                      <td className={cx('digital-credits-td')}>
                        {tokenSymbol && (
                          <div>
                            <TokenIcon name={tokenSymbol} size="25" />
                            <div>{tokenSymbol}</div>
                          </div>
                        )}
                      </td>
                      <td className={cx('weight-td')}>{Number(item.weight).toFixed(2)}</td>
                      <td className={cx('percent-td')}>{((Number(item.weight) / totalWeight) * 100).toFixed(2)}%</td>
                      <td className={cx('empty')}></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className={cx('item-detail')}>
          <div className={cx('rowdetail')}>
            <p className={cx('title')}>Swap fee (%)</p>
            <p className={cx('text')}>
              {poolRequestDetail && poolRequestDetail.swap_fee ? setDataPrecision(poolRequestDetail.swap_fee, 2) : null}
            </p>
          </div>
        </div>
        <div className={cx('item-detail')}>
          <div className={cx('rowdetail')}>
            <p className={cx('title')}>Swap fee ratio(%)</p>
            <div className={cx('box')}>
              <div className={cx('box-left')}>
                <span>Velo admin: </span>
                <span>
                  {poolRequestDetail && poolRequestDetail.fee_ratio_velo
                    ? setDataPrecision(poolRequestDetail.fee_ratio_velo, 2)
                    : null}
                </span>
              </div>
              <div className={cx('box-right')}>
                <span>Liquidity provider: </span>
                <span>
                  {poolRequestDetail && poolRequestDetail.fee_ratio_lp
                    ? setDataPrecision(poolRequestDetail.fee_ratio_lp, 2)
                    : null}
                </span>
              </div>
            </div>
          </div>
        </div>
        {poolRequestDetail.type === PoolType.Flexible && (
          <div className={cx('item-detail')}>
            <div className={cx('rowdetail')}>
              <p className={cx('title')}>Rights</p>
              <ul>
                {poolRequestDetail?.flex_right_config &&
                  Object.entries(poolRequestDetail?.flex_right_config).map(
                    ([rightName, isRightSelected]) =>
                      isRightSelected && <li key={rightName}>{FLEXIBLE_POOL_RIGHTS[rightName]}</li>,
                  )}
              </ul>
            </div>
          </div>
        )}
        <div className={cx('item-detail')}>
          <div className={cx('rowdetail')}>
            <p className={cx('title')}>Admin message</p>
            <p className={cx('text')}>{poolRequestDetail?.message ? poolRequestDetail.message : null}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolRequestRejectDetail;
