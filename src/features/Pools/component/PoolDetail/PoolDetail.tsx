import React from 'react';
import classNames from 'classnames/bind';
import styles from 'src/features/Pools/styles/PoolDetail.module.scss';
import LinksBreadcrumbs from 'src/features/Admin/components/LinksBreadcrumbs';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { useHistory, useParams } from 'react-router-dom';
import { routeConstants } from 'src/constants';
import TabsSwitch from 'src/features/Pools/component/TabsSwitch';
import { FEE_TYPE, DetailTabs } from 'src/features/Pools/constants';
import { getPoolDetail } from 'src/features/Pools/redux/apis';
import { clearPoolsDetail } from 'src/features/Pools/redux/pool.slice';
import PoolOverview from 'src/features/Pools/component/PoolDetail/PoolOverview';
import BalancesTable from 'src/features/Pools/component/PoolDetail/BalancesTable';
import TransactionsTable from 'src/features/Pools/component/PoolDetail/TransactionsTable';
import PoolInfo from 'src/features/Pools/component/PoolDetail/PoolInfo';
import PoolGraph from 'src/features/Pools/component/PoolDetail/PoolGraph';
import Settings from 'src/features/Pools/component/PoolDetail/Settings';
import { getAddTokenName, getCrpController } from './Settings/helper/ultis';
import { getCurrentBlock, getGradualUpdateStatus } from './Settings/WeightChangePopup/helper/utils';
import { ReactComponent as WarningIcon } from 'src/assets/icon/warning.svg';
import moment from 'moment';
import Actions from 'src/features/Pools/component/PoolDetail/Actions';
import WaitingPopup from 'src/features/Pools/component/PoolDetail/Settings/AddDigitalCreditPopup/WaitingPopup';
import { getNewToken } from './Settings/AddDigitalCreditPopup/helper/ultis';
import CLoading from 'src/components/Loading';

const cx = classNames.bind(styles);

interface GraduallyTime {
  start: string;
  end: string;
}

export interface IsCommitted {
  status: boolean;
  token: string;
  param: {
    crpAddress: string;
    tokenAddress: string;
    tokenAmountIn: string;
  };
}

const defaultCommitStatus = {
  status: false,
  token: '',
  param: {
    crpAddress: '',
    tokenAddress: '',
    tokenAmountIn: '',
  },
};

const PoolDetail: React.FC = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const { poolId } = useParams<{ poolId: string }>();
  const currentPool = useAppSelector((state) => state.pool.current.data);
  const loading = useAppSelector((state) => state.pool.current.loadingData);
  const [currentTab, setCurrentTab] = React.useState(DetailTabs[0]);
  const [detailChartFullscreen, setDetailChartFullscreen] = React.useState(false);
  const [feeType, setFeeType] = React.useState(FEE_TYPE[0].value);
  const [isGradual, setIsGradual] = React.useState<boolean>(false);
  const [isCommitted, setIsCommitted] = React.useState<IsCommitted>(defaultCommitStatus);
  const [graduallyStatus, setGraduallyStatus] = React.useState<GraduallyTime>({ start: '', end: '' });
  const [openContinuePopup, setOpenContinuePopup] = React.useState(false);

  const setGraduallyTime = (start: string, end: string) => {
    setGraduallyStatus({
      start: start,
      end: end,
    });
    setIsGradual(!isGradual);
  };

  const formatBlockNumber = async (blockNumber: number) => {
    const block = await getCurrentBlock();
    const currentTimestamp = new Date().getTime();
    const delta = blockNumber - block;
    const blockDate = currentTimestamp + 3000 * delta;
    return moment(blockDate).format('DD/MM/YYYY HH:mm:ss');
  };

  const getGraduallyStatus = async () => {
    const crp = await getCrpController(poolId, 'controller');
    const status = await getGradualUpdateStatus(crp);
    const startTime = await formatBlockNumber(status.startBlock);
    const endTime = await formatBlockNumber(status.endBlock);
    const currentBlock = await getCurrentBlock();
    if (status.startBlock != 0 && currentBlock >= status.startBlock) {
      setGraduallyTime(startTime, endTime);
      setIsGradual(true);
    } else {
      setIsGradual(false);
    }
  };

  const getAddTokenStatus = async () => {
    if (currentPool.tokens.length) {
      const crp = await getCrpController(poolId, 'controller');
      const newToken = await getNewToken(crp);
      if (newToken) {
        const tokenSymbol = await getAddTokenName(newToken.addr);
        const params = {
          crpAddress: crp,
          tokenAddress: newToken.addr,
          tokenAmountIn: newToken.balance,
        };

        if (tokenSymbol) {
          setIsCommitted({
            status: newToken.isCommitted,
            token: tokenSymbol,
            param: params,
          });
        }
      }
    }
  };

  React.useEffect(() => {
    dispatch(getPoolDetail(poolId));
    if (currentPool && currentPool.id) {
      getAddTokenStatus().then();
      getGraduallyStatus().then();
    }
  }, [dispatch, currentPool?.id]);

  React.useEffect(() => {
    return () => {
      dispatch(clearPoolsDetail());
    };
  }, [dispatch]);

  const renderTab = (): JSX.Element => {
    switch (currentTab) {
      case DetailTabs[0]:
        return <BalancesTable tokens={currentPool.tokens} />;
      case DetailTabs[1]:
        return <TransactionsTable pool={currentPool} />;
      case DetailTabs[2]:
        return <PoolInfo pool={currentPool} totalSupply={currentPool.totalShares} />;
      case DetailTabs[3]:
        return (
          <Settings
            pool={currentPool}
            updateGraduallyStatus={getGraduallyStatus}
            isGradual={isGradual}
            updateAddToken={getAddTokenStatus}
            isCommitted={isCommitted.status}
          />
        );
      case DetailTabs[4]:
        return (
          <Actions
            pool={currentPool}
            updateGraduallyStatus={getGraduallyStatus}
            isGradual={isGradual}
            graduallyTime={graduallyStatus}
          />
        );
      default:
        return <div></div>;
    }
  };

  return (
    <div className={cx('pool-detail')}>
      {isGradual && (
        <div className={cx('warning')}>
          <WarningIcon />
          <div>{`The pool currently has a Gradual weight update from ${graduallyStatus.start} to ${graduallyStatus.end}`}</div>
        </div>
      )}

      {isCommitted && isCommitted.status && (
        <div className={cx('warning')}>
          <WarningIcon />
          <div>{`You haven’t finished adding new digital credit ${isCommitted.token} to this pool. Please continue `}</div>
          <span onClick={() => setOpenContinuePopup(true)}>here.</span>
        </div>
      )}

      {isCommitted && (
        <WaitingPopup
          open={openContinuePopup}
          handleClose={() => setOpenContinuePopup(false)}
          committedStatus={isCommitted}
          pool={currentPool}
          isLoading={false}
          handleCloseDialog={() => setOpenContinuePopup(false)}
          updateAddToken={getAddTokenStatus}
        />
      )}

      <LinksBreadcrumbs
        value={[
          {
            content: 'Liquidity pool',
            onClick: (): void => history.push(routeConstants.POOL_DASHBOARD),
          },
          {
            content: 'Pool dashboard',
            onClick: (): void => history.push(routeConstants.POOL_DASHBOARD),
          },
          {
            content: 'A pool detail',
          },
        ]}
      />

      <div className={cx('utilities-bar')}>
        <TabsSwitch
          type="switch"
          options={FEE_TYPE}
          defaultOption={FEE_TYPE[0]}
          onSelect={(selection) => setFeeType(selection.value)}
        />
      </div>

      <div className={cx('pool-overview')}>
        {currentPool?.id ? (
          <PoolOverview pool={currentPool} feeType={feeType} />
        ) : loading ? (
          <div className={cx('loading')}>
            <CLoading size="md" type="spin" />
          </div>
        ) : null}
      </div>

      <div className={cx(`detail-chart${detailChartFullscreen ? '-fullscreen' : ''}`)}>
        {currentPool?.id ? (
          <PoolGraph
            pool={currentPool}
            feeType={feeType}
            isFullScreen={detailChartFullscreen}
            onChangeFullScreen={() => setDetailChartFullscreen(!detailChartFullscreen)}
          />
        ) : loading ? (
          <div className={cx('loading')}>
            <CLoading size="md" type="spin" />
          </div>
        ) : null}
      </div>

      <div className={cx('more-detail')}>
        <TabsSwitch
          type="tab"
          options={currentPool.crp ? DetailTabs : DetailTabs.slice(0, 4)}
          defaultOption={currentTab}
          onSelect={(selection) => setCurrentTab(selection)}
          actionsNotification={isGradual}
        />

        <hr />

        {currentPool?.id ? (
          renderTab()
        ) : loading ? (
          <div className={cx('loading', 'tab-loading')}>
            <CLoading size="md" type="spin" />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PoolDetail;
