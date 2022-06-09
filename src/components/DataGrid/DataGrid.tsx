import { withStyles } from '@material-ui/core';
import { DataGrid, GridOverlay } from '@material-ui/data-grid';
import React from 'react';
import CLoading from 'src/components/Loading';

const CDataGrid = withStyles(() => ({
  root: {
    font: 'Roboto',
    fontSize: '12px',
    border: 0,
    color: 'var(--datagrid-color)',
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    WebkitFontSmoothing: 'auto',
    letterSpacing: 'normal',
    '& .MuiDataGrid-columnsContainer': {
      backgroundColor: 'var(--datagrid-backgroundColor)',
      borderRadius: '10px 10px 0 0',
      color: 'white',
      borderBottom: `1px solid var(--datagrid-borderBottom)`,
    },
    '& .MuiDataGrid-iconSeparator': {
      display: 'none',
    },
    '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
      color: 'var(--datagrid-cell)',
    },
    '& .MuiDataGrid-columnHeader': {
      '&:focus': {
        outline: 'none',
      },
    },
    '& .MuiDataGrid-columnsContainer .MuiDataGrid-columnHeaderTitleContainer': {
      padding: 0,
    },
    '& .MuiDataGrid-cell': {
      display: 'flex',
      alignItems: 'center',
      lineHeight: 'unset !important',
      maxHeight: 'none !important',
      whiteSpace: 'normal',
      color: 'var(--datagrid-cellColor)',
      backgroundColor: 'var(--datagrid-backgroundColor)',
      borderBottom: `1px solid var(--datagrid-borderBottom)`,
      '&:focus': {
        outline: 'none',
      },
    },
    '& .MuiDataGrid-renderingZone': {
      maxHeight: 'none !important',
    },
    '& .MuiDataGrid-row': {
      maxHeight: 'none !important',
    },
    '& .MuiDataGrid-row:last-child': {
      '& .MuiDataGrid-cell': {
        border: 'none',
        '& :first-child': {
          borderBottomLeftRadius: '10px',
        },
        '& :last-child': {
          borderBottomRightRadius: '10px',
        },
      },
    },
    '& .MuiDataGrid-window': {
      backgroundColor: 'var(--datagrid-backgroundColor)',
      borderRadius: '0 0 10px 10px',
    },
    '& .MuiDataGrid-overlay': {
      zIndex: 1,
      color: 'var(--datagrid-overlayColor)',
      top: '44px',
      borderRadius: '10px',
      backgroundColor: 'transparent',
    },
  },
}))(DataGrid);

export const NoRows: React.FC<{ text?: string | null }> = ({ text = 'No record' }) => {
  return <span className="MuiDataGrid-overlay">{text}</span>;
};

export const Loading: React.FC<{
  type: 'text' | 'spin';
  size: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary';
}> = ({ type = 'spin', size = 'md', color = 'primary' }) => {
  return (
    <GridOverlay>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--datagrid-backgroundColor)',
          cursor: 'default',
          pointerEvents: 'none',
        }}
      >
        <CLoading type={type} size={size} color={color} />
      </div>
    </GridOverlay>
  );
};

export default CDataGrid;
