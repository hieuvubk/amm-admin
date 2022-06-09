import { makeStyles } from '@material-ui/core/styles';

const styles = makeStyles(() => ({
  alert: {
    '& .MuiDialog-paper': {
      padding: 30,

      '& .MuiDialogTitle-root': {
        color: 'var(--title-active)',
        textAlign: 'center',
        padding: 0,
        display: 'flex',
        flexFlow: 'row',
        alignItems: 'center',
        justifyContent: 'center',

        '& .MuiIconButton-root': {
          padding: 0,
          width: '32px',
          height: '32px',
          position: 'absolute',
          right: '30px',
          top: '30px',
          color: 'var(--body-text)',
        },
      },

      '& .MuiDialogContent-root': {
        margin: '30px 0',
        padding: 0,

        '& .MuiDialogContentText-root': {
          color: 'var(--title-active)',
          margin: 0,

          '& > p': {
            margin: 0,
          },

          '& > ul': {
            color: 'var(--body-text)',
            margin: 0,
            paddingLeft: '24px',
          },
        },
      },

      '& .MuiDialogActions-root': {
        justifyContent: 'center',
        padding: 0,

        '& > button': {
          padding: '12px 80px',
          borderRadius: 12,
        },

        '& > button:first-child': {
          color: 'var(--text-color)',
          border: '1px solid var(--text-color)',
        },
      },
    },
  },
}));

export default styles;
