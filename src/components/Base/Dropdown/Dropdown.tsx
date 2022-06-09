import React from 'react';
import styles from './Dropdown.module.scss';
import classnames from 'classnames/bind';
import { Popover } from '@material-ui/core';

const cx = classnames.bind(styles);

interface DropdownProps {
  items: Array<React.ReactNode>;
  open: boolean;
  refElm: HTMLButtonElement | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleClose: any;
  isMultipleChoice?: boolean;
  className?: string;
}
const Dropdown: React.FC<DropdownProps> = ({
  items,
  open,
  refElm,
  handleClose,
  isMultipleChoice = false,
  className,
}: DropdownProps) => {
  return (
    <>
      <Popover
        open={open}
        anchorEl={refElm}
        onClose={handleClose}
        disableScrollLock
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        classes={{ paper: cx('dropdown', className) }}
      >
        {items.map((item: React.ReactNode, index: number) => (
          <div key={index} className={cx('dropdown-item')} onClick={() => !isMultipleChoice && handleClose(null)}>
            {item}
          </div>
        ))}
      </Popover>
    </>
  );
};

export default Dropdown;
