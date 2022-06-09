import classNames from 'classnames/bind';
import React from 'react';
import { CInput } from 'src/components/Base/Input';
import { CSelect } from 'src/components/Base/Select';
import { ADMIN_STATUS } from 'src/features/Admin/contants';
import stylesSCSS from './FilterForm.module.scss';
import { CButton } from 'src/components/Base/Button';
import { useHistory } from 'react-router-dom';
import routeConstants from 'src/constants/routeConstants';
import { IFilter } from 'src/features/Admin/interfaces';

const cx = classNames.bind(stylesSCSS);

interface IFilterFormProps {
  conditionFilter: IFilter;
  setConditionFilter: React.Dispatch<React.SetStateAction<IFilter>>;
}

const FilterForm: React.FC<IFilterFormProps> = (props) => {
  const history = useHistory();

  const handleChange = (value: { status?: number; user_id?: number }): void => {
    props.setConditionFilter((prevState) => ({ ...prevState, ...value }));
  };

  return (
    <div className={cx('filter-form')}>
      <div className={cx('status-select-wrapper')}>
        <label className={cx('label-select')}>Status:</label>
        <CSelect
          className={cx('status-select')}
          options={ADMIN_STATUS}
          defaultValue={ADMIN_STATUS[0]}
          onChange={(status: number): void => handleChange({ status })}
        />

        <CInput
          classNamePrefix={cx('search-input')}
          type="number"
          placeholder="Search Admin ID"
          size="sm"
          isSearch
          onKeyPress={(user_id: number): void => handleChange({ user_id })}
        />
      </div>

      <div className={cx('create-account-btn')}>
        <CButton
          size="md"
          type="primary"
          content="+ Create new account"
          onClick={(): void => history.push(routeConstants.ADMIN_CREATE)}
        />
      </div>
    </div>
  );
};

export default FilterForm;
