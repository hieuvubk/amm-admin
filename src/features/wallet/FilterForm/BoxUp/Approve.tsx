import { Button, Dialog } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import classnames from 'classnames/bind';
import React, { forwardRef, Ref, useImperativeHandle, useState } from 'react';
import { useDispatch } from 'react-redux';
import { CButton } from 'src/components/Base/Button';
import styles from 'src/features/wallet/FilterForm/BoxUp/BoxUp.module.scss';
import { approveWalletApi, whiteListAddresses } from 'src/features/wallet/Wallets.slice';
import { useAppSelector } from 'src/store/hooks';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import { STATUS } from 'src/features/wallet/Constant';
const cx = classnames.bind(styles);
interface Props {
  status: boolean;
  ids: (number | undefined)[];
  handleRejectAddress: (v: boolean) => void;
  addresses: string[];
  cancelComponent: (v: boolean) => void;
  walletIds?: (number | undefined)[];
  managerAdmin: boolean;
  roles: { [address: string]: number };
  selectAll?: (v: boolean) => void;
}
interface RefObject {
  openDialogApprove: () => void;
}
const ApproveWallet = (props: Props, ref: Ref<RefObject>) => {
  const [open, setOpen] = useState(props.status);
  const dispatch = useDispatch();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [reload, setReloadComponent] = useState(false);
  const [cancel] = useState(false);
  const walletBsc = useAppSelector((state) => state.wallet.bsc);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleClose = () => {
    props.cancelComponent(!cancel);
    setOpen(false);
  };
  useImperativeHandle(ref, () => ({
    openDialogApprove: () => {
      setOpen(true);
    },
  }));
  const handleApproveAddress = async () => {
    setIsLoading(true);
    if (walletBsc) {
      try {
        await whiteListAddresses(props.roles);
        await dispatch(
          approveWalletApi({
            adminWallet: walletBsc,
            walletAddress: props.addresses,
            walletIds: props.ids,
            managerAdmin: props.managerAdmin,
            walletStatus: STATUS.APPROVED,
          }),
        );
        dispatch(
          openSnackbar({
            message: 'Whitelist addresses successfully!',
            variant: SnackbarVariant.SUCCESS,
          }),
        );
      } catch (err) {
        dispatch(
          openSnackbar({
            message: 'Error whitelist address!',
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
    setOpen(false);
    if (props.selectAll) {
      props.selectAll(false);
    }
    props.handleRejectAddress(!reload);
  };
  return (
    <Dialog open={open} onClose={handleClose}>
      <div className={cx('dialog-container')}>
        <Button onClick={handleClose} className={cx('close-button')}>
          <CloseIcon />
        </Button>
        <div className={cx('box_up')}>
          <span className={cx('title')}>Whitelist address</span>
          <span className={cx('text-content')}>Are you sure want to whitelist chosen addresses?</span>
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
              onClick={handleApproveAddress}
              classNamePrefix={cx('btn-reject')}
              size={'sm'}
              type={'primary'}
              content={'Whitelist'}
            ></CButton>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default forwardRef(ApproveWallet);
