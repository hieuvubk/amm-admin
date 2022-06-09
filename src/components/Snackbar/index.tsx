import { Fade } from '@material-ui/core';
import Snackbar from '@material-ui/core/Snackbar';
import React from 'react';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { closeSnackbar, openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import store from 'src/store/store';
import './style.scss';

export const setSnackbarSuccess = (message: string): void => {
  store.dispatch(
    openSnackbar({
      message,
      variant: SnackbarVariant.SUCCESS,
    }),
  );
};

export const setSnackbarError = (message: string): void => {
  store.dispatch(
    openSnackbar({
      message,
      variant: SnackbarVariant.ERROR,
    }),
  );
};

const CustomSnackbar: React.FC = () => {
  const snackbar = useAppSelector((state) => state.snackbar);
  const dispatch = useAppDispatch();
  const handleClose = () => {
    dispatch(closeSnackbar());
  };
  return (
    <div>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={snackbar.isOpen}
        autoHideDuration={7000}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        <div className={`snackbar color-${snackbar.variant}`}>{snackbar.message}</div>
      </Snackbar>
    </div>
  );
};

export default CustomSnackbar;
