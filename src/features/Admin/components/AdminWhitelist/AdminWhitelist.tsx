import { InputLabel } from '@material-ui/core';
import Pagination from '@material-ui/lab/Pagination';
import classnames from 'classnames/bind';
import moment from 'moment';
import React, { ChangeEvent, ReactElement, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { SortDownHighLightIcon, SortDownIcon, SortUpHighLightIcon, SortUpIcon } from 'src/assets/icon';
import { CSelect } from 'src/components/Base/Select';
import stylesPagition from 'src/components/Pagination/style';
import routeConstants from 'src/constants/routeConstants';
import LinksBreadcrumbs from 'src/features/Admin/components/LinksBreadcrumbs/LinksBreadcrumbs';
import {
  APPROVE,
  BulkAction,
  BULK_ACTION,
  IFilter,
  NETWORK,
  REJECT,
  renderNetWork,
  SELECT_OPTION,
  STATUS,
  NETWORK_VALUE,
  TYPE,
} from 'src/features/wallet/Constant';
import { FilterWalletForm } from 'src/features/wallet/FilterForm/FilterForm';
import { checkSuperAdmin, formatWalletStatus } from 'src/features/wallet/FilterForm/WalletsHelper';
import styles from 'src/features/wallet/Wallets.module.scss';
import { useAppSelector } from 'src/store/hooks';
import { IAdminWhitelist } from 'src/features/Admin/interfaces';
import { getAdminWhitelistAddress } from 'src/features/Admin/redux/apis';
import ApproveWallet from 'src/features/wallet/FilterForm/BoxUp/Approve';
import RejectWallet from 'src/features/wallet/FilterForm/BoxUp/Reject';
import _ from 'lodash';
import CheckboxImage from 'src/components/Base/CheckboxImage';
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
const SORT = {
  INCREASE: 'ASC',
  DECREASE: 'DESC',
};

const AdminWhitelist: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const classes = stylesPagition();
  const wallet = useAppSelector((state) => state.wallet);
  const [openWarningPopup, setOpenWarningPopup] = useState(false);
  const [typeNetWork, setTypeNetWork] = useState(NETWORK_VALUE.stellar);
  const [bulkAction, setbulkAction] = useState('Bulk Action');
  const dialogRefApprove = useRef<RefObjectApprove>(null);
  const dialogRefReject = useRef<RefObjectReject>(null);
  const [checkAllUser, setCheckAllUser] = useState(false);
  // const [cancelAction, setCancelAction] = useState(false);
  const [listRecordChecked, setListRecordChecked] = useState<Array<IAdminWhitelist>>([]);
  const [conditionFilter, setConditionFilter] = useState<IFilter>({
    limit: 10,
    page: 1,
    network: NETWORK_VALUE.stellar,
    status: STATUS.PENDING,
  });
  const [boxUpStatus, setBoxUpStatus] = useState<BulkAction>({
    status: false,
    ids: [],
    addresses: [],
    roles: {},
  });
  const getWhitelistAddress = useAppSelector((state) => state.adminWhitelist.list.data);
  const totalPage = useAppSelector((state) => state.adminWhitelist.list.metadata.totalPage);
  const [sortingDate, setSortingDate] = useState(SORT.DECREASE);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const countRef = useRef(0);
  useEffect(() => {
    setListRecordChecked(getWhitelistAddress);
    countRef.current = 0;
  }, [getWhitelistAddress]);

  useEffect(() => {
    conditionFilter.create_at_sort = sortingDate;
    setConditionFilter(conditionFilter);
    dispatch(getAdminWhitelistAddress(conditionFilter));
  }, [sortingDate, conditionFilter]);

  const getSuperAdminRole = async () => {
    setIsSuperAdmin(await checkSuperAdmin(wallet.bsc));
  };

  useEffect(() => {
    setIsSuperAdmin(false);
    if (wallet.bsc) {
      getSuperAdminRole().then();
    }
  }, [wallet.bsc]);

  const handleFilterCondition = (condition: IFilter): void => {
    condition.network = typeNetWork;
    dispatch(getAdminWhitelistAddress(condition));
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
    dispatch(getAdminWhitelistAddress(conditionFilter));
    setConditionFilter(conditionFilter);
  };

  const handleSort = () => {
    if (sortingDate === SORT.INCREASE) {
      setSortingDate(SORT.DECREASE);
    } else setSortingDate(SORT.INCREASE);
  };

  const processBulkAction = async (action: string): Promise<void> => {
    const res = listRecordChecked.filter((e) => e.checked === true);
    const roles: { [address: string]: number } = {};
    const walletFilterIdAddress = res.map((e) => {
      roles[e.address] = TYPE.ADMIN;
      return {
        id: e.id,
        addresses: e.address,
      };
    });
    if (action === BULK_ACTION.APPROVE_USER) {
      setBoxUpStatus({
        action: APPROVE,
        status: true,
        ids: walletFilterIdAddress.map((i) => i.id),
        addresses: walletFilterIdAddress.map((i) => i.addresses),
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
        addresses: walletFilterIdAddress.map((i) => i.addresses),
        roles: roles,
      });
      // Todo Bulk Action
      dialogRefReject?.current?.openDialogReject();
    }
    if (!isSuperAdmin) {
      setOpenWarningPopup(!openWarningPopup);
      return;
    }
  };

  const handleCheckBoxUser = (ev: boolean, userCheck: IAdminWhitelist): void => {
    const user = _.cloneDeep(userCheck);
    const listClone = _.cloneDeep(listRecordChecked);
    user.checked = ev;
    const idx = listClone.findIndex((rec: IAdminWhitelist) => rec.id === user.id);
    listClone[idx] = _.cloneDeep(user);
    setListRecordChecked(() => _.cloneDeep(listClone));
    ev ? (countRef.current = countRef.current + 1) : (countRef.current = countRef.current - 1);
    if (countRef.current === listRecordChecked.length) {
      setCheckAllUser(true);
    } else {
      setCheckAllUser(false);
    }
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

  const reloadComponent = () => {
    dispatch(getAdminWhitelistAddress(conditionFilter));
    setbulkAction('Bulk Action');
  };
  const handelCancel = () => {
    // setCancelAction(true);
    setbulkAction('Bulk Action');
  };
  return (
    <div className={cx('wallets')}>
      <div>
        <LinksBreadcrumbs
          value={[
            {
              content: 'Manager admin',
              onClick: (): void => history.push(routeConstants.ADMIN_LIST),
            },
            {
              content: 'Whitelist address',
              onClick: (): void => history.push(routeConstants.WHITELIST_ADDRESS),
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
            displayUserType={false}
            searchTitle={'Admin ID'}
            placeholder={'Search'}
            validateNumber={true}
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
                  <th>Admin ID</th>
                  <th>Email</th>
                  <th>Network</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {listRecordChecked.length > 0 &&
                  listRecordChecked.map((user: IAdminWhitelist, index: number): ReactElement => {
                    return (
                      <tr className="cursor-pointer" key={index}>
                        {conditionFilter.status === STATUS.PENDING && typeNetWork === NETWORK_VALUE.BSC ? (
                          <td className={cx('td-checkbox')}>
                            <CheckboxImage
                              size="sm"
                              checked={user.checked}
                              onClick={(ev): void => handleCheckBoxUser(ev, user)}
                            />
                          </td>
                        ) : null}
                        <td>{formatWalletAddress(user.address)}</td>
                        <td>{moment(user.created_at).format('DD/MM/YYYY')}</td>
                        <td>{user.user_id}</td>
                        <td>
                          <EmailOverflowField email={user.user_email} />
                        </td>
                        <td>{renderNetWork(user.network)}</td>
                        <td>{formatWalletStatus(user.status)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            {listRecordChecked.length <= 0 && <p className={cx('table-no-data')}>Not found</p>}
          </div>
        </div>
        <div className={typeNetWork === NETWORK_VALUE.BSC ? cx('footer-pagination') : cx('footer-pagination-stellar')}>
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
            {isSuperAdmin && boxUpStatus && boxUpStatus.action && boxUpStatus.action === APPROVE ? (
              <ApproveWallet
                ref={dialogRefApprove}
                status={true}
                ids={boxUpStatus.ids}
                addresses={boxUpStatus.addresses}
                handleRejectAddress={reloadComponent}
                cancelComponent={handelCancel}
                managerAdmin={true}
                roles={boxUpStatus.roles}
              />
            ) : null}
            {isSuperAdmin && boxUpStatus && boxUpStatus.action && boxUpStatus.action === REJECT ? (
              <RejectWallet
                ref={dialogRefReject}
                status={true}
                ids={boxUpStatus.ids}
                addresses={boxUpStatus.addresses}
                handleRejectAddress={reloadComponent}
                cancelComponent={handelCancel}
                managerAdmin={true}
              />
            ) : null}
            {!isSuperAdmin && boxUpStatus && boxUpStatus.action && (
              <WarningPopup
                open={openWarningPopup}
                handleClose={() => setOpenWarningPopup(!openWarningPopup)}
                message={`Please connect to an super admin address to whitelist or reject admin addresses`}
              />
            )}
            {totalPage > 1 && (
              <Pagination
                className={classes.pagination}
                count={totalPage}
                variant="outlined"
                shape="rounded"
                onChange={handleChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWhitelist;
