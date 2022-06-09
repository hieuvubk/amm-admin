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
  leave?: boolean;
  handleConfirmLeave?: () => void;
}

const cx = classNames.bind(styles);

const WarningPopup: React.FC<Props> = ({ open, handleClose, leave = false, handleConfirmLeave }) => {
  return (
    <Dialog fullWidth maxWidth="xs" className={cx('dialog-root')} open={open} onClose={handleClose}>
      <div className={cx('dialog-header')}>
        <div></div>

        <div>Warning!</div>

        <CloseIcon onClick={handleClose} />
      </div>

      <div className={cx('dialog-body')}>
        <img src={warningIcon} />

        {!leave ? (
          <>
            <span>You can only process 100 wallet addresses at a time.</span>
            <span>Please choose less users.</span>
          </>
        ) : (
          <span>
            If you leave the paging without adding user to Segregated user list, Liquidity providers will be set back to
            All. Are you sure want to leave?
          </span>
        )}
      </div>

      {leave && (
        <div className={cx('dialog-actions')}>
          <CButton onClick={handleConfirmLeave} size="md" type="secondary" content="Leave anyway"></CButton>

          <CButton onClick={handleClose} size="md" type="primary" content="Stay"></CButton>
        </div>
      )}
    </Dialog>
  );
};

export default WarningPopup;
