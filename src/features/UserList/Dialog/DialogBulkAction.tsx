import React, { forwardRef, Ref, useImperativeHandle } from 'react';
import { Button, Dialog } from '@material-ui/core';
import { useState } from 'react';
import CloseIcon from '@material-ui/icons/Close';
import classnames from 'classnames/bind';
import styles from './Dialog.module.scss';
import { CSelect } from 'src/components/Base/Select';
import { ISelect } from 'src/components/Base/Select/Select';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { CButton } from 'src/components/Base/Button';
const cx = classnames.bind(styles);
interface Props {
  status: boolean;
  ids?: (number | undefined)[];
  handleAction?: (type: number) => void;
  title: string;
  options: ISelect[];
}

interface RefObject {
  openDialog: () => void;
}

const DialogBulkAction = (props: Props, ref: Ref<RefObject>) => {
  const [open, setOpen] = useState(props.status);
  const [option, setUserType] = useState(props.options[0].value);

  useImperativeHandle(ref, () => ({
    openDialog: () => {
      setOpen(true);
    },
  }));

  const handleClose = () => {
    setOpen(false);
    setUserType(props.options[0].value);
  };

  const handleAction = () => {
    if (props.handleAction) {
      props.handleAction(option);
    }
    setOpen(false);
    setUserType(props.options[0].value);
  };
  return (
    <Dialog open={open} onClose={handleClose}>
      <div>
        <DialogTitle id="responsive-dialog-title" className={cx('title-user')}>
          <p className={cx('title-user')}>{props.title}</p>
          <Button onClick={handleClose} className={cx('close-button')}>
            <CloseIcon />
          </Button>
        </DialogTitle>
        <DialogContent className={cx('modal-content')}>
          <CSelect
            className={cx('status-select')}
            options={props.options}
            value={{
              value: option,
              label: props.options.filter((e) => e.value === option)[0].label,
            }}
            onChange={(value) => setUserType(value)}
          />
        </DialogContent>
        <DialogActions>
          <div className={cx('btn-action')}>
            <CButton
              classNamePrefix={cx('btn-cancel')}
              onClick={handleClose}
              size="sm"
              fullWidth
              type="primary"
              content="Cancel"
            />
            <CButton
              classNamePrefix={cx('btn-approve')}
              onClick={handleAction}
              size="sm"
              fullWidth
              type="primary"
              content="Save changes"
            />
          </div>
        </DialogActions>
      </div>
    </Dialog>
  );
};

export default forwardRef(DialogBulkAction);
