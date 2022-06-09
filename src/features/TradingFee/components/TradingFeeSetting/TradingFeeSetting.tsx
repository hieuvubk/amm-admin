/* eslint-disable max-len */
import React from 'react';
import classNames from 'classnames/bind';
import Info from './Info';
import styles from 'src/features/TradingFee/styles/TradingFeeSetting.module.scss';
import LinksBreadcrumbs from 'src/features/Admin/components/LinksBreadcrumbs';

const cx = classNames.bind(styles);

const TradingFeeSetting: React.FC = () => {
  return (
    <div className={cx('admin-detail')}>
      <LinksBreadcrumbs
        value={[
          {
            content: 'Order book',
          },
          {
            content: 'Trading fee settings',
          },
        ]}
      />

      <div className={cx('title-switch-container')}>
        <div className={cx('title')}>Trading fee settings</div>
      </div>

      <Info></Info>
    </div>
  );
};

export default TradingFeeSetting;
