/* eslint-disable max-len */
/* eslint-disable react-hooks/exhaustive-deps */
import Pagination from '@material-ui/lab/Pagination';
import classnames from 'classnames/bind';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { routeConstants } from 'src/constants';
import LinksBreadcrumbs from 'src/features/Admin/components/LinksBreadcrumbs/LinksBreadcrumbs';
import { DEFAULT_PAGINATION, IDigitalCredit, IFilter } from 'src/features/DigitalCreditSettings/interfaces';
import stylesSCSS from 'src/features/DigitalCreditSettings/styles/DigitalCreditSettings.module.scss';
import styles from 'src/features/DigitalCreditSettings/styles/pagination';
import { renderStatus } from 'src/helpers/const';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getDigitalCredit } from 'src/features/DigitalCreditSettings/redux/apis';
import FilterForm from 'src/features/DigitalCreditSettings/components/FilterForm';
import Tooltip from '@material-ui/core/Tooltip';

const cx = classnames.bind(stylesSCSS);

const DigitalCreditSettings: React.FC = () => {
  const history = useHistory();
  const classes = styles();
  const dispatch = useAppDispatch();
  const digitalCreditListStore = useAppSelector((state) => state.digitalCredit.list.data);

  const totalPage = useAppSelector((state) => state.digitalCredit.list.metadata.totalPage);

  const [conditionFilter, setConditionFilter] = React.useState<IFilter>({
    limit: DEFAULT_PAGINATION.limit,
    page: DEFAULT_PAGINATION.page,
    status: DEFAULT_PAGINATION.status,
  });

  React.useEffect(() => {
    dispatch(getDigitalCredit(conditionFilter));
  }, [conditionFilter, dispatch]);

  const handleChangePage = (event: React.ChangeEvent<unknown>, value: number): void => {
    setConditionFilter((prevState) => ({ ...prevState, page: value }));
  };

  const handleChangeFilterCondition = (condition: IFilter): void => {
    dispatch(getDigitalCredit(condition));
    setConditionFilter(condition);
  };

  const renderAddressWallet = (address: string): string =>
    address ? address.slice(0, 5) + '...' + address.slice(-3) : '';

  return (
    <div className={cx('digital-credit-setting')}>
      <div>
        <LinksBreadcrumbs
          value={[
            {
              content: 'Order book',
              onClick: (): void => history.push(routeConstants.TRADING_FEE_SETTINGS),
            },
            {
              content: 'Digital credit settings',
              onClick: (): void => history.push(routeConstants.DIGITAL_CREDIT_SETTINGS),
            },
          ]}
        />
      </div>

      <div className={cx('title')}>Digital credit settings</div>

      <div className={cx('table-container')}>
        <div style={{ margin: '0 0 20px 20px' }}>
          <FilterForm conditionFilter={conditionFilter} setConditionFilter={handleChangeFilterCondition} />
        </div>
        <table className={cx('theme-custom-table')}>
          <thead>
            <tr>
              <th>Digital credit</th>
              <th>Symbol</th>
              <th>Stellar address</th>
              <th>BSC address</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {digitalCreditListStore.length > 0 &&
              digitalCreditListStore.map((digitalCredit: IDigitalCredit) => (
                <tr key={digitalCredit.name}>
                  <td>{digitalCredit.name}</td>
                  <td>{digitalCredit.symbol}</td>
                  {digitalCredit.stellar_issuer ? (
                    <td>
                      <Tooltip title={digitalCredit.stellar_issuer} placement={'top-start'} arrow>
                        <a
                          onClick={() =>
                            window.open(
                              `${process.env.REACT_APP_STELLAR_EXPERT}/asset/${digitalCredit.symbol}-${digitalCredit.stellar_issuer}`,
                              '_blank',
                            )
                          }
                        >
                          {renderAddressWallet(digitalCredit.stellar_issuer)}
                        </a>
                      </Tooltip>
                    </td>
                  ) : (
                    <td>-</td>
                  )}
                  {digitalCredit.bsc_address ? (
                    <td>
                      <Tooltip title={digitalCredit.bsc_address} placement={'top-start'} arrow>
                        <a
                          onClick={() =>
                            window.open(
                              `${process.env.REACT_APP_ETHERSCAN}/token/${digitalCredit.bsc_address}`,
                              '_blank',
                            )
                          }
                        >
                          {renderAddressWallet(digitalCredit.bsc_address)}
                        </a>
                      </Tooltip>
                    </td>
                  ) : (
                    <td>-</td>
                  )}
                  <td>{renderStatus(digitalCredit.is_active)}</td>
                </tr>
              ))}
          </tbody>
        </table>
        {digitalCreditListStore.length <= 0 && <p className={cx('table-no-data')}>Not found</p>}
      </div>
      {totalPage > 1 ? (
        <div className={cx('footer-pagination')}>
          <div>
            <Pagination
              className={classes.pagination}
              count={totalPage}
              variant="outlined"
              shape="rounded"
              size="small"
              onChange={handleChangePage}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DigitalCreditSettings;
