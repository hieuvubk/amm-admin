import React from 'react';
import styles from './Notification.module.scss';
import classnames from 'classnames/bind';
import { THEME_MODE } from 'src/interfaces/theme';
import { Popover, Paper } from '@material-ui/core';
import UnreadNotiLightIcon from 'src/assets/icon/unread-noti-light.svg';
import UnreadNotiDarkIcon from 'src/assets/icon/unread-noti-dark.svg';
import dot_light from 'src/assets/icon/dot-light.svg';
import dot_dark from 'src/assets/icon/dot-dark.svg';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { Tooltip } from '@material-ui/core';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import InfiniteScroll from 'react-infinite-scroll-component';
import { INotification } from 'src/components/Navigation/interfaces';
import { readAllNotifications, readNotification } from 'src/components/Navigation/components/Notification/redux/apis';
import { NotificationType, tradingMethodOptions } from 'src/components/Navigation/components/Notification/constant';
import { setOneCookieStorage } from 'src/helpers/storage';
import { routeConstants } from 'src/constants';
import { renderFowardUrl } from 'src/components/Navigation/TopNav2';

const cx = classnames.bind(styles);

interface NotificationProps {
  notifications: Array<INotification>;
  initFetchListNotiPopup: () => void;
  fetchListNotiPopup: () => void;
  hasMore: boolean;
  open: boolean;
  refElm: HTMLButtonElement | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleClose: any;
  theme: THEME_MODE;
}

enum IS_READ {
  notRead = 0,
  read = 1,
}

const convertTime = (time: string) => {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
  const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  const minute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  const second = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
  return day + '/' + month + '/' + year + ' ' + hour + ':' + minute + ':' + second;
};

const Notification: React.FC<NotificationProps> = ({
  notifications,
  initFetchListNotiPopup,
  fetchListNotiPopup,
  hasMore,
  theme,
  open,
  refElm,
  handleClose,
}: NotificationProps) => {
  const dispatch = useAppDispatch();
  const countNotRead = useAppSelector((state) => state.notification.countNotRead);

  const seeNotificationDetail = async (noti: INotification) => {
    handleClose(null);

    await dispatch(
      readNotification({
        ids: [noti.id],
      }),
    );
    await initFetchListNotiPopup();
  };

  const getUrlNotificationDetail = (noti: INotification) => {
    switch (noti.type) {
      case NotificationType.PoolRequest:
        const poolRequestID = noti.data ? Number(JSON.parse(noti.data).poolId) : null;
        return `/user/account/notification/${noti.id}?poolId=${poolRequestID}`;
      case NotificationType.PoolSwapFee:
        return `/pools/${noti.data ? JSON.parse(noti.data).poolId : null}`;
      case NotificationType.Wallet:
      case NotificationType.Confidence:
        return `/user/account/setting`;
      case NotificationType.OrderBookTradingFee:
        const isStellar = noti.message.toLowerCase().includes('stellar');
        const isBSC = noti.message.toLowerCase().includes('bsc');

        if (isStellar) {
          setOneCookieStorage('trading_method', [tradingMethodOptions[0]]);
          return routeConstants.DASHBOARD;
        } else if (isBSC) {
          setOneCookieStorage('trading_method', [tradingMethodOptions[1]]);
          return routeConstants.DASHBOARD;
        }
        return '';
      default:
        return '';
    }
  };

  const handleMarkAllRead = async () => {
    handleClose(null);
    await dispatch(readAllNotifications());
    await initFetchListNotiPopup();
    dispatch(
      openSnackbar({
        message: 'Mark all as read',
        variant: SnackbarVariant.SUCCESS,
      }),
    );
  };

  return (
    <>
      <Popover
        open={open}
        anchorEl={refElm}
        onClose={handleClose}
        disableScrollLock
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        classes={{ paper: cx('notification-dropdown') }}
      >
        <Paper>
          <div className={cx('header')}>
            <div className={cx('unread-noti-wrapper')}>
              <div>
                <span className={cx('unread-number')}>{countNotRead}</span>{' '}
                <span className={cx('text')}>pending notifications</span>
              </div>
              <div className={cx('unread-noti-img')}>
                <Tooltip title={`Mark all as read`}>
                  <img
                    src={theme === THEME_MODE.LIGHT ? UnreadNotiLightIcon : UnreadNotiDarkIcon}
                    onClick={handleMarkAllRead}
                  />
                </Tooltip>
              </div>
            </div>
            {renderFowardUrl(
              <div
                className={cx('view-all')}
                onClick={() => {
                  handleClose(null);
                }}
              >
                View all
              </div>,
              { path: '/user/account/notification' },
            )}
          </div>
          <div id="notificationsScrollable" className={cx('notifications')}>
            <InfiniteScroll
              next={fetchListNotiPopup}
              hasMore={hasMore}
              dataLength={notifications?.length}
              scrollableTarget="notificationsScrollable"
              loader={
                <div className={cx('noti-wrapper')}>
                  <div className={cx('content-wrapper')}>
                    <div className={cx('content')}>Loading...</div>
                  </div>
                </div>
              }
            >
              {notifications?.length > 0 &&
                notifications?.map((noti) =>
                  renderFowardUrl(
                    <div className={cx('noti-wrapper')} key={noti.id} onClick={() => seeNotificationDetail(noti)}>
                      <div className={cx('content-wrapper')}>
                        <div className={cx('icon-wrapper')}>
                          {noti.is_read === IS_READ.notRead ? <img src={dot_light}></img> : <img src={dot_dark}></img>}
                        </div>
                        <div className={cx('content')}>{noti.message}</div>
                      </div>
                      <div className={cx('date')}>{convertTime(noti.created_at)}</div>
                    </div>,
                    { path: getUrlNotificationDetail(noti), key: String(noti.id) },
                  ),
                )}
            </InfiniteScroll>
          </div>
        </Paper>
      </Popover>
    </>
  );
};

export default Notification;
