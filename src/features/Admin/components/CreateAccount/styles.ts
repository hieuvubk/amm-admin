import { makeStyles } from '@material-ui/core/styles';

const styles = makeStyles(() => ({
  form: {
    '& > .MuiFormControl-root': {
      '& label': {
        marginTop: 10,
        marginBottom: 10,
        fontSize: 16,
        fontWeight: 500,
        lineHeight: '20px',
        color: 'var(--color-body)',
      },
    },

    '& .MuiInputBase-input': {
      background: 'var(--color-order-input-bg) !important',
      border: '1px solid var(--filter-input-border)',
      borderRadius: 10,
      color: 'var(--placeholder)',
    },

    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  },
  wallets: {
    display: 'flex',
    alignItems: 'flex-start',
    '& > .MuiFormControl-root': {
      width: '100%',
    },

    '& button': {
      marginTop: '12px',
      marginLeft: '10px',
      width: '20px !important',
      height: '20px !important',
      minWidth: '0 !important',
      borderRadius: '5px !important',
      color: 'var(--color-bg) !important',
    },
    '& .add-btn': {
      background: 'var(--color-success) !important',
    },
    '& .clear-btn': {
      background: 'var(--color-error) !important',
    },
  },
  button: {
    background: 'var(--primary-button-bg)',
    marginTop: 30,
    minHeight: 44,
    height: 50,
    padding: '12px 36px',
    display: 'flex',
    alignSelf: 'flex-start',
    borderRadius: 12,

    '& .MuiButton-label': {
      fontWeight: 500,
      fontSize: 16,
      lineHeight: '20px',
      textTransform: 'none',
      maxWidth: '185px',
      width: '170px',
    },
  },
}));

export default styles;
