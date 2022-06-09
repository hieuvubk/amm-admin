import React from 'react';
import classNames from 'classnames/bind';
import styles from './Info.module.scss';
import moment from 'moment';
import { IUser } from 'src/features/Admin/interfaces';

const cx = classNames.bind(styles);

const Info: React.FC<IUser> = (props) => {
  return (
    <div className={cx('info-container')}>
      <div className={cx('info')}>User ID: {props.id}</div>
      <div className={cx('info')}>Name: {props.fullname}</div>
      <div className={cx('info')}>Company: {props.company}</div>
      <div className={cx('info')}>Position: {props.position}</div>
      <div className={cx('info')}>Email: {props.email}</div>
      <div className={cx('info')}>Phone number: {props.phone}</div>
      <div className={cx('info')}>Creation date: {moment(props.created_at).format('DD/MM/YYYY')}</div>
    </div>
  );
};

export default Info;
