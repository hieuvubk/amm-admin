/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
/* eslint-disable react-hooks/exhaustive-deps */
import { Dialog } from '@material-ui/core';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Pagination from '@material-ui/lab/Pagination';
import CloseIcon from '@material-ui/icons/Close';
import classnames from 'classnames/bind';
import _ from 'lodash';
import React, { ChangeEvent, ReactElement, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import CheckboxImage from 'src/components/Base/CheckboxImage';
import { CSelect } from 'src/components/Base/Select';
import { CButton } from 'src/components/Base/Button';
import { useAppSelector } from 'src/store/hooks';
import { useHistory } from 'react-router-dom';
import {
  BULK_ACTION,
  IFilter,
  IUser,
  OPTIONS_ACTION,
  PAGINATION,
  VALUE_STATUS,
  USER_TYPE,
  TITLE,
} from 'src/features/UsersRegistration/constants/index';
import { FilterForm } from 'src/features/UsersRegistration/FilterForm/index';
import styles from '../style/Registration.module.scss';
import {
  getUsersRegistrationApi,
  updateUserStatusApi,
  updateUserTypeApi,
} from 'src/features/UsersRegistration/api/index';

import { unwrapResult } from '@reduxjs/toolkit';
import Moment from 'react-moment';
import LinksBreadcrumbs from 'src/features/Admin/components/LinksBreadcrumbs/LinksBreadcrumbs';
import routeConstants from 'src/constants/routeConstants';
import stylesPagition from 'src/components/Pagination/style';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import { DEFAULT_PAGE, FORMAT_DATE, SORT } from 'src/helpers/const';
import { SortDownHighLightIcon, SortDownIcon, SortUpHighLightIcon, SortUpIcon } from 'src/assets/icon';
import Tooltip from '@material-ui/core/Tooltip';
import InforIcon from 'src/assets/icon/information.svg';
import { UserRegistrationStatus } from 'src/features/UserList/Constant';
import EmailOverflowField from 'src/components/EmailOverflowField/EmailOverflowField';

const cx = classnames.bind(styles);
const RegistrationList: React.FC = () => {
  const dispatch = useDispatch();
  const classes = stylesPagition();
  const history = useHistory();
  const [checkAllUser, setCheckAllUser] = useState(false);
  const [modalStatus, setModalStatus] = React.useState(false);
  const [typeAdd, setTypeAdd] = useState<number>(0);
  const [bulkAction, setbulkAction] = useState(BULK_ACTION.DEFAULT);
  const [, setCurrentPage] = useState(PAGINATION.DEFAULT_CURRENT_PAGE);
  const [listRecordChecked, setListRecordChecked] = useState<Array<IUser>>([]);
  const [sortingDate, setSortingDate] = useState(SORT.DECREASE);
  const [conditionFilter, setConditionFilter] = useState<IFilter>({
    limit: DEFAULT_PAGE.limit,
    page: DEFAULT_PAGE.page,
    created_at: SORT.DECREASE,
    user_registration: UserRegistrationStatus.PENDING,
  });
  const totalPage = useAppSelector((state) => state.registration.list_user_registration.metadata.totalPage);
  const userStore = useAppSelector((state) => state.registration.list_user_registration.data);
  const countRef = useRef(0);
  useEffect(() => {
    dispatch(getUsersRegistrationApi(conditionFilter));
  }, []);

  useEffect(() => {
    setListRecordChecked(userStore);
    setCheckAllUser(false);
    countRef.current = 0;
  }, [userStore]);

  useEffect(() => {
    conditionFilter.created_at = sortingDate;
    setConditionFilter(conditionFilter);
    dispatch(getUsersRegistrationApi(conditionFilter));
  }, [sortingDate, conditionFilter]);

  const handleFilterCondition = (condition: IFilter): void => {
    dispatch(getUsersRegistrationApi(condition));
    setConditionFilter(condition);
  };

  const handleChange = (event: ChangeEvent<unknown>, value: number): void => {
    conditionFilter.page = value;
    dispatch(getUsersRegistrationApi(conditionFilter));
    setConditionFilter(conditionFilter);
    setCurrentPage(value);
    setCheckAllUser(false);
  };

  const handleCheckBoxAllUser = (ev: boolean): void => {
    setCheckAllUser(ev);
    const listClone = _.cloneDeep(listRecordChecked);
    _.map(listClone, (item: any) => {
      _.set(item, 'checked', ev);
    });
    setListRecordChecked(() => listClone);
    ev ? (countRef.current = listRecordChecked.length) : (countRef.current = 0);
  };

  const handleCheckBoxUser = async (ev: boolean, userCheck: IUser) => {
    const user: any = _.cloneDeep(userCheck);
    const listClone = _.cloneDeep(listRecordChecked);
    user.checked = ev;
    const idx = listClone.findIndex((rec: IUser) => rec.id === user.id);
    listClone[idx] = _.cloneDeep(user);
    setListRecordChecked(() => _.cloneDeep(listClone));
    ev ? (countRef.current = countRef.current + 1) : (countRef.current = countRef.current - 1);
    if (countRef.current === listRecordChecked.length) {
      setCheckAllUser(true);
    } else {
      setCheckAllUser(false);
    }
  };
  const getDetail = (e: IUser): void => {
    history.push(`${routeConstants.USERREGISTRATION}/${e.id}`);
  };
  const processBulkAction = async (action: string): Promise<void> => {
    if (action === BULK_ACTION.APPROVE) {
      // Todo Bulk Action
      setCheckAllUser(false);
    }
  };
  // approve user
  const handleSubmitApproUser = async () => {
    setModalStatus(false);
    const lstChecked = _.filter(listRecordChecked, (item) => {
      return item.checked;
    });
    const lstIds = _.map(lstChecked, 'id');
    // change status
    if (bulkAction === 'Approve user') {
      const response: any = await dispatch(
        updateUserStatusApi({
          status: VALUE_STATUS.APPROVE,
          usersId: lstIds,
          userType: typeAdd,
        }),
      );
      if (response && response.meta && response.meta.requestStatus === 'fulfilled') {
        dispatch(
          openSnackbar({
            message: 'Approve users successfully!',
            variant: SnackbarVariant.SUCCESS,
          }),
        );
      }
      const result = unwrapResult(response);
      // change type
      if (result && result && result.length > 0) {
        await dispatch(
          updateUserTypeApi({
            user_type: typeAdd,
            usersId: lstIds,
            writeLog: false,
          }),
        );
      }
    }
    dispatch(getUsersRegistrationApi(conditionFilter));
  };
  const handleSubmitStatusCancel = async () => {
    await setModalStatus(false);
    await setbulkAction(BULK_ACTION.DEFAULT);
  };
  // reject user
  const handleSubmitRejectUser = async () => {
    setModalStatus(false);
    if (bulkAction === 'Reject user') {
      const lstChecked = _.filter(listRecordChecked, (item) => {
        return item.checked;
      });
      const lstIds = _.map(lstChecked, 'id');
      const response: any = await dispatch(
        updateUserStatusApi({
          status: VALUE_STATUS.REJECT,
          usersId: lstIds,
        }),
      );
      if (response && response.meta && response.meta.requestStatus === 'fulfilled') {
        dispatch(
          openSnackbar({
            message: 'Reject users successfully!',
            variant: SnackbarVariant.SUCCESS,
          }),
        );
      }
      dispatch(getUsersRegistrationApi(conditionFilter));
    }
  };
  const changeTypeUser = async (value: number): Promise<void> => {
    await setTypeAdd(value);
  };

  const handleSort = () => {
    sortingDate === SORT.INCREASE ? setSortingDate(SORT.DECREASE) : setSortingDate(SORT.INCREASE);
  };

  return (
    <div className={cx('users')}>
      <div>
        <LinksBreadcrumbs
          value={[
            {
              content: 'Manage user',
              onClick: (): void => history.push(routeConstants.USERLIST),
            },
            {
              content: 'User registration',
              onClick: (): void => history.push(routeConstants.USERREGISTRATION),
            },
          ]}
        />
        <div className={cx('user-title')}>
          User registration
          <Tooltip title={TITLE} placement={'top-start'}>
            <img className={cx('icon-infor')} src={InforIcon} alt="" />
          </Tooltip>
        </div>
        <div className={cx('wrap-container')}>
          <FilterForm conditionFilter={conditionFilter} handleFilterCondition={handleFilterCondition} />
          <div className={cx('data-grid-wrap')}>
            <table className={cx('theme-custom-table')}>
              <thead>
                <tr>
                  {conditionFilter.user_registration !== VALUE_STATUS.REJECT ? (
                    <th className={cx('th-checkbox')}>
                      <CheckboxImage
                        size="sm"
                        checked={checkAllUser}
                        onClick={(ev): void => handleCheckBoxAllUser(ev)}
                      />
                    </th>
                  ) : null}
                  <th>Register ID</th>
                  <th>Email</th>
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
                  <th>Position</th>
                  <th>Organization</th>
                  <th title="Velo dashboard account">Velo dashboard account</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {listRecordChecked.length > 0 &&
                  listRecordChecked.map((user: IUser): ReactElement => {
                    return (
                      <tr className="cursor-pointer" key={user.id}>
                        {conditionFilter.user_registration !== VALUE_STATUS.REJECT ? (
                          <td className={cx('td-checkbox')}>
                            <CheckboxImage
                              size="sm"
                              checked={user.checked}
                              onClick={(ev: boolean) => handleCheckBoxUser(ev, user)}
                            />
                          </td>
                        ) : null}
                        <>
                          <td onClick={(): void => getDetail(user)} className={cx('tile-active')}>
                            {user.id}
                          </td>
                          <td onClick={(): void => getDetail(user)}>
                            <EmailOverflowField email={user.email} />
                          </td>
                          <td onClick={(): void => getDetail(user)}>
                            <Moment format={FORMAT_DATE}>{user.created_at}</Moment>
                          </td>
                          <td onClick={(): void => getDetail(user)}>{user.position}</td>
                          <td onClick={(): void => getDetail(user)}>{user.company}</td>
                          <td>{user.velo_account}</td>
                          <td onClick={(): void => getDetail(user)}>
                            {user.status == VALUE_STATUS.APPROVE
                              ? 'Active'
                              : user.status == VALUE_STATUS.PENDING
                              ? 'Pending'
                              : 'Rejected'}
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
          {conditionFilter.user_registration !== VALUE_STATUS.REJECT ? (
            <CSelect
              value={{ value: bulkAction, label: bulkAction }}
              onChange={(value): void => {
                setbulkAction(value);
                processBulkAction(value);
                value && value !== BULK_ACTION.DEFAULT ? setModalStatus(true) : setModalStatus(false);
              }}
              menuPlacement="top"
              isDisabled={
                !listRecordChecked ||
                listRecordChecked.length == 0 ||
                listRecordChecked.filter((e) => e.checked).length <= 0
                  ? true
                  : false
              }
              placeholder={BULK_ACTION.DEFAULT}
              options={OPTIONS_ACTION}
            />
          ) : (
            <div></div>
          )}
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
        </div>
      </div>
      <>
        {
          <Dialog
            className={cx('modal-type')}
            open={modalStatus}
            onClose={() => setModalStatus(false)}
            aria-labelledby="responsive-dialog-title"
          >
            {bulkAction === 'Approve user' ? (
              <div className={cx('dialog-modal', 'approve-user-dialog')}>
                <DialogTitle id="responsive-dialog-title" className={cx('approve-user-dialog__title')}>
                  Approve user
                  <div onClick={handleSubmitStatusCancel} className={cx('close-button')}>
                    <CloseIcon />
                  </div>
                </DialogTitle>
                <DialogContent className={cx('modal-content', 'approve-user__content')}>
                  <p className={cx('approve-user-dialog__content__text')}>Please choose user type for chosen users</p>

                  <CSelect
                    className={cx('status-select')}
                    options={USER_TYPE}
                    defaultValue={USER_TYPE[0]}
                    onChange={async (status: number) => changeTypeUser(status)}
                  />
                </DialogContent>
                <DialogActions className={cx('btn-action')}>
                  <CButton
                    classNamePrefix={cx('btn-cancel')}
                    onClick={handleSubmitStatusCancel}
                    size="sm"
                    fullWidth
                    type="primary"
                    content="Cancel"
                  />
                  <CButton
                    classNamePrefix={cx('btn-approve')}
                    onClick={handleSubmitApproUser}
                    size="sm"
                    fullWidth
                    type="primary"
                    content="Approve user"
                  />
                </DialogActions>
              </div>
            ) : (
              <div className={cx('dialog-modal', 'reject-user-dialog')}>
                <DialogTitle id="responsive-dialog-title" className={cx('reject-user-dialog__title')}>
                  Reject user
                  <div onClick={handleSubmitStatusCancel} className={cx('close-button')}>
                    <CloseIcon />
                  </div>
                </DialogTitle>
                <p className={cx('reject-user-dialog__content__text')}>Are you sure want to reject chosen users?</p>
                <DialogActions className={cx('btn-action')}>
                  <CButton
                    classNamePrefix={cx('btn-cancel')}
                    onClick={handleSubmitStatusCancel}
                    size="sm"
                    fullWidth
                    type="primary"
                    content="Cancel"
                  />
                  <CButton
                    classNamePrefix={cx('btn-approve')}
                    onClick={handleSubmitRejectUser}
                    size="sm"
                    fullWidth
                    type="primary"
                    content="
                    Reject user"
                  />
                </DialogActions>
              </div>
            )}
          </Dialog>
        }
      </>
    </div>
  );
};

export default RegistrationList;
