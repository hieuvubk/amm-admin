import { makeStyles } from '@material-ui/core/styles';

const styles = makeStyles(() => ({
  form: {
    '& .MuiTextField-root, .MuiInputBase-input': {
      background: 'var(--filter-input-background) !important',
    },

    '& .MuiInputBase-input': {
      padding: '0 16px !important',
      height: '34px',
    },

    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },

    '& .MuiFormControlLabel-root': {
      margin: 0,
    },

    '& .MuiFormControlLabel-root:first-child': {
      marginBottom: '16px',
    },

    '& .MuiIconButton-root': {
      padding: 0,
    },

    '& .MuiFormControlLabel-label': {
      marginLeft: '8px',
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontSize: '16px',
      lineHeight: '20px',
      color: 'var(--color-body)',
    },

    '& .MuiButton-text': {
      padding: 0,
    },
  },
}));

export default styles;
