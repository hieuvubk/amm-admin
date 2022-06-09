import React, { useEffect } from 'react';
import { GridColumns } from '@material-ui/data-grid';
import CDataGrid from 'src/components/DataGrid';
import { PoolToken } from 'src/interfaces/pool';
import { calcTokenPercentage } from 'src/helpers/pool';
import { formatTokenAmount } from 'src/features/Pools/helper/dataFormater';
import styles from './BalancesTable.module.scss';
import classNames from 'classnames/bind';
import { disableDragDrop } from 'src/helpers/disableDragDrop';

const cx = classNames.bind(styles);

const columns: GridColumns = [
  {
    field: 'digitalCredits',
    sortable: false,
    headerName: 'Digital credits',
    width: 200,
    headerClassName: cx('header-text-style'),
    cellClassName: cx('data-text-style'),
  },
  {
    field: 'weight',
    sortable: false,
    headerName: 'Weight',
    width: 200,
    headerClassName: cx('header-text-style'),
    cellClassName: cx('data-text-style'),
  },
  {
    field: 'poolBalance',
    sortable: false,
    headerName: 'Pool balance',
    width: 200,
    headerClassName: cx('header-text-style'),
    cellClassName: cx('data-text-style'),
  },
];

const BalancesTable: React.FC<{ tokens: PoolToken[] }> = ({ tokens }) => {
  const tokenPercentage = calcTokenPercentage(tokens);
  const rows = tokens.map((token, index) => ({
    id: index,
    digitalCredits: token.symbol,
    weight: `${tokenPercentage[index].toFixed(2)}%`,
    poolBalance: formatTokenAmount(token.balance, 1),
  }));

  useEffect(() => {
    disableDragDrop('data-grid');
  }, []);

  return (
    <div id="data-grid">
      <CDataGrid
        columns={columns}
        rows={rows}
        hideFooterPagination
        hideFooterRowCount
        hideFooterSelectedRowCount
        disableColumnMenu
        disableSelectionOnClick={true}
        disableColumnReorder={true}
        autoHeight
        rowHeight={44}
        headerHeight={36}
      />
    </div>
  );
};

export default BalancesTable;
