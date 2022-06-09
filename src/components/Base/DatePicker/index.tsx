import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'src/components/Base/DatePicker/style.scss';
import classnames from 'classnames/bind';
import styles from './styleInput.module.scss';
const cx = classnames.bind(styles);
interface Props {
  selected?: Date;
  minDate?: Date;
  maxDate?: Date;
  onChange: (value: Date) => void;
  classNamePrefix?: string;
}
const CustomDatePicker: React.FC<Props> = ({ selected, minDate, maxDate, classNamePrefix, onChange = () => {} }) => {
  const CustomerDate = ({ value, onClick }: { value?: string; onClick?: () => void }) => (
    <button className={cx('btn-start-date')} onClick={onClick}>
      {value}
      <div className={cx('img-start-date')}></div>
    </button>
  );
  return (
    <>
      <DatePicker
        selected={selected}
        onChange={onChange}
        dateFormat="dd/MM/yyyy"
        minDate={minDate}
        maxDate={maxDate}
        portalId="root-modal-datepicker"
        customInput={<CustomerDate />}
        className={cx('input-date-picker', `${classNamePrefix}`)}
      />
    </>
  );
};

export default CustomDatePicker;
