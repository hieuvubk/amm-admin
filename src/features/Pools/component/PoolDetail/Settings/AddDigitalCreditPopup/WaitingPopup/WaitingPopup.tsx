import React from 'react';
import { CircularProgress, Dialog } from '@material-ui/core';
import classNames from 'classnames/bind';
import styles from './WaitingPopup.module.scss';
import { ReactComponent as CloseIcon } from 'src/assets/icon/close.svg';
import SuccessIcon from 'src/assets/icon/success.svg';
import { CButton } from 'src/components/Base/Button';
import { IsCommitted } from '../../../PoolDetail';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { setOpenConnectDialog } from 'src/features/ConnectWallet/redux/wallet';
import { getCrpController, isPoolTokensUpdate } from '../../helper/ultis';
import { Pool } from 'src/interfaces/pool';
import { applyAddToken } from '../helper/ultis';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import { getPoolDetail } from 'src/features/Pools/redux/apis';
import { isConnected } from 'src/features/ConnectWallet/helpers/connectWallet';
import { settingHistoryLog } from '../../helper/historyLog';
import { sleep } from 'src/helpers/share';

interface Props {
  open: boolean;
  handleClose: () => void;
  committedStatus: IsCommitted;
  pool: Pool;
  isLoading: boolean;
  handleCloseDialog: () => void;
  updateAddToken: () => void;
}

const cx = classNames.bind(styles);

const WaitingPopup: React.FC<Props> = ({
  open,
  handleClose,
  committedStatus,
  pool,
  isLoading,
  handleCloseDialog,
  updateAddToken,
}) => {
  const wallet = useAppSelector((state) => state.wallet);
  const [isWaiting, setIsWaiting] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const dispatch = useAppDispatch();

  setTimeout(() => setIsWaiting(false), isLoading ? 10000 : 0);

  const handleCloseWaitingDialog = () => {
    if (!isSubmitting) {
      handleClose();
      handleCloseDialog();
    }
  };

  const handleOpenConnectDialog = () => {
    dispatch(setOpenConnectDialog(true));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const crp = await getCrpController(pool.id, 'controller');
      const params = {
        crpAddress: crp,
        tokenAddress: committedStatus.param.tokenAddress,
        tokenAmountIn: committedStatus.param.tokenAmountIn,
        account: wallet.bsc,
      };
      await applyAddToken(params);
      await settingHistoryLog({
        pool_setting_name: 'Digital credits - Add digital credit',
        pool_id: pool.id,
        wallet: wallet.bsc,
      });

      let checkSubgraphData = await isPoolTokensUpdate(pool.id, pool.tokensList.length + 1);
      while (!checkSubgraphData) {
        await sleep(3000);
        checkSubgraphData = await isPoolTokensUpdate(pool.id, pool.tokensList.length + 1);
      }
      await dispatch(getPoolDetail(pool.id));
      await updateAddToken();
      setIsSubmitting(false);
      handleCloseDialog();
      dispatch(
        openSnackbar({
          message: 'Add digital credits successfully!',
          variant: SnackbarVariant.SUCCESS,
        }),
      );
    } catch (e) {
      dispatch(
        openSnackbar({
          message: 'Transaction Failed',
          variant: SnackbarVariant.ERROR,
        }),
      );
      setIsSubmitting(false);
    }
    handleClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" className={cx('dialog-root')} open={open} onClose={handleCloseWaitingDialog}>
      <div className={cx('dialog-header')}>
        <div></div>

        <div>Add digital credit</div>

        <CloseIcon onClick={handleCloseWaitingDialog} />
      </div>

      <div className={cx('dialog-body')}>
        {isWaiting ? (
          <>
            <CircularProgress size={66} />

            <div className={cx('under-svg')}>Please wait for a block to register the new digital credit.</div>
            <div>Then confirm again to add the new digital credit to pool.</div>
          </>
        ) : (
          <>
            <img src={SuccessIcon} />

            <div
              className={cx('under-svg')}
            >{`Register new digital credit ${committedStatus.token} successfully! Please confirm to add digital credit to pool.`}</div>
          </>
        )}
      </div>

      <div className={cx('dialog-actions')}>
        {!isConnected(wallet) && (
          <CButton type="primary" size="md" content="Connect Wallet" onClick={() => handleOpenConnectDialog} />
        )}
        {isConnected(wallet) && (
          <CButton
            type="primary"
            size="md"
            isDisabled={isWaiting}
            content="Confirm"
            isLoading={isSubmitting}
            onClick={() => handleSubmit()}
          />
        )}
      </div>
    </Dialog>
  );
};

export default WaitingPopup;
