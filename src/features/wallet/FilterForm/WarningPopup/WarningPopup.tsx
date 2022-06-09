import React from 'react';
import { Dialog } from '@material-ui/core';
import classNames from 'classnames/bind';
import styles from './WarningPopup.module.scss';
import { ReactComponent as CloseIcon } from 'src/assets/icon/close.svg';
import warningIcon from 'src/assets/icon/warning.svg';

interface Props {
  open: boolean;
  handleClose: () => void;
  message: string;
}

const cx = classNames.bind(styles);

const WarningPopup: React.FC<Props> = ({ open, handleClose, message }) => {
  return (
    <Dialog fullWidth maxWidth="xs" className={cx('dialog-root')} open={open} onClose={handleClose}>
      <div className={cx('dialog-header')}>
        <div></div>
        <div>Warning!</div>
        <CloseIcon onClick={handleClose} />
      </div>

      <div className={cx('dialog-body')}>
        <img src={warningIcon} />
        <span>{message}</span>
      </div>
    </Dialog>
  );
};

export default WarningPopup;
