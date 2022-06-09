import React, { ReactNode } from 'react';
import classnames from 'classnames/bind';
import styles from './DButton.module.scss';
const cx = classnames.bind(styles);
interface Props {
  isDisabled?: boolean;
  prepend?: ReactNode;
  onClick?: () => void;
  classNamePrefix?: string;
}
const DButton: React.FC<Props> = ({ isDisabled = false, onClick, classNamePrefix }) => {
  return <button disabled={isDisabled} onClick={onClick} className={cx('btn-download', `${classNamePrefix}`)}></button>;
};
export default DButton;
