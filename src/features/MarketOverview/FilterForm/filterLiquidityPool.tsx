/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { InputLabel } from '@material-ui/core';
import classnames from 'classnames/bind';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { CInput } from 'src/components/Base/Input';
import { CSelect } from 'src/components/Base/Select';
import { DIGITAL_CREDIT, IFilter, OPTION_TRANSACTION_TYPE, PAIR } from 'src/features/MarketOverview/constants/index';
import CustomDateRangePicker from 'src/components/DateRangePicker';
import { renderDate } from 'src/helpers/date';
import { DateRange } from 'src/interfaces/user';
import style from '../style/MarketOverView.module.scss';
import { stylesFilter } from './styles';
const cx = classnames.bind(style);
interface IFilterFormProps {
  conditionFilter: IFilter;
  typeTransaction?: string;
  handleFilterCondition?: (condition: IFilter) => void;
}
export const FilterLiquidityPool: React.FC<IFilterFormProps> = (props) => {
  const classes = stylesFilter();
  const [conditionFilter, setConditionFilter] = useState(props.conditionFilter);
  const [digital, setDigital] = useState(0);
  const [pair, setPair] = useState(0);
  const filter = (conditionFilter: IFilter): void => {
    if (props.handleFilterCondition) props.handleFilterCondition(conditionFilter);
  };
  const handleChangePair = (value: number): void => {
    delete conditionFilter.digital_credit_amount;
    conditionFilter.pair_id = value;
    conditionFilter.page = 1;
    setConditionFilter(conditionFilter);
    filter(conditionFilter);
  };
  const handleChangeDigitalCredit = (value: number): void => {
    delete conditionFilter.pair_id;
    conditionFilter.digital_credit_amount = value;
    conditionFilter.page = 1;
    setConditionFilter(conditionFilter);
    filter(conditionFilter);
  };
  const handelChangePool = (value: string): void => {
    conditionFilter.address = value;
    conditionFilter.page = 1;
    setConditionFilter(conditionFilter);
    filter(conditionFilter);
  };
  const handleChangTime = (date: DateRange) => {
    conditionFilter.start_date = renderDate(date.startDate);
    conditionFilter.end_date = renderDate(date.startDate);
    conditionFilter.page = 1;
  };
  useEffect(() => {
    setDigital(digital);
    setPair(pair);
  }, [props.typeTransaction]);
  return (
    <div className={classes.filterForm}>
      {props.typeTransaction === OPTION_TRANSACTION_TYPE[0].value ? (
        <>
          <div>
            <InputLabel className={cx('text-filter-bar')}>Pair:</InputLabel>
            <CSelect
              options={PAIR}
              onChange={(value: number): void => {
                handleChangePair(value);
                setPair(value);
              }}
              value={
                PAIR && PAIR.length > 0
                  ? _.filter(PAIR, (item: any) => {
                      return item.value === pair;
                    })
                  : []
              }
              defaultValue={PAIR[0]}
              placeholder="All"
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <InputLabel className={cx('text-filter-bar')}>Digital credit:</InputLabel>
            <CSelect
              options={DIGITAL_CREDIT}
              onChange={(value: number): void => {
                handleChangeDigitalCredit(value);
                setDigital(value);
              }}
              value={
                DIGITAL_CREDIT && DIGITAL_CREDIT.length > 0
                  ? _.filter(DIGITAL_CREDIT, (item: any) => {
                      return item.value === digital;
                    })
                  : []
              }
              defaultValue={DIGITAL_CREDIT[0]}
              placeholder="All"
            />
          </div>
        </>
      )}
      <div>
        <InputLabel className={cx('text-filter-bar')}>Pool:</InputLabel>
        <CInput isSearch size="sm" placeholder="Search" onKeyPress={(value: string): void => handelChangePool(value)} />
      </div>
      <div>
        <InputLabel className={cx('text-filter-bar')}>Time:</InputLabel>
        <CustomDateRangePicker
          onChange={(date: DateRange) => handleChangTime(date)}
          classNameProps={'fix-style-date-range'}
        />
      </div>
    </div>
  );
};
