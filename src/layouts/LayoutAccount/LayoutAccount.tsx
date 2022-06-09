import React from 'react';
import classnames from 'classnames/bind';
import styles from './LayoutAccount.module.scss';

interface Props {
  children?: React.ReactNode;
  pathRoute?: string;
}

const cx = classnames.bind(styles);
const LayoutAccount: React.FC<Props> = ({ children }) => {
  return (
    <div style={{ display: 'flex' }}>
      <div className={cx('container')}>{children}</div>
    </div>
  );
};

export default LayoutAccount;
