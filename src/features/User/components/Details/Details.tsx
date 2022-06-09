/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable max-len */
import _ from 'lodash';
import React, { useState } from 'react';
import LayoutAccount from 'src/layouts/LayoutAccount/LayoutAccount';
import styles from './Details.module.scss';
import classnames from 'classnames/bind';
import LinksBreadcrumbs from 'src/features/Admin/components/LinksBreadcrumbs';
import { routeConstants } from 'src/constants';
import { useHistory } from 'react-router-dom';
import { ProfitAndLoss } from '../ProfitAndLoss';
import { Balances } from '../Balances';
import Transactions from '../Transactions';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { getUserDetail } from 'src/features/User/redux/apis';

const cx = classnames.bind(styles);

const Details: React.FC = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();

  const [option, setOption] = useState({
    balances: true,
    profitAndLoss: false,
    transactions: false,
  });
  const showProfit = () => {
    setOption({
      balances: false,
      profitAndLoss: true,
      transactions: false,
    });
  };

  const showBalances = () => {
    setOption({
      balances: true,
      profitAndLoss: false,
      transactions: false,
    });
  };

  const showTransactions = () => {
    setOption({
      balances: false,
      profitAndLoss: false,
      transactions: true,
    });
  };

  const userId = window.location.pathname.split('/')[2];

  React.useEffect(() => {
    const getUserDetailFunc = async () => {
      const res = await dispatch(getUserDetail(Number(userId)));
      if (res.payload.code === 'NO_PERMISSION') history.push(routeConstants.NOT_FOUND);
    };
    getUserDetailFunc();
  }, [dispatch, userId]);

  return (
    <LayoutAccount>
      <LinksBreadcrumbs
        value={[
          {
            content: 'Manage user',
            onClick: (): void => history.push(routeConstants.USERLIST),
          },
          {
            content: 'User list',
            onClick: (): void => history.push(routeConstants.USERLIST),
          },
          {
            content: 'A user detail',
            onClick: (): void => history.push(`/users/${+userId}`),
          },
          {
            content: 'Details',
          },
        ]}
      />

      <div className={cx('option')}>
        <span onClick={showBalances} className={cx(option.balances ? 'active' : '')}>
          Balances
        </span>
        <span onClick={showProfit} className={cx(option.profitAndLoss ? 'active' : '')}>
          Profit And Loss
        </span>
        <span onClick={showTransactions} className={cx(option.transactions ? 'active' : '')}>
          Transactions
        </span>
      </div>
      {option.balances ? (
        <div style={{ marginTop: 30 }}>
          <Balances />
        </div>
      ) : option.profitAndLoss ? (
        <div style={{ marginTop: 30 }}>
          <ProfitAndLoss />
        </div>
      ) : (
        <div style={{ marginTop: 30 }}>
          <Transactions />
        </div>
      )}
    </LayoutAccount>
  );
};

export default Details;
