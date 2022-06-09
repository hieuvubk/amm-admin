import { makeStyles } from '@material-ui/core/styles';

const styles = makeStyles(() => ({
  select: {
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },

    '& .theme-select__control': {
      minHeight: '44px',
      borderRadius: '10px !important',
      border: '1px solid var(--color-line) !important',
      boxShadow: 'none',
      transition: 'none',
    },

    '& .theme-select__placeholder': {
      color: 'var(--color-body) !important',
      fontWeight: 'normal !important',
      fontSize: '16px !important',
      lineHeight: '20px !important',
    },

    '& .theme-select__menu': {
      borderRadius: '10px !important',
      overflow: 'hidden',
      marginTop: '5px !important',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15) !important',

      '& div[class^="SelectField_options"]': {
        margin: 0,
        borderRadius: '0px 0px 10px 10px',
        overflow: 'hidden',
      },
    },

    '& .theme-select__option': {
      height: 44,
      borderRadius: 0,
      padding: '12px 27px',
      fontWeight: 'normal',
      fontSize: '16px',
      lineHeight: '20px',
      color: 'var(--title-active) !important',

      '&:hover': {
        background: '#ccc !important',
        color: 'var(--title-active) !important',
      },

      '&:focus': {
        background: 'var(--color-input-bg) !important',
        color: 'var(--title-active) !important',
      },
    },

    '& .theme-select__multi-value': {
      borderRadius: '10px !important',
    },
  },
}));

export default styles;
