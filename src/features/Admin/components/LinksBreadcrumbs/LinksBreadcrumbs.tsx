import React from 'react';
import classNames from 'classnames/bind';
import styles from './LinksBreadcrumbs.module.scss';
import { useLocation } from 'react-router-dom';

interface Links {
  content: string;
  path?: string;
  onClick?: () => void;
}

interface LinksBreadcrumbsProps {
  value: Links[];
}

const cx = classNames.bind(styles);

const LinksBreadcrumbs = (props: LinksBreadcrumbsProps): JSX.Element => {
  const location = useLocation();
  return (
    <div className={cx('links-container')}>
      {props.value.map((value, index) => (
        <div
          className={cx('links', location.pathname.indexOf(value.path || '') !== -1 ? 'active' : '')}
          key={index}
          onClick={value.onClick}
        >
          {`${value.content}${props.value[index + 1] ? ' / ' : ''}`}
        </div>
      ))}
    </div>
  );
};

export default LinksBreadcrumbs;
