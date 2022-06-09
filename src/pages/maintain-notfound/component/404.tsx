import React from 'react';
import notfound from 'src/assets/img/404.png';
import routeConstants from 'src/constants/routeConstants';
import { Link } from 'react-router-dom';
import classnames from 'classnames/bind';
import styles from 'src/pages/maintain-notfound/styles/notfound.module.scss';
const cx = classnames.bind(styles);
const NotFound: React.FC = () => {
  return (
    <>
      <div className={cx('notfound')}>
        <img className={cx('img-notfound')} src={notfound} alt="" />
        <p className={cx('text')}>Sorry! The page you’re looking for cannot be found.</p>
        <Link to={routeConstants.DASHBOARD}>
          <span className={cx('backpage')}>Go to Homepage</span>
        </Link>
      </div>
    </>
  );
};

export default NotFound;
