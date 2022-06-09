import { makeStyles } from '@material-ui/core/styles';

export const stylesFilter = makeStyles((theme) => ({
  filterForm: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    '& > div': {
      paddingTop: 20,
      display: 'flex',
      alignItems: 'center',
      marginRight: theme.spacing(4),

      '& .Mui-focused': {
        border: '#1a88c9',
      },
      '& .MuiButton-root:hover': {
        background: 'var(--input-background);',
      },
      '& .MuiFormLabel-root': {
        marginRight: theme.spacing(2),
      },
      '& .theme-select__control': {
        borderRadius: '10px !important',
        '& .theme-select__value-container': {
          paddingLeft: theme.spacing(1),
        },
      },
      '& .MuiAutocomplete-endAdornment': {
        display: 'none',
      },
      '& .MuiInputBase-root': {
        height: 38,
        paddingRight: '9px !important',
        minWidth: 180,
        '& .MuiInputBase-input': {
          padding: 0,
        },
      },

      '& > div': {
        height: '36px',
      },
    },
    'div.:nth-child(3)': {
      marginRight: '0 !important',
    },
  },
  option: {},
}));
