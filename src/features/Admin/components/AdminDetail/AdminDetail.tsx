/* eslint-disable max-len */
import React from 'react';
import classNames from 'classnames/bind';
import { useHistory, useParams } from 'react-router-dom';
import Switch from 'react-switch';
import { routeConstants } from 'src/constants';
import Activities from 'src/features/Admin/components/AdminDetail/Activities';
import Info from 'src/features/Admin/components/AdminDetail/Info';
import { getAdminDetail, updateAdminActivation } from 'src/features/Admin/redux/apis';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import DisableAlert from './DisableAlert';
import styles from 'src/features/Admin/styles/AdminDetail.module.scss';
import LinksBreadcrumbs from 'src/features/Admin/components/LinksBreadcrumbs';
import { LOCKED_STATUS } from 'src/features/Admin/contants';
import { clearCurrentAdmin } from 'src/features/Admin/redux/admin.slice';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';

const cx = classNames.bind(styles);

const AdminDetail: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { adminId } = useParams<{ adminId: string }>();
  const [detail, isLocked] = useAppSelector((state) => [state.admin.current.data, state.admin.current.data.is_locked]);
  const [openAlert, setOpenAlert] = React.useState(false);
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  React.useEffect(() => {
    dispatch(getAdminDetail(Number(adminId)));
  }, [adminId, dispatch]);

  React.useEffect(() => {
    return () => {
      dispatch(clearCurrentAdmin());
    };
  }, [dispatch]);

  const handleAcceptAlert = async (): Promise<void> => {
    const result = await dispatch(
      updateAdminActivation({
        usersId: [detail.id],
        is_locked: isLocked === LOCKED_STATUS.UNLOCKED ? LOCKED_STATUS.LOCKED : LOCKED_STATUS.UNLOCKED,
        adminEmail: currentUser.email,
      }),
    );

    if (updateAdminActivation.fulfilled.match(result)) {
      if (isLocked === LOCKED_STATUS.LOCKED) {
        dispatch(openSnackbar({ message: 'Activate admin successfully', variant: SnackbarVariant.SUCCESS }));
      }
    }

    await dispatch(getAdminDetail(Number(adminId)));

    if (openAlert) setOpenAlert(() => !openAlert);
  };

  const handleSwitch = (): void => {
    if (isLocked === LOCKED_STATUS.UNLOCKED) setOpenAlert(() => !openAlert);
    else {
      handleAcceptAlert();
    }
  };

  return (
    <div className={cx('admin-detail')}>
      <LinksBreadcrumbs
        value={[
          {
            content: 'Manage admin',
            onClick: (): void => history.push(routeConstants.ADMIN_LIST),
          },
          {
            content: 'Admin detail',
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

      <Activities />

      <DisableAlert open={openAlert} handleAccept={handleAcceptAlert} handleClose={handleSwitch} />
    </div>
  );
};

export default AdminDetail;
