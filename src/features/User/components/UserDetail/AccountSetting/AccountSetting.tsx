import React, { useState, ChangeEvent } from 'react';
import classNames from 'classnames/bind';
import styles from './AccountSetting.module.scss';
import { formatStatusToString } from 'src/features/User/helpers';
import { USER_TYPE, WHITELIST_STATUS } from 'src/features/User/constants';
import { CButton } from 'src/components/Base/Button';
import { CSelect } from 'src/components/Base/Select';
import { IFunctionalCurrency, IUserWallet } from 'src/features/User/interfaces';
import { formatWalletAddress } from 'src/helpers/address';
import detail from 'src/assets/icon/detail.svg';
import { Link } from 'react-router-dom';
import { NETWORK_VALUE } from 'src/features/wallet/Constant';
import Pagination from '@material-ui/lab/Pagination';
import stylesPagition from 'src/components/Pagination/style';
import { useAppSelector } from 'src/store/hooks';
const cx = classNames.bind(styles);

interface AccountSettingProps {
  currencies: IFunctionalCurrency[];
  wallets: IUserWallet[];
  userType: number;
  handleUpdateUserType: (newUserType: number) => Promise<void>;
  handleRejectWallet: (walletId: number, wallet: string) => Promise<void>;
  handleWhitelistWallet: (walletId: number, wallet: string) => Promise<void>;
  handlePaginationWallet: (page: number) => void;
  userId: string;
  isRejecting: boolean;
  isWhitelisting: boolean;
  openReject: boolean;
}

const AccountSetting: React.FC<AccountSettingProps> = (props) => {
  const classes = stylesPagition();
  const totalPage = useAppSelector((state) => state.user.wallets.metadata.totalPage);
  const [clickedWallet, setClickedWallet] = React.useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const actionButtons = (
    walletId: number,
    wallet: string,
    status: number,
    network: number,
    index: number,
  ): JSX.Element | null => {
    if (network === NETWORK_VALUE.stellar) {
      return <div></div>;
    } else {
      if (status === WHITELIST_STATUS.WHITELISTED) {
        return (
          <CButton
            size="sm"
            type="secondary"
            content="Reject"
            isLoading={props.isRejecting && index === clickedWallet}
            onClick={() => {
              setClickedWallet(index);
              props.handleRejectWallet(walletId, wallet);
            }}
          />
        );
      } else if (status === WHITELIST_STATUS.PENDING) {
        return (
          <React.Fragment>
            <CButton
              size="sm"
              type="secondary"
              content="Reject"
              isLoading={props.isRejecting && index === clickedWallet}
              onClick={() => {
                setClickedWallet(index);
                props.handleRejectWallet(walletId, wallet);
              }}
            />
            <CButton
              size="sm"
              type="primary"
              content="Whitelist"
              onClick={() => {
                setClickedWallet(index);
                props.handleWhitelistWallet(walletId, wallet);
              }}
              isLoading={props.isWhitelisting && index === clickedWallet}
            />
          </React.Fragment>
        );
      } else return <div></div>;
    }
  };
  const handleChange = (event: ChangeEvent<unknown>, value: number): void => {
    setCurrentPage(value);
    props.handlePaginationWallet(value);
  };
  return (
    <div className={cx('account-setting-container')}>
      <div className={cx('title')}>Account setting</div>

      <div className={cx('account-setting')}>
        <div className={cx('setting-title')}>Currencies</div>

        {props.currencies.map((value) => (
          <div className={cx('currencies')} key={value.id}>
            {value.fc_currency}
          </div>
        ))}

        <div className={cx('setting-title')}>Connected wallets</div>

        <div
          className={cx('wallets-table-container')}
          style={{ pointerEvents: props.isRejecting || props.isWhitelisting ? 'none' : 'auto' }}
        >
          <table className={cx('theme-custom-table')}>
            <thead>
              <tr>
                <th>Address</th>
                <th>Status</th>
                <th>Network support</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {props.wallets.map((value, index) =>
                value.status !== WHITELIST_STATUS.SUBMIT ? (
                  <tr key={value.id}>
                    <td>{formatWalletAddress(value.address)}</td>
                    <td>{formatStatusToString(value.status)}</td>
                    <td>{value.network === NETWORK_VALUE.stellar ? 'Stellar' : 'BSC'}</td>
                    <td>{actionButtons(value.id, value.address, value.status, value.network, index)}</td>
                  </tr>
                ) : null,
              )}
            </tbody>
          </table>
          {props.wallets?.length === 0 && <div className={cx('empty-data')}>Not found</div>}
        </div>
        {totalPage > 1 ? (
          <div className={cx('pagination')}>
            <Pagination
              className={classes.pagination}
              count={totalPage}
              page={currentPage}
              variant="outlined"
              shape="rounded"
              onChange={handleChange}
            />
          </div>
        ) : (
          <div></div>
        )}

        <div className={cx('setting-title', 'user-type-title')}>User type</div>

        <CSelect
          menuPlacement="top"
          onChange={(value): void => {
            props.handleUpdateUserType(value);
          }}
          options={USER_TYPE}
          value={USER_TYPE.find((type) => type.value === props.userType)}
        />
        <div className={cx('detail')}>
          <Link to={`/users/${props.userId}/details`}>Details</Link>
          <img src={detail} alt="img" />
        </div>
      </div>
    </div>
  );
};

export default AccountSetting;
