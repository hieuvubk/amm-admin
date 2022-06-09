/* eslint-disable react-hooks/exhaustive-deps */
import Pagination from '@material-ui/lab/Pagination';
import classnames from 'classnames/bind';
import React, { ChangeEvent, ReactElement, useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { CSelect } from 'src/components/Base/Select';
import { UserRole } from 'src/constants/user';
import { useAppSelector } from 'src/store/hooks';
import {
  IFilter,
  IWallet,
  NETWORK,
  BULK_ACTION,
  SELECT_OPTION,
  BulkAction,
  APPROVE,
  REJECT,
  STATUS,
  renderNetWork,
  NETWORK_VALUE,
} from 'src/features/wallet/Constant';
import { FilterWalletForm } from 'src/features/wallet/FilterForm/FilterForm';
import styles from 'src/features/wallet/Wallets.module.scss';
import { getWalletsApi } from 'src/features/wallet/Wallets.slice';
import { InputLabel } from '@material-ui/core';
import { checkAdmin, formatUserType, formatWalletStatus } from 'src/features/wallet/FilterForm/WalletsHelper';
import moment from 'moment';
import CheckboxImage from 'src/components/Base/CheckboxImage';
import _ from 'lodash';
import ApproveWallet from 'src/features/wallet/FilterForm/BoxUp/Approve';
import RejectWallet from 'src/features/wallet/FilterForm/BoxUp/Reject';
import stylesPagition from 'src/components/Pagination/style';
import routeConstants from 'src/constants/routeConstants';
import LinksBreadcrumbs from 'src/features/Admin/components/LinksBreadcrumbs/LinksBreadcrumbs';
import { DEFAULT_PAGE, FORMAT_DATE, SORT } from 'src/helpers/const';
import { SortDownHighLightIcon, SortDownIcon, SortUpHighLightIcon, SortUpIcon } from 'src/assets/icon';
import { formatWalletAddress } from 'src/helpers/address';
import WarningPopup from 'src/features/wallet/FilterForm/WarningPopup/WarningPopup';
import EmailOverflowField from 'src/components/EmailOverflowField/EmailOverflowField';

const cx = classnames.bind(styles);
interface RefObjectApprove {
  openDialogApprove: () => void;
}
interface RefObjectReject {
  openDialogReject: () => void;
}
const WalletList: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const classes = stylesPagition();
  const wallet = useAppSelector((state) => state.wallet);
  const [openWarningPopup, setOpenWarningPopup] = useState(false);
  const [boxUpStatus, setBoxUpStatus] = useState<BulkAction>({
    status: false,
    ids: [],
    addresses: [],
    roles: {},
  });
  const [typeNetWork, setTypeNetWork] = useState(NETWORK_VALUE.stellar);
  const [checkAllUser, setCheckAllUser] = useState(false);
  // const [cancelAction, setCancelAction] = useState(false);
  const [bulkAction, setbulkAction] = useState('Bulk Action');
  const [listRecordChecked, setListRecordChecked] = useState<Array<IWallet>>([]);
  const [conditionFilter, setConditionFilter] = useState<IFilter>({
    limit: DEFAULT_PAGE.limit,
    page: DEFAULT_PAGE.page,
    status: STATUS.PENDING,
    network: NETWORK_VALUE.stellar,
    create_at_sort: SORT.DECREASE,
    role: UserRole.User,
  });
  const walletStore = useAppSelector((state) => state.walletList.wallets.data);
  const totalPage = useAppSelector((state) => state.walletList.wallets.metadata.totalPage);
  const dialogRefApprove = useRef<RefObjectApprove>(null);
  const dialogRefReject = useRef<RefObjectReject>(null);
  const [sortingDate, setSortingDate] = useState(SORT.DECREASE);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const countRef = useRef(0);
  useEffect(() => {
    setListRecordChecked(walletStore);
    countRef.current = 0;
  }, [walletStore]);

  useEffect(() => {
    conditionFilter.create_at_sort = sortingDate;
    setConditionFilter(conditionFilter);
    dispatch(getWalletsApi(conditionFilter));
  }, [sortingDate, conditionFilter, typeNetWork]);

  const getAdminRole = async () => {
    setIsAdmin(await checkAdmin(wallet.bsc));
  };

  useEffect(() => {
    setIsAdmin(false);
    if (wallet.bsc) {
      getAdminRole().then();
    }
  }, [wallet.bsc]);

  const handleFilterCondition = (condition: IFilter): void => {
    condition.network = typeNetWork;
    dispatch(getWalletsApi(condition));
    setConditionFilter(condition);
  };
  const handleChangeNetwork = (value: number): void => {
    setConditionFilter({
      ...conditionFilter,
      network: value,
    });
    setTypeNetWork(value);
  };
  const handleChange = (event: ChangeEvent<unknown>, value: number): void => {
    conditionFilter.page = value;
    dispatch(getWalletsApi(conditionFilter));
    setConditionFilter(conditionFilter);
    setCheckAllUser(false);
  };
  const handleCheckBoxAllUser = (ev: boolean): void => {
    setCheckAllUser(ev);
    const listClone = _.cloneDeep(listRecordChecked);
    _.map(listClone, function (o) {
      _.set(o, 'checked', ev);
    });
    setListRecordChecked(() => listClone);
    ev ? (countRef.current = listRecordChecked.length) : (countRef.current = 0);
  };
  const handleCheckBoxUser = (ev: boolean, userCheck: IWallet): void => {
    const user = _.cloneDeep(userCheck);
    const listClone = _.cloneDeep(listRecordChecked);
    user.checked = ev;
    const idx = listClone.findIndex((rec: IWallet) => rec.id === user.id);
    listClone[idx] = _.cloneDeep(user);
    setListRecordChecked(() => _.cloneDeep(listClone));
    ev ? (countRef.current = countRef.current + 1) : (countRef.current = countRef.current - 1);
    if (countRef.current === listRecordChecked.length) {
      setCheckAllUser(true);
    } else {
      setCheckAllUser(false);
    }
  };
  const processBulkAction = async (action: string): Promise<void> => {
    const res = listRecordChecked.filter((e) => e.checked === true);
    const roles: { [address: string]: number } = {};
    const walletFilterIdAddress = res.map((e) => {
      roles[e.address] = e.user_type;
      return {
        id: e.id,
        address: e.address,
      };
    });
    if (action === BULK_ACTION.APPROVE_USER) {
      setBoxUpStatus({
        action: APPROVE,
        status: true,
        ids: walletFilterIdAddress.map((i) => i.id),
        addresses: walletFilterIdAddress.map((i) => i.address),
        roles: roles,
      });
      // Todo Bulk Action
      dialogRefApprove?.current?.openDialogApprove();
    }
    if (action === BULK_ACTION.REJECT_USER) {
      setBoxUpStatus({
        action: REJECT,
        status: true,
        ids: walletFilterIdAddress.map((i) => i.id),
        addresses: walletFilterIdAddress.map((i) => i.address),
        roles: roles,
      });
      // Todo Bulk Action
      dialogRefReject?.current?.openDialogReject();
    }
    if (!isAdmin) {
      setOpenWarningPopup(!openWarningPopup);
      return;
    }
  };
  const reloadComponent = () => {
    setTimeout(() => {
      dispatch(getWalletsApi(conditionFilter));
    }, 100);
    setbulkAction('Bulk Action');
  };
  const handelCancel = () => {
    // setCancelAction(true);
    setbulkAction('Bulk Action');
  };
  const handleSort = () => {
    if (sortingDate === SORT.INCREASE) {
      setSortingDate(SORT.DECREASE);
    } else setSortingDate(SORT.INCREASE);
  };

  return (
    <div className={cx('wallets')}>
      <div>
        <LinksBreadcrumbs
          value={[
            {
              content: 'Manager user',
              onClick: (): void => history.push(routeConstants.USERLIST),
            },
            {
              content: 'Whitelist address',
              onClick: (): void => history.push(routeConstants.WALLETLIST),
            },
          ]}
        />
        <div className={cx('title')}>
          <div className={cx('wallets-title')}>Whitelist address</div>
          <div className={cx('network-input')}>
            <InputLabel className={cx('network-input-label')}>Network:</InputLabel>
            <CSelect
              className={cx('select-network')}
              options={NETWORK}
              onChange={(value): void => {
                handleChangeNetwork(value);
              }}
              defaultValue={NETWORK[0]}
            />
          </div>
        </div>
        <div className={cx('wrap-container')}>
          <FilterWalletForm
            conditionFilter={conditionFilter}
            handleFilterCondition={handleFilterCondition}
            validateNumber={true}
            placeholder={'Search'}
          />
          <div className={cx('data-grid-wrap')}>
            <table className={cx('theme-custom-table')}>
              <thead>
                <tr>
                  {conditionFilter.status === STATUS.PENDING && typeNetWork === NETWORK_VALUE.BSC ? (
                    <th className={cx('th-checkbox')}>
                      <CheckboxImage
                        size="sm"
                        checked={checkAllUser}
                        onClick={(ev): void => handleCheckBoxAllUser(ev)}
                      />
                    </th>
                  ) : null}

                  <th>Address</th>
                  <th className={cx('th-sort')} onClick={handleSort}>
                    <div className={cx('th-sort-box')}>
                      <span>Date</span>
                      <div className={cx('sort')}>
                        <img src={totalPage > 0 && sortingDate === SORT.INCREASE ? SortUpHighLightIcon : SortUpIcon} />
                        <img
                          src={totalPage > 0 && sortingDate === SORT.DECREASE ? SortDownHighLightIcon : SortDownIcon}
                        />
                      </div>
                    </div>
                  </th>
                  <th>User ID</th>
                  <th>Email</th>
                  <th>User type</th>
                  <th>Network</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {listRecordChecked.length > 0 &&
                  listRecordChecked.map((wallet: IWallet, index: number): ReactElement => {
                    return (
                      <tr className="cursor-pointer" key={index}>
                        {conditionFilter.status === STATUS.PENDING && typeNetWork === NETWORK_VALUE.BSC ? (
                          <td className={cx('td-checkbox')}>
                            <CheckboxImage
                              size="sm"
                              checked={wallet.checked}
                              onClick={(ev): void => handleCheckBoxUser(ev, wallet)}
                            />
                          </td>
                        ) : null}
                        <td>{formatWalletAddress(wallet.address)}</td>
                        <td>{moment(wallet.created_at).format(FORMAT_DATE)}</td>
                        <td>
                          <Link to={`${'/users'}/${wallet.user_id}`}>{wallet.user_id}</Link>
                        </td>
                        <td>
                          <EmailOverflowField email={wallet.user_email} />
                        </td>
                        <td>{formatUserType(wallet.user_type)}</td>
                        <td>{renderNetWork(wallet.network)}</td>
                        <td>{formatWalletStatus(wallet.status)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            {listRecordChecked.length <= 0 && <p className={cx('table-no-data')}>Not found</p>}
          </div>
        </div>
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          className={
            conditionFilter.status === STATUS.PENDING && typeNetWork === NETWORK_VALUE.BSC
              ? cx('footer-pagination')
              : cx('footer-pagination-stellar')
          }
        >
          {conditionFilter.status === STATUS.PENDING && typeNetWork === NETWORK_VALUE.BSC ? (
            <CSelect
              value={{ value: bulkAction, label: bulkAction }}
              onChange={(value): void => {
                setbulkAction(value);
                processBulkAction(value);
              }}
              isDisabled={listRecordChecked.filter((e) => e.checked).length <= 0}
              placeholder="Bulk Action"
              menuPlacement="top"
              options={SELECT_OPTION}
            />
          ) : (
            <div></div>
          )}
          <div>
            {isAdmin && boxUpStatus && boxUpStatus.action && boxUpStatus.action === APPROVE ? (
              <ApproveWallet
                ref={dialogRefApprove}
                status={true}
                ids={boxUpStatus.ids}
                addresses={boxUpStatus.addresses}
                handleRejectAddress={reloadComponent}
                cancelComponent={handelCancel}
                walletIds={boxUpStatus.ids}
                managerAdmin={false}
                roles={boxUpStatus.roles}
                selectAll={setCheckAllUser}
              />
            ) : null}
            {isAdmin && boxUpStatus && boxUpStatus.action && boxUpStatus.action === REJECT ? (
              <RejectWallet
                ref={dialogRefReject}
                status={true}
                ids={boxUpStatus.ids}
                addresses={boxUpStatus.addresses}
                handleRejectAddress={reloadComponent}
                cancelComponent={handelCancel}
                walletIds={boxUpStatus.ids}
                managerAdmin={false}
                selectAll={setCheckAllUser}
              />
            ) : null}
            {!isAdmin && boxUpStatus && boxUpStatus.action && (
              <WarningPopup
                open={openWarningPopup}
                handleClose={() => setOpenWarningPopup(!openWarningPopup)}
                message={`Please connect to an admin address to whitelist or reject user addresses`}
              />
            )}
            {walletStore && walletStore.length > 0 && totalPage > 1 ? (
              <Pagination
                className={classes.pagination}
                count={totalPage}
                page={conditionFilter.page}
                variant="outlined"
                shape="rounded"
                onChange={handleChange}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletList;
