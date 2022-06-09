import React from 'react';
import classNames from 'classnames/bind';
import styles from 'src/features/Pools/styles/PoolDashboard.module.scss';
import LinksBreadcrumbs from 'src/features/Admin/components/LinksBreadcrumbs';
import { currencySelector } from 'src/helpers/functional-currency';
import { ExchangeRate } from 'src/interfaces/exchange-rate';
import { FunctionCurrency } from 'src/interfaces/user';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { useHistory } from 'react-router-dom';
import { routeConstants } from 'src/constants';
import FilterForm from 'src/features/Pools/component/PoolDashboard/FilterForm';
import { CButton } from 'src/components/Base/Button';
import { makeStyles } from '@material-ui/core';
import { useState } from 'react';
import { GridColumns, GridRowParams } from '@material-ui/data-grid';
import { getPoolsList } from 'src/features/Pools/redux/apis';
import { PoolDashboardTable } from 'src/interfaces/pool';
import CDataGrid from 'src/components/DataGrid';
import { processPoolsDashboardTableData } from 'src/helpers/pool';
import Pagination from 'src/components/Pagination';
import { FeeType, PoolDashboardPageSize } from 'src/features/Pools/constants';
import Donut from 'src/components/Chart/Donut';
import { getTokenDonutColor } from 'src/components/Chart/constant';
import { Loading, NoRows } from 'src/components/DataGrid/DataGrid';
import { clearPoolsList } from 'src/features/Pools/redux/pool.slice';
import { ReactComponent as PlusIcon } from 'src/assets/icon/plus3.svg';
import { disableDragDrop } from 'src/helpers/disableDragDrop';
import { TooltipAddress } from 'src/features/User/components/Balances/TooltipAddress';
import { renderAddressWallet } from 'src/features/MarketOverview/helper';

const cx = classNames.bind(styles);

const rowStyle = makeStyles(() => ({
  table: {
    '& .MuiDataGrid-row': {
      cursor: 'pointer',
      maxHeight: 'none !important',
    },

    '& .MuiDataGrid-renderingZone': {
      maxHeight: 'none !important',
    },
    '& .MuiDataGrid-cell': {
      display: 'flex',
      alignItems: 'center',
      lineHeight: 'unset !important',
      maxHeight: 'none !important',
      whiteSpace: 'normal',
    },
  },
}));

const columns: GridColumns = [
  {
    field: 'poolAddress',
    sortable: false,
    headerName: 'Pool address',
    flex: 1,
    renderCell: (params) => (
      <TooltipAddress title={params.row.id}>
        <span>{renderAddressWallet(params.row.id)}</span>
      </TooltipAddress>
    ),
  },
  {
    field: 'temp',
    sortable: false,
    headerName: 'Assets',
    width: 300,
    renderCell: (params) => (
      <div className={cx('asset-cell')}>
        <Donut
          labels={[]}
          series={params.row.tokensPercentage as number[]}
          colors={(params.row.assets as string[]).map((asset) => getTokenDonutColor(asset.split(' ')[1]))}
          size="sm"
        />

        <div className={cx('assets-list')}>
          {(params.row.assets as string[]).map((asset, index) => (
            <div key={index}>
              <span style={{ color: getTokenDonutColor(asset.split(' ')[1]), marginRight: '5px' }}>•</span>
              {asset}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    field: 'swapFee',
    sortable: false,
    headerName: 'Swap fee',
    flex: 1,
  },
  {
    field: 'totalLiquidity',
    sortable: false,
    headerName: 'Total liquidity',
    flex: 1,
  },
  {
    field: 'volume24',
    sortable: false,
    headerName: 'Volume (24h)',
    flex: 1,
  },
  {
    field: 'fees24',
    sortable: false,
    headerName: 'Fees (24h)',
    flex: 1,
  },
  {
    field: 'apy',
    sortable: false,
    headerName: 'APY',
    flex: 1,
  },
  {
    field: 'lifeTimeFees',
    sortable: false,
    headerName: 'Life time fees',
    flex: 1,
  },
  {
    field: 'numberOfLPer',
    sortable: false,
    headerName: 'Number of LPer',
    flex: 1,
  },
];

const PoolDashboard: React.FC = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const [poolsList, conditionFilter, loading] = useAppSelector((state) => [
    state.pool.list.data,
    state.pool.list.conditionFilter,
    state.pool.list.loading,
  ]);
  const [poolsData, setPoolsData] = useState<PoolDashboardTable[]>([]);
  const [poolsPage, setPoolsPage] = useState(0);
  const [feeType, setFeeType] = useState(FeeType.Gross);
  const exchangeRates: ExchangeRate[] = useAppSelector((state) => state.functionalCurrency.exchangeRates);
  const selectedCurrency: FunctionCurrency = useAppSelector(currencySelector);

  React.useEffect(() => {
    disableDragDrop('data-grid');
    return () => {
      dispatch(clearPoolsList());
    };
  }, []);

  React.useEffect(() => {
    setPoolsPage(0);
    dispatch(getPoolsList(conditionFilter));
  }, [conditionFilter, dispatch]);

  React.useEffect(() => {
    setPoolsData(processPoolsDashboardTableData(poolsList, feeType, exchangeRates, selectedCurrency));
  }, [poolsList, feeType, exchangeRates, selectedCurrency]);

  const handleOnRowClick = (row: GridRowParams) => {
    history.push(`/pools/${row.id}`);
  };

  const noRowMessage = (): string => {
    if (Object.keys(conditionFilter).length === 1) return 'No record';
    else return 'Not found';
  };

  return (
    <div id="data-grid" className={cx('pool-dashboard')}>
      <LinksBreadcrumbs
        value={[
          {
            content: 'Liquidity pool',
            onClick: (): void => history.push(routeConstants.POOL_DASHBOARD),
          },
          {
            content: 'Pool dashboard',
            onClick: (): void => history.push(routeConstants.POOL_DASHBOARD),
          },
        ]}
      />

      <div className={cx('utilities-bar')}>
        <FilterForm onFeeTypeChange={(type) => setFeeType(type)} />

        <div className={cx('download-create-btn')}>
          <CButton
            classNamePrefix={cx('request-btn')}
            size="sm"
            type="success"
            prepend={<PlusIcon width="20" height="20" />}
            content="Create new pool"
            onClick={(): void => history.push(routeConstants.NEW_POOL_REQUEST)}
          />
        </div>
      </div>

      <CDataGrid
        page={poolsPage}
        className={rowStyle().table}
        columns={columns}
        rows={poolsData}
        pageSize={PoolDashboardPageSize}
        rowCount={poolsData.length}
        hideFooterRowCount
        hideFooterSelectedRowCount
        hideFooterPagination={poolsData.length <= PoolDashboardPageSize}
        disableColumnMenu
        disableSelectionOnClick={true}
        disableColumnReorder={true}
        autoHeight
        rowHeight={80}
        headerHeight={36}
        components={{ Pagination: Pagination, NoRowsOverlay: NoRows, LoadingOverlay: Loading }}
        componentsProps={{
          noRowsOverlay: {
            text: !poolsData.length ? noRowMessage() : '',
          },
        }}
        onRowClick={handleOnRowClick}
        onPageChange={(params) => setPoolsPage(params.page)}
        loading={loading}
      />
    </div>
  );
};

export default PoolDashboard;
