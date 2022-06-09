import React, { useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Actions.module.scss';
import { CButton } from 'src/components/Base/Button';
import { Pool } from 'src/interfaces/pool';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { setOpenConnectDialog } from 'src/features/ConnectWallet/redux/wallet';
import { isConnected } from 'src/features/ConnectWallet/helpers/connectWallet';
import { getCrpController, getCurrentBlock, pokeWeights } from '../Settings/WeightChangePopup/helper/utils';
import { getPoolDetail } from 'src/features/Pools/redux/apis';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import TokenIcon from 'src/helpers/coinHelper/TokenIcon';
import { deleteGraduallyStatus, getGraduallyStatus } from './helper';
import { settingHistoryLog } from '../Settings/helper/historyLog';
import { sleep } from 'src/helpers/share';

const cx = classNames.bind(styles);

interface GraduallyTime {
  start: string;
  end: string;
}
interface Props {
  pool: Pool;
  updateGraduallyStatus: () => void;
  isGradual: boolean;
  graduallyTime: GraduallyTime;
}

interface GraduallyParams {
  poolAddress: string;
  startBlock: number;
  endBlock: number;
  oldWeights: string[];
  newWeights: string[];
}

interface TokenWeightPercent {
  oldWeight: string;
  currentWeight: string;
  newWeight: string;
}

interface WeightsPercent {
  [address: string]: TokenWeightPercent;
}

const Actions: React.FC<Props> = ({ pool, updateGraduallyStatus, isGradual, graduallyTime }) => {
  const wallet = useAppSelector((state) => state.wallet);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [graduallyStatus, setGraduallyStatus] = React.useState<GraduallyParams>();
  const [tokensWeights] = React.useState<WeightsPercent>({});
  const [canShowTable, setCanShowTable] = React.useState<boolean>(false);
  const dispatch = useAppDispatch();

  const handleOpenConnectDialog = () => {
    dispatch(setOpenConnectDialog(true));
  };

  const getGradualStatus = async () => {
    if (isGradual) {
      const params = await getGraduallyStatus(pool.id);
      if (params) {
        const newWeights = params.new_weights.split(',');
        const oldWeights = params.old_weights.split(',');
        setGraduallyStatus({
          poolAddress: params.pool_address,
          startBlock: params.start_block,
          endBlock: params.end_block,
          oldWeights: oldWeights,
          newWeights: newWeights,
        });
      }
    }
  };

  const removeGradual = async () => {
    const currentBlock = await getCurrentBlock();
    if (graduallyStatus && graduallyStatus.endBlock < currentBlock) {
      await deleteGraduallyStatus(pool.id);
    }
  };

  const calculateWeights = async () => {
    if (graduallyStatus) {
      let totalOldWeights = 0;
      let totalNewWeights = 0;
      let totalCurrentWeight = 0;

      let currentBlock = await getCurrentBlock();
      if (currentBlock > graduallyStatus.endBlock) {
        currentBlock = graduallyStatus.endBlock;
      }
      const currentWeights: Array<number> = [];
      const blockPeriod = graduallyStatus.endBlock - graduallyStatus.startBlock;
      const blocksElapsed = currentBlock - graduallyStatus.startBlock;

      pool.tokensList.map((tokenAddress, index) => {
        totalOldWeights += Number(graduallyStatus?.oldWeights[index]);
        totalNewWeights += Number(graduallyStatus.newWeights[index]);

        if (graduallyStatus.newWeights < graduallyStatus.oldWeights) {
          const weightDelta = Number(graduallyStatus.oldWeights[index]) - Number(graduallyStatus.newWeights[index]);
          const deltaPerBlock = weightDelta / blockPeriod;
          const currentWeight = Number(graduallyStatus.oldWeights[index]) - deltaPerBlock * blocksElapsed;
          totalCurrentWeight += currentWeight;
          currentWeights.push(currentWeight);
        } else {
          const weightDelta = Number(graduallyStatus.newWeights[index]) - Number(graduallyStatus.oldWeights[index]);
          const deltaPerBlock = weightDelta / blockPeriod;
          const currentWeight = Number(graduallyStatus.oldWeights[index]) + deltaPerBlock * blocksElapsed;
          totalCurrentWeight += currentWeight;
          currentWeights.push(currentWeight);
        }
      });

      pool.tokensList.map((tokenAddress, index) => {
        const oldPercent = ((Number(graduallyStatus?.oldWeights[index]) / totalOldWeights) * 100).toFixed(2);
        const newPercent = ((Number(graduallyStatus.newWeights[index]) / totalNewWeights) * 100).toFixed(2);
        const currentPercent = ((currentWeights[index] / totalCurrentWeight) * 100).toFixed(2);
        tokensWeights[tokenAddress] = {
          oldWeight: oldPercent,
          currentWeight: currentPercent,
          newWeight: newPercent,
        };
      });
      setCanShowTable(true);
    }
  };

  useEffect(() => {
    calculateWeights().then();
  }, [graduallyStatus]);

  useEffect(() => {
    if (pool.id) {
      getGradualStatus().then();
    }
  }, [pool.id]);

  const pokeWeight = async () => {
    setIsLoading(true);
    try {
      const controller = await getCrpController(pool.id, 'controller');
      await pokeWeights(controller, wallet.bsc);
      await settingHistoryLog({
        pool_setting_name: 'Digital credits - Poke Weight',
        pool_id: pool.id,
        wallet: wallet.bsc,
      });
      await calculateWeights();
      await removeGradual();
      await updateGraduallyStatus();
      dispatch(
        openSnackbar({
          message: 'Update weight successfully',
          variant: SnackbarVariant.SUCCESS,
        }),
      );
      await sleep(1000);
      await dispatch(getPoolDetail(pool.id));
    } catch (e) {
      if (e.code == 4001) {
        dispatch(
          openSnackbar({
            message: 'Transaction rejected',
            variant: SnackbarVariant.ERROR,
          }),
        );
      }
    }

    setIsLoading(false);
  };

  return (
    <div className={cx('pool-actions')}>
      <div className={cx('gradual-weight-change')}>
        <div className={cx('action-body')}>
          <div className={cx('header')}>Gradual weight change</div>

          <div className={cx('description')}>
            {isGradual
              ? `The pool currently has an ongoing gradual weight update from ${graduallyTime.start} to ${graduallyTime.end}. 'Poke weight' action will set the weights to values along the update curve, corresponding to the current block.`
              : `The pool does not currently have an ongoing gradual weight update. If it did, 'Poke' would set the weights to values along the update curve, corresponding to the current block.`}
          </div>

          {isGradual && canShowTable && (
            <div className={cx('weight-change-table')}>
              <div className={cx('header')}>
                <div>Digital credits</div>
                <div>Old weight</div>
                <div>Current weight</div>
                <div>New weight</div>
              </div>

              {pool.tokens.map((token, index) => {
                return (
                  <div key={index} className={cx('row')}>
                    <div>
                      <TokenIcon name={token.symbol} size="16" />
                      <div>{token.symbol}</div>
                    </div>
                    <div>{tokensWeights[token.address].oldWeight}%</div>
                    <div>{tokensWeights[token.address].currentWeight}%</div>
                    <div>{tokensWeights[token.address].newWeight}%</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={cx('action-buttons')}>
          {!isConnected(wallet) && (
            <CButton size="sm" type="primary" content="Connect Wallet" onClick={handleOpenConnectDialog} />
          )}

          {isConnected(wallet) && (
            <CButton
              size="sm"
              type="primary"
              content="Poke weight"
              onClick={pokeWeight}
              isDisabled={!isGradual}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Actions;
