/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Dialog } from '@material-ui/core';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CloseIcon from '@material-ui/icons/Close';
import Pagination from '@material-ui/lab/Pagination';
import classnames from 'classnames/bind';
import _ from 'lodash';
import moment from 'moment';
import React, { ChangeEvent, ReactElement, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { SortDownHighLightIcon, SortDownIcon, SortUpHighLightIcon, SortUpIcon } from 'src/assets/icon';
import { CButton } from 'src/components/Base/Button';
import CheckboxImage from 'src/components/Base/CheckboxImage';
import { CSelect } from 'src/components/Base/Select';
import stylesPagition from 'src/components/Pagination/style';
import routeConstants from 'src/constants/routeConstants';
import LinksBreadcrumbs from 'src/features/Admin/components/LinksBreadcrumbs/LinksBreadcrumbs';
import WarningPopup from 'src/features/UserList/WarningPopup';
import { checkAdmin } from 'src/features/wallet/FilterForm/WalletsHelper';
import { whiteListAddresses } from 'src/features/wallet/Wallets.slice';
import { DEFAULT_PAGE, FORMAT_DATE, SORT } from 'src/helpers/const';
import { useAppSelector } from 'src/store/hooks';
import EmailOverflowField from 'src/components/EmailOverflowField/EmailOverflowField';
import {
  BULK_ACTION,
  IFilter,
  IUser,
  OPTION_TYPE,
  OPTIONS_ACTION,
  PAGINATION,
  USER_STATUS,
  UserStatus,
  UserType,
} from './Constant';
import { FilterForm } from './FilterForm/index';
import styles from './Users.module.scss';
import { changeUserStatus, changeUserType, getUsersApi, getUserWallets } from './Users.slice';

const cx = classnames.bind(styles);

interface RefObject {
  openDialog: () => void;
}

const UserList: React.FC = () => {
  const classes = stylesPagition();
  const dispatch = useDispatch();
  const [checkAllUser, setCheckAllUser] = useState(false);
  const [bulkAction, setbulkAction] = useState(BULK_ACTION.DEFAULT);
  const [, setCurrentPage] = useState(PAGINATION.DEFAULT_CURRENT_PAGE);
  const [listRecordChecked, setListRecordChecked] = useState<Array<IUser>>([]);
  const [conditionFilter, setConditionFilter] = useState<IFilter>({
    limit: DEFAULT_PAGE.limit,
    page: DEFAULT_PAGE.page,
    created_at: SORT.DECREASE,
  });
  const userStore = useAppSelector((state) => state.userList.users.data);
  const totalPage = useAppSelector((state) => state.userList.users.metadata.totalPage);
  const [sortingDate, setSortingDate] = useState(SORT.DECREASE);
  const history = useHistory();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [typeUser, setTypeUser] = useState<number>(0);
  const [statusUser, setStatusUser] = useState<number>(1);
  const [modalType, setModalType] = React.useState(false);
  const [modalStatus, setModalStatus] = React.useState(false);
  const [modalConfirmDisabled, setModalComfirmDisabled] = React.useState(false);
  const wallet = useAppSelector((state) => state.wallet);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
  const [openWarningPopup, setOpenWarningPopup] = React.useState<boolean>(false);
  const countRef = useRef(0);
  useEffect(() => {
    dispatch(getUsersApi(conditionFilter));
  }, []);

  useEffect(() => {
    setListRecordChecked(userStore);
    setCheckAllUser(false);
    countRef.current = 0;
  }, [userStore]);

  const getAdminRole = async () => {
    setIsAdmin(await checkAdmin(wallet.bsc));
  };

  useEffect(() => {
    setIsAdmin(false);
    if (wallet.bsc) {
      getAdminRole().then();
    }
  }, [wallet.bsc]);

  useEffect(() => {
    conditionFilter.create_at_sort = sortingDate;
    conditionFilter.created_at = sortingDate;
    setConditionFilter(conditionFilter);
    dispatch(getUsersApi(conditionFilter));
  }, [sortingDate]);

  const handleFilterCondition = (condition: IFilter): void => {
    dispatch(getUsersApi(condition));
    setConditionFilter(condition);
  };

  const handleChange = (event: ChangeEvent<unknown>, value: number): void => {
    conditionFilter.page = value;
    dispatch(getUsersApi(conditionFilter));
    setConditionFilter(conditionFilter);
    setCurrentPage(value);
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

  const handleCheckBoxUser = (ev: boolean, userCheck: IUser): void => {
    const user = _.cloneDeep(userCheck);
    const listClone = _.cloneDeep(listRecordChecked);
    user.checked = ev;
    const idx = listClone.findIndex((rec: IUser) => rec.id === user.id);
    listClone[idx] = _.cloneDeep(user);
    setListRecordChecked(() => _.cloneDeep(listClone));
    ev ? (countRef.current = countRef.current + 1) : (countRef.current = countRef.current - 1);
    if (countRef.current >= listRecordChecked.length) {
      setCheckAllUser(true);
    } else {
      setCheckAllUser(false);
    }
  };

  const handleSort = () => {
    sortingDate === SORT.INCREASE ? setSortingDate(SORT.DECREASE) : setSortingDate(SORT.INCREASE);
  };

  const dialogRef = useRef<RefObject>(null);
  const processBulkAction = async (action: string): Promise<void> => {
    setbulkAction(action);
    if (action !== BULK_ACTION.DEFAULT) {
      // Todo Bulk Action
      dialogRef?.current?.openDialog();
    }
  };

  const renderUserStatus = (status: number) => {
    switch (status) {
      case UserStatus.disabled:
        return 'Disabled';
      case UserStatus.active:
        return 'Active';
      default:
        break;
    }
  };

  const renderUserType = (type: number) => {
    switch (type) {
      case UserType.restricted:
        return 'Restricted user';
      case UserType.unRestricted:
        return 'Unrestricted user';
      default:
        break;
    }
  };
  // change type set value
  const changeTypeUser = async (value: number): Promise<void> => {
    await setTypeUser(value);
  };
  // cancel change type
  const handleCancelUserType = async () => {
    await setModalType(false);
    await setbulkAction(BULK_ACTION.DEFAULT);
  };
  // call api
  const handleSubmitUserType = async () => {
    setIsLoading(true);
    try {
      const roles: { [address: string]: number } = {};
      const userIds = await Promise.all(
        listRecordChecked
          .filter((e) => e.checked === true)
          .map(async (o) => {
            const addresses = await getUserWallets(o.id);
            addresses.map((address: string) => {
              roles[address] = typeUser;
            });
            return o.id;
          }),
      );
      if (!_.isEmpty(roles)) {
        await whiteListAddresses(roles);
      }
      await dispatch(changeUserType({ usersId: userIds, user_type: typeUser, adminEmail: currentUser.email }));
      await dispatch(getUsersApi(conditionFilter));
      await setTypeUser(OPTION_TYPE[0].value);
      await setModalType(false);
      setIsLoading(false);
    } catch (e) {
      await setModalType(false);
      setIsLoading(false);
      throw e;
    }
  };
  // change status set value
  const changeStatusUser = async (value: number): Promise<void> => {
    await setStatusUser(value);
  };

  useEffect(() => {
    if (!modalStatus) {
      setStatusUser(USER_STATUS[0].value);
    }
  }, [modalStatus]);

  useEffect(() => {
    if (statusUser === USER_STATUS[1].value) {
      setModalComfirmDisabled(true);
    }
  }, [statusUser]);

  // cancel change status
  const handleCancelUserStatus = async () => {
    await setModalStatus(false);
    await setbulkAction(BULK_ACTION.DEFAULT);
  };
  //open disabled
  const handleOpenDisabled = async () => {
    // choose disabled
    if (statusUser === USER_STATUS[1].value) {
      setModalComfirmDisabled(true);
      await setModalStatus(false);
    }
    if (statusUser === USER_STATUS[0].value) {
      setModalComfirmDisabled(false);
      await setModalStatus(false);
      const userIds = listRecordChecked
        .filter((e) => e.checked === true)
        .map((o) => {
          return o.id;
        });
      await dispatch(changeUserStatus({ usersId: userIds, is_locked: statusUser }));
      await dispatch(getUsersApi(conditionFilter));
      await setStatusUser(USER_STATUS[0].value);
    }
  };
  // cancel disabled user
  const handleCancelOpenDisabled = async () => {
    await setbulkAction(BULK_ACTION.CHANGE_STATUS);
    await setStatusUser(USER_STATUS[0].value);
    await setModalType(false);
    await setModalStatus(true);
    await setModalComfirmDisabled(false);
  };
  // submit disabed user
  const handleSubmitUserStatus = async () => {
    setModalComfirmDisabled(false);
    await setModalStatus(false);
    const userIds = listRecordChecked
      .filter((e) => e.checked === true)
      .map((o) => {
        return o.id;
      });
    await dispatch(changeUserStatus({ usersId: userIds, is_locked: statusUser }));
    await dispatch(getUsersApi(conditionFilter));
    await setStatusUser(USER_STATUS[0].value);
  };

  const getUserStatusSelectValue = (userStatusValue: number): { label: string; value: number } | undefined => {
    return USER_STATUS.find((v) => v.value === userStatusValue);
  };

  return (
    <div className={cx('users')}>
      <div>
        <LinksBreadcrumbs
          value={[
            {
              content: 'Manage user',
              path: '/users',
              onClick: (): void => history.push(routeConstants.USERLIST),
            },
            {
              content: 'User list',
              path: '/list',
              onClick: (): void => history.push(routeConstants.USERLIST),
            },
          ]}
        />
        <div className={cx('user-title')}>User List</div>
        <div className={cx('table-container')}>
          <div style={{ marginBottom: 30 }}>
            <FilterForm
              conditionFilter={conditionFilter}
              handleFilterCondition={handleFilterCondition}
              validateNumber={true}
              placeholder={'Search'}
            />
          </div>
          <div className={cx('data-grid-wrap')}>
            <table className={cx('theme-custom-table')}>
              <thead>
                <tr>
                  <th className={cx('th-checkbox')}>
                    <CheckboxImage size="sm" checked={checkAllUser} onClick={(ev): void => handleCheckBoxAllUser(ev)} />
                  </th>
                  <th>User ID</th>
                  <th>Email</th>
                  <th className={cx('th-sort')} onClick={handleSort}>
                    <div className={cx('th-sort-box')}>
                      <span>Created date</span>
                      <div className={cx('sort')}>
                        <img src={totalPage > 0 && sortingDate === SORT.INCREASE ? SortUpHighLightIcon : SortUpIcon} />
                        <img
                          src={totalPage > 0 && sortingDate === SORT.DECREASE ? SortDownHighLightIcon : SortDownIcon}
                        />
                      </div>
                    </div>
                  </th>
                  <th>Status</th>
                  <th>User type</th>
                </tr>
              </thead>
              <tbody>
                {listRecordChecked.length > 0 &&
                  listRecordChecked.map((user: IUser, index: number): ReactElement => {
                    return (
                      <tr className="cursor-pointer" key={index}>
                        <td className={cx('td-checkbox')}>
                          <CheckboxImage
                            size="sm"
                            checked={user.checked}
                            onClick={(ev): void => handleCheckBoxUser(ev, user)}
                          />
                        </td>
                        <>
                          <td
                            onClick={() => {
                              history.push(`/users/${user.id}`);
                            }}
                          >
                            {user.id}
                          </td>
                          <td
                            onClick={() => {
                              history.push(`/users/${user.id}`);
                            }}
                          >
                            <EmailOverflowField email={user.email} />
                          </td>
                          <td
                            onClick={() => {
                              history.push(`/users/${user.id}`);
                            }}
                          >
                            {moment(user.created_at).format(FORMAT_DATE)}
                          </td>
                          <td
                            onClick={() => {
                              history.push(`/users/${user.id}`);
                            }}
                          >
                            {renderUserStatus(user.is_locked)}
                          </td>
                          <td
                            onClick={() => {
                              history.push(`/users/${user.id}`);
                            }}
                          >
                            {renderUserType(user.user_type)}
                          </td>
                        </>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            {listRecordChecked.length <= 0 && <p className={cx('table-no-data')}>Not found</p>}
          </div>
        </div>
        <div className={cx('footer-pagination')}>
          <CSelect
            value={{ value: bulkAction, label: bulkAction }}
            onChange={(value): void => {
              setbulkAction(value);
              processBulkAction(value);
              if (!isAdmin && value === BULK_ACTION.CHANGE_TYPE) {
                setOpenWarningPopup(true);
                return;
              }
              setModalType(true);
              value === BULK_ACTION.CHANGE_TYPE ? setModalType(true) : setModalStatus(true);
            }}
            menuPlacement="top"
            isDisabled={listRecordChecked.filter((e) => e.checked).length <= 0}
            placeholder={BULK_ACTION.DEFAULT}
            options={OPTIONS_ACTION}
          />
          {totalPage > 1 ? (
            <div>
              <Pagination
                className={classes.pagination}
                count={totalPage}
                page={conditionFilter.page}
                variant="outlined"
                shape="rounded"
                onChange={handleChange}
              />
            </div>
          ) : (
            <div></div>
          )}
          {bulkAction === BULK_ACTION.CHANGE_TYPE && (
            <Dialog
              className={cx('modal-type')}
              open={modalType}
              onClose={() => setModalType(false)}
              aria-labelledby="responsive-dialog-title"
            >
              <div>
                <DialogTitle id="responsive-dialog-title" className={cx('title-registration')}>
                  <p className={cx('description-registration')}>Change user type</p>
                  <Button onClick={handleCancelUserType} className={cx('close-button')}>
                    <CloseIcon />
                  </Button>
                </DialogTitle>
                <DialogContent className={cx('modal-content')}>
                  <CSelect
                    className={cx('status-select')}
                    options={OPTION_TYPE}
                    defaultValue={OPTION_TYPE[0]}
                    onChange={async (status: number) => changeTypeUser(status)}
                  />
                </DialogContent>
                <DialogActions>
                  <div className={cx('btn-action')}>
                    <CButton
                      classNamePrefix={cx('btn-cancel')}
                      onClick={handleCancelUserType}
                      size="sm"
                      fullWidth
                      type="primary"
                      content="Cancel"
                    />
                    <CButton
                      classNamePrefix={cx('btn-approve')}
                      onClick={handleSubmitUserType}
                      size="sm"
                      fullWidth
                      type="primary"
                      content="Save changes"
                      isLoading={isLoading}
                    />
                  </div>
                </DialogActions>
              </div>
            </Dialog>
          )}

          {!isAdmin && bulkAction === BULK_ACTION.CHANGE_TYPE && (
            <WarningPopup
              open={openWarningPopup}
              handleClose={() => setOpenWarningPopup(!openWarningPopup)}
              message={`Please connect to an admin address to change user type`}
            />
          )}
          {bulkAction === BULK_ACTION.CHANGE_STATUS && (
            <Dialog
              className={cx('modal-type')}
              open={modalStatus}
              onClose={() => setModalStatus(false)}
              aria-labelledby="responsive-dialog-title"
            >
              <div>
                <DialogTitle id="responsive-dialog-title" className={cx('title-registration')}>
                  <p className={cx('description-registration')}>Change user status</p>
                  <Button onClick={handleCancelUserStatus} className={cx('close-button')}>
                    <CloseIcon />
                  </Button>
                </DialogTitle>
                <DialogContent className={cx('modal-content')}>
                  <CSelect
                    className={cx('status-select')}
                    value={getUserStatusSelectValue(statusUser)}
                    options={USER_STATUS}
                    defaultValue={USER_STATUS[0]}
                    onChange={async (status: number) => changeStatusUser(status)}
                  />
                </DialogContent>
                <DialogActions>
                  <div className={cx('btn-action')}>
                    <CButton
                      classNamePrefix={cx('btn-cancel')}
                      onClick={handleCancelUserStatus}
                      size="sm"
                      fullWidth
                      type="primary"
                      content="Cancel"
                    />
                    <CButton
                      classNamePrefix={cx('btn-approve')}
                      onClick={handleOpenDisabled}
                      size="sm"
                      fullWidth
                      type="primary"
                      content="Save changes"
                    />
                  </div>
                </DialogActions>
              </div>
            </Dialog>
          )}
          {modalConfirmDisabled === true && statusUser === USER_STATUS[1].value ? (
            <Dialog
              className={cx('modal-type')}
              open={modalConfirmDisabled}
              onClose={() => setModalComfirmDisabled(false)}
              aria-labelledby="responsive-dialog-title"
            >
              <div>
                <DialogTitle id="responsive-dialog-title" className={cx('title-registration')}>
                  <p className={cx('description-registration')}>Disable user</p>
                  <Button onClick={handleCancelOpenDisabled} className={cx('close-button')}>
                    <CloseIcon />
                  </Button>
                </DialogTitle>
                <DialogContent className={cx('modal-content')}>
                  <span>Once you disable an user, the following things will happen:</span>
                  <ul>
                    <li>This user will receive an email from the system about the account being disable.</li>
                    <li>
                      This user will not be able to log in and trade on FCX until an Admin enables the account again.
                    </li>
                  </ul>
                </DialogContent>
                <DialogActions>
                  <div className={cx('btn-action')}>
                    <CButton
                      classNamePrefix={cx('btn-cancel')}
                      onClick={handleCancelOpenDisabled}
                      size="sm"
                      fullWidth
                      type="primary"
                      content="Cancel"
                    />
                    <CButton
                      classNamePrefix={cx('btn-disabled')}
                      onClick={handleSubmitUserStatus}
                      size="sm"
                      fullWidth
                      type="primary"
                      content="Disable"
                    />
                  </div>
                </DialogActions>
              </div>
            </Dialog>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default UserList;
