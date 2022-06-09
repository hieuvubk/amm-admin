import React from 'react';
import { Dialog } from '@material-ui/core';
import classNames from 'classnames/bind';
import styles from './WarningPopup.module.scss';
import { ReactComponent as CloseIcon } from 'src/assets/icon/close.svg';
import warningIcon from 'src/assets/icon/warning.svg';
import { CButton } from 'src/components/Base/Button';

interface Props {
  open: boolean;
  handleClose: () => void;
  message: string;
  finalizedAdd?: boolean;
}

const cx = classNames.bind(styles);

const WarningPopup: React.FC<Props> = ({ open, handleClose, message, finalizedAdd = false }) => {
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

      {finalizedAdd && (
        <div className={cx('dialog-actions')}>
          <CButton onClick={handleClose} size="md" type="secondary" content="Add digital credit"></CButton>

          <CButton onClick={handleClose} size="md" type="primary" content="Cancel"></CButton>
        </div>
      )}
    </Dialog>
  );
};

export default WarningPopup;
