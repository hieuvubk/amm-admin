/* eslint-disable max-len */
import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from 'src/features/User/styles/UserDetail.module.scss';
import LinksBreadcrumbs from 'src/features/Admin/components/LinksBreadcrumbs';
import DisableAlert from 'src/features/Admin/components/AdminDetail/DisableAlert';
import Switch from 'react-switch';
import { routeConstants } from 'src/constants';
import { useHistory, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { LOCKED_STATUS, WHITELIST_STATUS } from 'src/features/User/constants';
import Info from 'src/features/Admin/components/AdminDetail/Info';
import AccountSetting from 'src/features/User/components/UserDetail/AccountSetting';
import {
  getUserConnectedWallets,
  getUserCurrencies,
  getUserDetail,
  updateUserActivation,
  updateUserType,
  updateUserWalletStatus,
} from 'src/features/User/redux/apis';
import { clearCurrentUser } from 'src/features/User/redux/user.slice';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { IFilterUserWallet } from 'src/features/User/components/UserDetail/Constant';
import { checkAdmin } from 'src/features/wallet/FilterForm/WalletsHelper';
import {
  approveWalletApi,
  rejectWalletApi,
  revokedAddress,
  whiteListAddresses,
} from 'src/features/wallet/Wallets.slice';
import { STATUS } from 'src/features/wallet/Constant';
import { CButton } from 'src/components/Base/Button';
import WarningPopup from 'src/features/wallet/FilterForm/WarningPopup/WarningPopup';
import _ from 'lodash';

const cx = classNames.bind(styles);

const UserDetail: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const wallet = useAppSelector((state) => state.wallet);
  const { userId } = useParams<{ userId: string }>();
  const [filterUserWallet, setFilterUserWallet] = useState<IFilterUserWallet>({
    limit: 5,
    page: 1,
    user_id: Number(userId),
    status: [WHITELIST_STATUS.NONE, WHITELIST_STATUS.PENDING, WHITELIST_STATUS.REJECTED, WHITELIST_STATUS.WHITELISTED],
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [walletId, setWalletId] = useState<number>(0);
  const [userWallet, setUserWallet] = useState<string>('');
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [openReject, setOpenReject] = React.useState(false);
  const [detail, isLocked, userType, currencies, wallets] = useAppSelector((state) => [
    state.user.current.data,
    state.user.current.data.is_locked,
    state.user.current.data.user_type,
    state.user.currencies.data,
    state.user.wallets.data,
  ]);
  const [openAlert, setOpenAlert] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
  const [isRejecting, setIsRejecting] = React.useState<boolean>(false);
  const [isWhitelisting, setIsWhitelisting] = React.useState<boolean>(false);
  const [openWarningPopup, setOpenWarningPopup] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string>('');

  const getAdminRole = async () => {
    setIsAdmin(await checkAdmin(wallet.bsc));
  };

  React.useEffect(() => {
    setIsAdmin(false);
    if (wallet.bsc) {
      getAdminRole().then();
    }
  }, [wallet.bsc]);

  React.useEffect(() => {
    const getUserDetailFunc = async () => {
      const res = await dispatch(getUserDetail(Number(userId)));
      if (res.payload.code === 'NO_PERMISSION') history.push(routeConstants.NOT_FOUND);
    };
    getUserDetailFunc();

    dispatch(getUserCurrencies(Number(userId)));
    dispatch(getUserConnectedWallets(filterUserWallet));
  }, [dispatch, userId, filterUserWallet]);

  React.useEffect(() => {
    return () => {
      dispatch(clearCurrentUser());
    };
  }, [dispatch]);

  const handleAcceptAlert = async (): Promise<void> => {
    const result = await dispatch(
      updateUserActivation({
        usersId: [detail.id],
        is_locked: isLocked === LOCKED_STATUS.UNLOCKED ? LOCKED_STATUS.LOCKED : LOCKED_STATUS.UNLOCKED,
        adminEmail: currentUser.email,
      }),
    );

    if (updateUserActivation.fulfilled.match(result)) {
      if (isLocked === LOCKED_STATUS.LOCKED) {
        dispatch(
          openSnackbar({
            message: 'Activate user successfully',
            variant: SnackbarVariant.SUCCESS,
          }),
        );
      }
    }

    await dispatch(getUserDetail(Number(userId)));

    if (openAlert) setOpenAlert(() => !openAlert);
  };

  const handleSwitch = (): void => {
    if (isLocked === LOCKED_STATUS.UNLOCKED) setOpenAlert(() => !openAlert);
    else handleAcceptAlert();
  };

  const handleUpdateUserType = async (newUserType: number): Promise<void> => {
    if (!isAdmin) {
      setWarningMessage('Please connect to an admin address to change user type');
      setOpenWarningPopup(true);
      return;
    }
    if (newUserType !== userType) {
      const roles: { [address: string]: number } = {};
      wallets.map((wallet) => {
        if (wallet.network === 2) {
          roles[wallet.address] = newUserType;
        }
      });
      if (!_.isEmpty(roles)) {
        await whiteListAddresses(roles);
      }
      const result = await dispatch(
        updateUserType({
          usersId: [detail.id],
          user_type: newUserType,
        }),
      );

      if (updateUserType.fulfilled.match(result)) {
        dispatch(
          openSnackbar({
            message: 'User type has been updated successfully!',
            variant: SnackbarVariant.SUCCESS,
          }),
        );
      }

      await dispatch(getUserDetail(Number(userId)));
    }
  };

  const handleRejectWallet = async (walletId: number, userWallet: string): Promise<void> => {
    if (!isAdmin) {
      setWarningMessage('Please connect to an admin address to whitelist or reject user addresses');
      setOpenWarningPopup(true);
      return;
    }
    setOpenReject(true);
    setWalletId(walletId);
    setUserWallet(userWallet);
  };

  const submitRejectWallet = async (walletId: number, userWallet: string): Promise<void> => {
    setIsRejecting(true);
    try {
      const revoked = await revokedAddress([userWallet]);
      if (revoked) {
        await dispatch(
          rejectWalletApi({
            walletAddress: [userWallet],
            walletIds: [walletId],
            adminWallet: wallet.bsc,
            managerAdmin: false,
            walletStatus: STATUS.BLOCK,
          }),
        );
        dispatch(
          openSnackbar({
            message: 'Reject address successfully!',
            variant: SnackbarVariant.SUCCESS,
          }),
        );
        await dispatch(
          updateUserWalletStatus({
            ids: [walletId],
            status: WHITELIST_STATUS.REJECTED,
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
    setIsRejecting(false);
    setOpenReject(false);
    await dispatch(getUserConnectedWallets(filterUserWallet));
  };
  const handleCloseRejectWallet = () => {
    setOpenReject(false);
  };
  const handleWhitelistWallet = async (walletId: number, userWallet: string): Promise<void> => {
    if (!isAdmin) {
      setWarningMessage('Please connect to an admin address to whitelist or reject user addresses');
      setOpenWarningPopup(true);
      return;
    }
    setIsWhitelisting(true);
    try {
      await whiteListAddresses({ [userWallet]: userType });
      await dispatch(
        approveWalletApi({
          adminWallet: wallet.bsc,
          walletAddress: [userWallet],
          walletIds: [walletId],
          managerAdmin: false,
          walletStatus: STATUS.APPROVED,
        }),
      );
      dispatch(
        openSnackbar({
          message: 'The address has been whitelisted!',
          variant: SnackbarVariant.SUCCESS,
        }),
      );
      await dispatch(
        updateUserWalletStatus({
          ids: [walletId],
          status: WHITELIST_STATUS.WHITELISTED,
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
    setIsWhitelisting(false);
    await dispatch(getUserConnectedWallets(filterUserWallet));
  };

  const handlePaginationWallet = (page: number) => {
    setFilterUserWallet({ ...filterUserWallet, page: page });
  };

  return (
    <div className={cx('user-detail')}>
      <LinksBreadcrumbs
        value={[
          {
            content: 'Manage user',
            onClick: (): void => history.push(routeConstants.USERLIST),
          },
          {
            content: 'User list',
            onClick: (): void => history.push(routeConstants.USERLIST),
          },
          {
            content: 'A user detail',
          },
        ]}
      />
      <div className={cx('title-switch-container')}>
        <div className={cx('title')}>Basic info</div>

        <div className={cx('switch-containter')}>
          <span
            className={cx({
              'disable-label': isLocked === LOCKED_STATUS.UNLOCKED,
              'activate-label': isLocked === LOCKED_STATUS.LOCKED,
            })}
          >
            Disable user
          </span>
          <Switch
            className={cx('switch-btn')}
            checked={isLocked === LOCKED_STATUS.UNLOCKED}
            onChange={handleSwitch}
            uncheckedIcon={false}
            checkedIcon={false}
            height={28}
            width={52}
            onColor="#1A88C9"
            borderRadius={16}
          />
          <span
            className={cx({
              'disable-label': isLocked === LOCKED_STATUS.LOCKED,
              'activate-label': isLocked === LOCKED_STATUS.UNLOCKED,
            })}
          >
            Activate user
          </span>
        </div>
      </div>
      <Info {...detail} />
      <AccountSetting
        currencies={currencies}
        wallets={wallets}
        userType={userType}
        handleUpdateUserType={handleUpdateUserType}
        handleRejectWallet={handleRejectWallet}
        handleWhitelistWallet={handleWhitelistWallet}
        handlePaginationWallet={handlePaginationWallet}
        userId={userId}
        isRejecting={isRejecting}
        isWhitelisting={isWhitelisting}
        openReject={openReject}
      />

      <DisableAlert open={openAlert} handleAccept={handleAcceptAlert} handleClose={handleSwitch} />

      <Dialog
        open={openReject}
        onClose={handleCloseRejectWallet}
        style={{ pointerEvents: isRejecting || isWhitelisting ? 'none' : 'auto' }}
      >
        <div className={cx('dialog-container')}>
          <DialogTitle id="responsive-dialog-title" className={cx('reject-address-dialog__title')}>
            <p className={cx('title')}>Reject address</p>
            <Button onClick={handleCloseRejectWallet} className={cx('close-button')}>
              <CloseIcon />
            </Button>
          </DialogTitle>

          <DialogContent className={cx('reject-address__content')}>
            <span>Once you reject an address, it can not trade on FCX.</span>
            <br />
            <span>Are you sure want to reject this address?</span>
          </DialogContent>

          <DialogActions className={cx('btn-action')}>
            <CButton
              classNamePrefix={cx('btn-cancel')}
              onClick={handleCloseRejectWallet}
              size={'sm'}
              type={'primary'}
              content={'Cancel'}
            ></CButton>

            <CButton
              isLoading={isRejecting}
              classNamePrefix={cx('btn-reject')}
              onClick={() => submitRejectWallet(walletId, userWallet)}
              size={'sm'}
              type={'primary'}
              content={'Reject'}
            ></CButton>
          </DialogActions>
        </div>
      </Dialog>

      <WarningPopup
        open={openWarningPopup}
        handleClose={() => setOpenWarningPopup(!openWarningPopup)}
        message={warningMessage}
      />
    </div>
  );
};

export default UserDetail;
