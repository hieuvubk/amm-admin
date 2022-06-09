import { makeStyles } from '@material-ui/core/styles';

const styles = makeStyles(() => ({
  searchField: {
    '& > .MuiFormControl-root': {
      height: '36px',
      width: '340px',

      '& .MuiInputBase-root': {
        padding: '0 0 0 16px',
        background: 'var(--filter-input-background)',
        border: '1px solid var(--filter-input-border)',
        borderRadius: 10,
        overflow: 'hidden',

        '& .MuiInputBase-input': {
          background: 'var(--filter-input-background)',
          color: 'var(--placeholder)',
          fontSize: '14px',
          fontWeight: 'normal',
          lineHeight: '20px',
          fontFamily: 'Roboto',
          padding: 0,
          height: '34px',
        },

        '& .MuiOutlinedInput-notchedOutline': {
          border: 'none',
        },
      },

      '& .Mui-focused': {
        border: '1px solid var(--color-primary)',
      },
    },
  },
  textField: {
    '& input::placeholder': {
      color: 'var(--placeholder)',
      fontSize: '14px',
      fontWeight: 'normal',
      lineHeight: '20px',
      fontFamily: 'Roboto',
      opacity: '1',
    },
    '& input:focus': {
      color: 'var(--title-active) !important',
      fontSize: '14px',
      fontWeight: 'normal',
      lineHeight: '20px',
      fontFamily: 'Roboto',
    },
  },
  option: {
    '& > div': {
      marginLeft: '10px',
      fontWeight: '500',
      fontSize: '16px',
      lineHeight: '20px',
      color: 'var(--title-active)',
    },
  },
  noOptions: {
    color: 'var(--title-active)',
  },
}));

export default styles;
