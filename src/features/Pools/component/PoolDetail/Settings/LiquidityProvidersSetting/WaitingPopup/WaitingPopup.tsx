import React from 'react';
import { CircularProgress, Dialog } from '@material-ui/core';
import classNames from 'classnames/bind';
import styles from './WaitingPopup.module.scss';
import { ReactComponent as CloseIcon } from 'src/assets/icon/close.svg';
import SuccessIcon from 'src/assets/icon/success.svg';

interface Props {
  open: boolean;
  isWaiting: boolean;
  handleClose: () => void;
}

const cx = classNames.bind(styles);

const WaitingPopup: React.FC<Props> = ({ open, isWaiting, handleClose }) => {
  const handleCloseWaitingPopup = () => {
    if (!isWaiting) {
      handleClose();
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" className={cx('dialog-root')} open={open} onClose={handleCloseWaitingPopup}>
      <div className={cx('dialog-header')}>
        <div></div>

        <div>Change Liquidity provider setting</div>

        {!isWaiting ? <CloseIcon onClick={handleCloseWaitingPopup} /> : <div></div>}
      </div>

      <div className={cx('dialog-body')}>
        {isWaiting ? (
          <>
            <div className={cx('loading')}>
              <CircularProgress size={66} color="inherit" />
            </div>

            <div className={cx('under-svg')}>Please wait a moment.</div>
          </>
        ) : (
          <>
            <img src={SuccessIcon} />
            <div className={cx('under-svg')}>The Liquidity provider setting has been changed successfully!</div>
          </>
        )}
      </div>
    </Dialog>
  );
};

export default WaitingPopup;
