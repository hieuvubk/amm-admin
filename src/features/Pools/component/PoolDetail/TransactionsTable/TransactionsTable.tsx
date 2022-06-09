import React from 'react';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { GridCellParams, GridColumns } from '@material-ui/data-grid';
import { makeStyles, MenuItem, Select } from '@material-ui/core';
import { TRANSACTIONS_TYPE } from 'src/features/Pools/constants';
import CDataGrid from 'src/components/DataGrid';
import { ReactComponent as ArrowDownIcon } from 'src/assets/icon/Arrow-Down.svg';
import { Pool } from 'src/interfaces/pool';
import { processTransactionsTableData } from 'src/helpers/pool';
import Pagination from 'src/components/Pagination';
import classNames from 'classnames/bind';
import styles from './TransactionsTable.module.scss';
import TokenIcon from 'src/helpers/coinHelper/TokenIcon';
import { getAdds, getSwaps, getWithdraws } from 'src/features/Pools/redux/apis';
import { setDataPrecision } from 'src/features/Pools/helper/dataFormater';
import { Loading, NoRows } from 'src/components/DataGrid/DataGrid';
import { disableDragDrop } from 'src/helpers/disableDragDrop';

const cx = classNames.bind(styles);

const useStyles = makeStyles({
  header: {
    '& .MuiDataGrid-columnHeader:focus-within': {
      outline: 'none',
    },

    '& .MuiDataGrid-cell:focus-within': {
      outline: 'none',
    },

    '& .MuiDataGrid-columnsContainer': {
      flexDirection: 'row',
    },
  },

  select: {
    '&&&:before, &&&:after': {
      borderBottom: 'none',
    },

    '& .MuiSelect-select': {
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontSize: '14px',
      lineHeight: '20px',
      color: 'var(--color-body)',
      padding: 0,
      paddingRight: '16px',
      opacity: 1,
    },

    '& .MuiSelect-select:focus': {
      background: 'none',
    },

    '& svg': {
      cursor: 'pointer',
      position: 'absolute',
      right: 0,

      pointerEvents: 'none',
    },
  },

  menus: {
    '& li': {
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontSize: '12px',
      lineHeight: '16px',
      color: 'var(--color-body)',
    },
  },
});

const TransactionsTable: React.FC<{ pool: Pool }> = ({ pool }) => {
  const dispatch = useAppDispatch();
  const [transactionsData, transactionsDataCount, loading] = useAppSelector((state) => [
    state.pool.current.transactions.data,
    state.pool.current.transactions.totalItems,
    state.pool.current.loadingTransactions,
  ]);
  const styles = useStyles();
  const [transactionsType, setTransactionsType] = React.useState(TRANSACTIONS_TYPE.SWAP.value);

  React.useEffect(() => {
    dispatch(getSwaps({ poolId: pool.id, page: 0 }));
    disableDragDrop('data-grid');
  }, []);

  const getTransactionData = (transactionsType: number, page: number) => {
    switch (transactionsType) {
      case TRANSACTIONS_TYPE.SWAP.value:
        dispatch(getSwaps({ poolId: pool.id, page: page }));
        return;
      case TRANSACTIONS_TYPE.ADD.value:
        dispatch(getAdds({ poolId: pool.id, page: page }));
        return;
      case TRANSACTIONS_TYPE.REMOVE.value:
        dispatch(getWithdraws({ poolId: pool.id, page: page }));
        return;
      default:
        return;
    }
  };

  const handleChangeSelect = (
    event: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }>,
  ) => {
    setTransactionsType(Number(event.target.value));
    getTransactionData(Number(event.target.value), 0);
  };

  const transactionsTypeSelect = (): JSX.Element => (
    <Select
      value={transactionsType}
      onChange={handleChangeSelect}
      className={styles.select}
      IconComponent={() => <ArrowDownIcon />}
      MenuProps={{
        className: styles.menus,
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'left',
        },
        getContentAnchorEl: null,
      }}
    >
      <MenuItem className={cx('header-text-style')} value={TRANSACTIONS_TYPE.SWAP.value}>
        {TRANSACTIONS_TYPE.SWAP.label}
      </MenuItem>
      <MenuItem className={cx('header-text-style')} value={TRANSACTIONS_TYPE.ADD.value}>
        {TRANSACTIONS_TYPE.ADD.label}
      </MenuItem>
      <MenuItem className={cx('header-text-style')} value={TRANSACTIONS_TYPE.REMOVE.value}>
        {TRANSACTIONS_TYPE.REMOVE.label}
      </MenuItem>
    </Select>
  );

  const transactionHyperLink = (params: GridCellParams) => {
    return (
      <a
        className={cx('transaction-hyperlink', 'transaction-text-style')}
        href={`${process.env.REACT_APP_ETHERSCAN}/tx/${params.row.id}`}
        target="_blank"
        rel="noreferrer"
      >
        {params.row.description}
      </a>
    );
  };

  const renderAddRemoveDetails = (params: GridCellParams) => {
    const details = params.value as string[][];

    return (
      <div className={cx('add-remove-details')}>
        {details?.map(([tokenSym, tokenAmount], index) => (
          <>
            <div key={index}>
              <TokenIcon name={tokenSym} />
              <div>{setDataPrecision(tokenAmount, 2)}</div>
            </div>
            {index === 3 && <hr className={cx('tokens-detail-break')} />}
          </>
        ))}
      </div>
    );
  };

  const columnsSwap: GridColumns = [
    {
      field: 'description',
      sortable: false,
      flex: 1,
      renderHeader: transactionsTypeSelect,
      renderCell: transactionHyperLink,
      headerClassName: cx('transactions-type-select-container'),
    },
    {
      field: 'digitalCreditAmountIn',
      sortable: false,
      headerName: 'Digital credit amount',
      flex: 1,
      headerClassName: cx('header-text-style'),
      cellClassName: cx('transaction-text-style'),
    },
    {
      field: 'digitalCreditAmountOut',
      sortable: false,
      headerName: 'Digital credit amount',
      flex: 1,
      headerClassName: cx('header-text-style'),
      cellClassName: cx('transaction-text-style'),
    },
    {
      field: 'time',
      sortable: false,
      headerName: 'Time',
      flex: 1,
      headerClassName: cx('header-text-style'),
      cellClassName: cx('transaction-text-style'),
    },
  ];

  const columnsAddRemove: GridColumns = [
    {
      field: 'description',
      sortable: false,
      flex: 0.75,
      renderHeader: transactionsTypeSelect,
      renderCell: transactionHyperLink,
      headerClassName: cx('transactions-type-select-container'),
    },
    {
      field: 'details',
      sortable: false,
      headerName: 'Details',
      flex: 2,
      renderCell: renderAddRemoveDetails,
      headerClassName: cx('header-text-style'),
      cellClassName: cx('transaction-text-style'),
    },
    {
      field: 'time',
      sortable: false,
      headerName: 'Time',
      flex: 1,
      headerClassName: cx('header-text-style'),
      cellClassName: cx('transaction-text-style'),
    },
  ];

  return (
    <div id="data-grid">
      <CDataGrid
        className={styles.header}
        columns={transactionsType === TRANSACTIONS_TYPE.SWAP.value ? columnsSwap : columnsAddRemove}
        rows={processTransactionsTableData(transactionsData, transactionsType)}
        pageSize={10}
        rowCount={transactionsDataCount}
        pagination
        paginationMode="server"
        hideFooterRowCount
        hideFooterSelectedRowCount
        hideFooterPagination={transactionsDataCount / 10 < 2}
        disableColumnMenu
        disableSelectionOnClick={true}
        disableColumnReorder={true}
        autoHeight
        rowHeight={transactionsType === TRANSACTIONS_TYPE.SWAP.value ? 44 : 70}
        headerHeight={36}
        components={{ Pagination: Pagination, LoadingOverlay: Loading, NoRowsOverlay: NoRows }}
        loading={loading}
        onPageChange={(params) => getTransactionData(transactionsType, params.page)}
      />
    </div>
  );
};

export default TransactionsTable;
