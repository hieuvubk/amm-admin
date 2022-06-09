import { makeStyles } from '@material-ui/core/styles';

export const stylesRegistration = makeStyles((theme) => ({
  filterForm: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    '& > div': {
      paddingTop: 20,
      display: 'flex',
      alignItems: 'center',
      marginRight: theme.spacing(3),
      '& .Mui-focused': {
        border: '#1a88c9',
      },
      '& .MuiFormLabel-root': {
        fontSize: 14,
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
    },
  },
  option: {},
}));
