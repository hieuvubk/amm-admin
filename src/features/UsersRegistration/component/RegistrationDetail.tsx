/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import { useHistory, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import styles from '../style/RegistrationDetail.module.scss';
import {
  getUserCurrencyApi,
  getUserTrationDetailApi,
  getUserWalletApi,
  updateUserStatusApi,
  updateUserTypeApi,
} from 'src/features/UsersRegistration/api/index';
import _ from 'lodash';
import { CSelect } from 'src/components/Base/Select';
import { Grid } from '@material-ui/core';
import { unwrapResult } from '@reduxjs/toolkit';
import { renderAddressWallet, renderCurrency } from 'src/features/UsersRegistration/helper/index';
import { IUser, USER_TYPE, VALUE_STATUS, VALUE_TYPE } from 'src/features/UsersRegistration/constants/index';
import LinksBreadcrumbs from 'src/features/Admin/components/LinksBreadcrumbs';
import routeConstants from 'src/constants/routeConstants';
import { openSnackbar, SnackbarVariant } from 'src/store/snackbar';
import { clearRegistrationDetail } from 'src/features/UsersRegistration/redux/Registration.slice';
const cx = classNames.bind(styles);
const RegistrationDetail: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [typeAdd, setTypeAdd] = useState<number>();
  const dataDetail = useAppSelector((state) => state.registration.result.data);
  const listCurrency = useAppSelector((state) => state.registration.currency.data);
  const listWallet = useAppSelector((state) => state.registration.wallet.data);
  const getData = async () => {
    await dispatch(getUserTrationDetailApi(Number(id)));
    await dispatch(getUserCurrencyApi(Number(id)));
    await dispatch(getUserWalletApi(Number(id)));
  };

  useEffect(() => {
    getData();
  }, [id, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearRegistrationDetail());
    };
  }, []);
  const changeTypeUser = async (value: number): Promise<void> => {
    await setTypeAdd(value);
  };
  // update status and type
  const handleSubmitStatus = async () => {
    const listIds = [];
    listIds.push(dataDetail.id);
    const response = await dispatch(
      updateUserStatusApi({
        status: VALUE_STATUS.APPROVE,
        usersId: listIds,
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
    if (result && result.length > 0) {
      await dispatch(
        updateUserTypeApi({
          user_type: typeAdd ? typeAdd : dataDetail.user_type,
          usersId: listIds,
        }),
      );
    }
    history.push(routeConstants.USERREGISTRATION);
  };
  // Reject User
  const handleSubmitType = async () => {
    const listIds = [];
    listIds.push(dataDetail.id);
    const response = await dispatch(
      updateUserStatusApi({
        status: VALUE_STATUS.REJECT,
        usersId: listIds,
      }),
    );
    if (response && response.meta && response.meta.requestStatus === 'fulfilled') {
      dispatch(
        openSnackbar({
          message: 'Reject users successfully!',
          variant: SnackbarVariant.SUCCESS,
        }),
      );
      history.push(routeConstants.USERREGISTRATION);
    }
  };
  return (
    <>
      <div>
        <div className={cx('registration-detail')}>
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
              {
                content: 'Registration detail',
              },
            ]}
          />
          <div className={cx('item-detail')}>
            <div className={cx('rowdetail')}>
              <p className={cx('title')}>Name</p>
              <p className={cx('text')}>{dataDetail && dataDetail.fullname ? dataDetail.fullname : null}</p>
            </div>
            <div className={cx('rowdetail')}>
              <p className={cx('title')}>Organization</p>
              <p className={cx('text')}>{dataDetail && dataDetail.company ? dataDetail.company : null}</p>
            </div>
            <div className={cx('rowdetail')}>
              <p className={cx('title')}>Position</p>
              <p className={cx('text')}>{dataDetail && dataDetail.position ? dataDetail.position : null}</p>
            </div>
            <div className={cx('rowdetail')}>
              <p className={cx('title')}>Email</p>
              <p className={cx('text')}>{dataDetail && dataDetail.email ? dataDetail.email : null}</p>
            </div>
            <div className={cx('rowdetail')}>
              <p className={cx('title')}>Phone number</p>
              <p className={cx('text')}>{dataDetail && dataDetail.phone ? dataDetail.phone : null}</p>
            </div>
            <div className={cx('rowdetail')}>
              <p className={cx('title')}>Functional currrency</p>
              <p className={cx('text')}>
                <>{renderCurrency(_.map(listCurrency, 'fc_currency'))}</>
              </p>
            </div>
            <div className={cx('rowdetail')}>
              <p className={cx('title')}>Wallet address</p>
              <p className={cx('text')}>
                {listWallet && listWallet.length > 0
                  ? listWallet.map((item: IUser) => <div key={item.id}>{renderAddressWallet(item.address)}</div>)
                  : null}
              </p>
            </div>
            <div className={cx('rowdetail')}>
              <p className={cx('title')}>Velo dashboard account</p>
              <p className={cx('text')}>
                {dataDetail && dataDetail.velo_account ? <span>{dataDetail.velo_account}</span> : null}
              </p>
            </div>
            <div className={cx('rowdetail user-type')}>
              <p className={cx('title')}>User type</p>
              <Grid item xs={4}>
                <CSelect
                  className={cx('status-select')}
                  options={USER_TYPE}
                  isDisabled={dataDetail && dataDetail.status === VALUE_STATUS.REJECT}
                  defaultValue={{
                    value: dataDetail && dataDetail.status && dataDetail.user_type ? dataDetail.user_type : null,
                    label:
                      dataDetail && dataDetail.user_type == VALUE_TYPE.UNREJECT
                        ? 'Unrestricted user'
                        : 'Restricted user',
                  }}
                  onChange={async (type: number) => changeTypeUser(type)}
                />
              </Grid>
            </div>
          </div>
          {!(dataDetail && dataDetail.status === VALUE_STATUS.REJECT) && (
            <div className={cx('rowbutton')}>
              <Grid item xs={12}>
                <div className={cx('action')}>
                  <button className={cx('reject')} onClick={handleSubmitType}>
                    Reject user
                  </button>
                  <button className={cx('approve')} onClick={handleSubmitStatus}>
                    Approve user
                  </button>
                </div>
              </Grid>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RegistrationDetail;
