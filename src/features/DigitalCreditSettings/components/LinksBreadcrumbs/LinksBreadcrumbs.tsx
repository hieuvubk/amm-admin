import React from 'react';
import classNames from 'classnames/bind';
import styles from './LinksBreadcrumbs.module.scss';

interface Links {
  content: string;
  onClick?: () => void;
}

interface LinksBreadcrumbsProps {
  value: Links[];
}

const cx = classNames.bind(styles);

const LinksBreadcrumbs = (props: LinksBreadcrumbsProps): JSX.Element => (
  <div className={cx('links-container')}>
    {props.value.map((value, index) => (
      <div className={cx('links')} key={index} onClick={value.onClick}>
        {`${value.content}${props.value[index + 1] ? ' / ' : ''}`}
      </div>
    ))}
  </div>
);

export default LinksBreadcrumbs;
