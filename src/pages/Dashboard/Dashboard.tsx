import classnames from 'classnames/bind';
import React from 'react';
import styles from './Dashboard.module.scss';

const cx = classnames.bind(styles);
const Dashboard: React.FC = () => {
  return <div className={cx('text-color', 'dashboard')}></div>;
};

export default Dashboard;
