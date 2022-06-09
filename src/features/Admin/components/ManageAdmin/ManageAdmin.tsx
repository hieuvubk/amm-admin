import Pagination from '@material-ui/lab/Pagination';
import classNames from 'classnames/bind';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import stylesPagition from 'src/components/Pagination/style';
import DisableAlert from 'src/features/Admin/components/AdminDetail/DisableAlert';
import LinksBreadcrumbs from 'src/features/Admin/components/LinksBreadcrumbs';
import { renderStatus } from 'src/features/Admin/contants/index';
import { plusIcon, SortDownHighLightIcon, SortDownIcon, SortUpHighLightIcon, SortUpIcon } from 'src/assets/icon';
import { SORT, FORMAT_DATE, DEFAULT_PAGE } from 'src/helpers/const';
import moment from 'moment';
import { IUser } from 'src/features/Admin/interfaces';
import { disableAdmin, enableAdmin, getAdmins } from 'src/features/Admin/redux/apis';
import stylesSCSS from 'src/features/Admin/styles/ManageAdmin.module.scss';
import { IFilter, PAGINATION } from 'src/features/UserList/Constant';
import { FilterForm } from 'src/features/UserList/FilterForm';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import { routeConstants } from 'src/constants';
import { CButton } from 'src/components/Base/Button';
import { MANAGER_ADMIN_MESSAGE } from 'src/constants/message.message';
import EmailOverflowField from 'src/components/EmailOverflowField/EmailOverflowField';

const cx = classNames.bind(stylesSCSS);
const ManageAdmin: React.FC = () => {
  const classes = stylesPagition();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const adminListStore = useAppSelector((state) => state.admin.list.data);
  const totalPage = useAppSelector((state) => state.admin.list.metadata.totalPage);
  const [, setCurrentPage] = useState(PAGINATION.DEFAULT_CURRENT_PAGE);
  const [sortingDate, setSortingDate] = useState(SORT.DECREASE);
  const [userId, setUserId] = useState<number>(0);
  const [conditionFilter, setConditionFilter] = React.useState<IFilter>({
    limit: DEFAULT_PAGE.limit,
    page: DEFAULT_PAGE.page,
    created_at: SORT.INCREASE,
  });
  const [open, setOpen] = useState(false);

  const handleChangePage = (event: React.ChangeEvent<unknown>, value: number): void => {
    conditionFilter.page = value;
    dispatch(getAdmins(conditionFilter));
    setConditionFilter(conditionFilter);
    setCurrentPage(value);
  };

  const handleFilterCondition = (condition: IFilter): void => {
    dispatch(getAdmins(condition));
    setConditionFilter(condition);
  };

  useEffect(() => {
    conditionFilter.created_at = sortingDate;
    setConditionFilter(conditionFilter);
    dispatch(getAdmins(conditionFilter));
  }, [sortingDate]);

  const handleSort = () => {
    sortingDate === SORT.INCREASE ? setSortingDate(SORT.DECREASE) : setSortingDate(SORT.INCREASE);
  };

  const handleOpen = (userId: number) => {
    setUserId(userId);
    setOpen(true);
  };

  const handleAcceptAlert = async (): Promise<void> => {
    const disableResult = await dispatch(disableAdmin({ id: userId }));
    if (disableResult.payload.code === 0) {
      dispatch(openSnackbar({ message: MANAGER_ADMIN_MESSAGE.DISABLE_SUCCESS, variant: SnackbarVariant.SUCCESS }));
      if (open) setOpen(() => !open);
      dispatch(getAdmins(conditionFilter));
    } else {
      dispatch(openSnackbar({ message: `${disableResult.payload.message}`, variant: SnackbarVariant.ERROR }));
    }
  };

  const changeAdminStatus = async (userId: number) => {
    const disableResult = await dispatch(enableAdmin({ id: userId }));
    if (disableResult.payload.code === 0) {
      dispatch(openSnackbar({ message: MANAGER_ADMIN_MESSAGE.ENABLE_SUCCESS, variant: SnackbarVariant.SUCCESS }));
      dispatch(getAdmins(conditionFilter));
    } else {
      dispatch(openSnackbar({ message: `${disableResult.payload.message}`, variant: SnackbarVariant.ERROR }));
    }
  };

  const handleSwitch = (): void => {
    setOpen(!open);
  };

  return (
    <>
      <div className={cx('admin-manage')}>
        <LinksBreadcrumbs
          value={[
            {
              content: 'Manage admin',
              onClick: (): void => history.push(routeConstants.ADMIN_LIST),
            },
            {
              content: 'Admin list',
              onClick: (): void => history.push(routeConstants.ADMIN_LIST),
            },
          ]}
        />

        <div className={cx('title')}>Admin list</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div></div>
          <CButton
            size="sm"
            actionType="button"
            type="success"
            content="Create new account"
            onClick={() => history.push(routeConstants.ADMIN_CREATE)}
            setIcon={true}
            iconPath={plusIcon}
          />
        </div>

        <div className={cx('table-container')}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: 30,
            }}
          >
            <FilterForm
              conditionFilter={conditionFilter}
              handleFilterCondition={handleFilterCondition}
              displayEmail={false}
              displayUserType={false}
              searchTitle={'Admin ID'}
              placeholder={'Search'}
              validateNumber={true}
            />
          </div>
          <table className={cx('theme-custom-table')}>
            <thead>
              <tr>
                <th>Admin ID</th>
                <th>Email</th>
                <th onClick={handleSort}>
                  <div className={cx('th-sort')}>
                    <span>Creation date</span>
                    <div className={cx('sort')}>
                      <img src={totalPage > 0 && sortingDate === SORT.INCREASE ? SortUpHighLightIcon : SortUpIcon} />
                      <img
                        src={totalPage > 0 && sortingDate === SORT.DECREASE ? SortDownHighLightIcon : SortDownIcon}
                      />
                    </div>
                  </div>
                </th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {adminListStore.map((user: IUser) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    <EmailOverflowField email={user.email} />
                  </td>
                  <td>{moment(user.created_at).format(FORMAT_DATE)}</td>
                  <td>{user.is_locked == 1 ? 'Active' : 'Disabled'}</td>
                  <td>
                    <div
                      onClick={user.is_locked == 1 ? () => handleOpen(user.id) : () => changeAdminStatus(user.id)}
                      className={cx('btn-action')}
                    >
                      {renderStatus(user.is_locked)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!adminListStore.length && <p className={cx('table-no-data')}>Not found</p>}
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
        <DisableAlert open={open} handleAccept={handleAcceptAlert} handleClose={handleSwitch} />
      </div>
    </>
  );
};

export default ManageAdmin;
