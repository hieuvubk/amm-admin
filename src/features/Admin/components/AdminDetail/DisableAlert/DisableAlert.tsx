import React from 'react';
import { CButton } from 'src/components/Base/Button/';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import styles from './styles';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import MuiDialogTitle from '@material-ui/core/DialogTitle';

interface AlertProps {
  open: boolean;
  handleAccept: () => void;
  handleClose: () => void;
}

const DisableAlert: React.FC<AlertProps> = (props) => {
  const [open, setOpen] = React.useState(false);
  const classes = styles();

  React.useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  return (
    <div>
      <Dialog
        open={open}
        onClose={props.handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
        maxWidth="sm"
        className={classes.alert}
      >
        <MuiDialogTitle disableTypography id="alert-dialog-title">
          <Typography variant="h6">{'Disable user'}</Typography>

          <IconButton aria-label="close" onClick={props.handleClose}>
            <CloseIcon />
          </IconButton>
        </MuiDialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <span>Once you disable an user, the following things will happen:</span>
            <ul>
              <li>This user will receive an email from the system about the account being disable.</li>
              <li>This user will not be able to log in and trade on FCX until an Admin enables the account again.</li>
            </ul>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <CButton onClick={props.handleClose} size="md" type="secondary" content="Cancel"></CButton>

          <CButton onClick={props.handleAccept} size="md" type="error" content="Disable"></CButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DisableAlert;
