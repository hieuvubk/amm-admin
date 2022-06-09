import { useDispatch } from 'react-redux';
import React, { forwardRef, Ref, useImperativeHandle } from 'react';
import { Button, Dialog } from '@material-ui/core';
import { useState } from 'react';
import CloseIcon from '@material-ui/icons/Close';
import classnames from 'classnames/bind';
import styles from 'src/features/wallet/FilterForm/BoxUp/BoxUp.module.scss';
import { rejectWalletApi, revokedAddress } from 'src/features/wallet/Wallets.slice';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
const cx = classnames.bind(styles);
import { useAppSelector } from 'src/store/hooks';
import { STATUS } from '../../Constant';
import { CButton } from 'src/components/Base/Button';

interface Props {
  status: boolean;
  ids: (number | undefined)[];
  handleRejectAddress: (v: boolean) => void;
  addresses: string[];
  cancelComponent: (v: boolean) => void;
  walletIds?: (number | undefined)[];
  managerAdmin?: boolean;
  selectAll?: (v: boolean) => void;
}
interface RefObject {
  openDialogReject: () => void;
}
const RejectWallet = (props: Props, ref: Ref<RefObject>) => {
  const [openReject, setOpenReject] = useState(props.status);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [reload, setReloadComponent] = useState(false);
  const walletBsc = useAppSelector((state) => state.wallet.bsc);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatch = useDispatch();
  const handleClose = () => {
    props.cancelComponent(true);
    setOpenReject(false);
  };
  useImperativeHandle(ref, () => ({
    openDialogReject: () => {
      setOpenReject(true);
    },
  }));
  const handleClickRejectAddress = async () => {
    setIsLoading(true);
    if (walletBsc) {
      try {
        const revoked = await revokedAddress(props.addresses);
        if (revoked) {
          await dispatch(
            rejectWalletApi({
              walletAddress: props.addresses,
              walletIds: props.ids,
              adminWallet: walletBsc,
              managerAdmin: props.managerAdmin,
              walletStatus: STATUS.BLOCK,
            }),
          );
          dispatch(
            openSnackbar({
              message: 'Reject address successfully!',
              variant: SnackbarVariant.SUCCESS,
            }),
          );
        }
      } catch (err) {
        dispatch(
          openSnackbar({
            message: 'Reject address failed!',
            variant: SnackbarVariant.ERROR,
          }),
        );
      }
    } else {
      dispatch(
        openSnackbar({
          message: 'No wallet connected!',
          variant: SnackbarVariant.ERROR,
        }),
      );
    }
    setIsLoading(false);
    setOpenReject(false);
    if (props.selectAll) {
      props.selectAll(false);
    }
    props.handleRejectAddress(!reload);
  };
  return (
    <Dialog open={openReject} onClose={handleClose}>
      <div className={cx('dialog-container')}>
        <Button onClick={handleClose} className={cx('close-button')}>
          <CloseIcon />
        </Button>
        <div className={cx('box_up')}>
          <span className={cx('title')}>Reject address</span>
          <span className={cx('text-content')}>Are you sure want to reject chosen addresses?</span>
          <div className={cx('box-address')}>
            <CButton
              classNamePrefix={cx('btn-cancel')}
              onClick={handleClose}
              size={'sm'}
              type={'primary'}
              content={'Cancel'}
            ></CButton>
            <CButton
              isLoading={isLoading}
              onClick={() => handleClickRejectAddress()}
              classNamePrefix={cx('btn-reject')}
              size={'sm'}
              type={'primary'}
              content={'Reject'}
            >
              Reject
            </CButton>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
export default forwardRef(RejectWallet);
