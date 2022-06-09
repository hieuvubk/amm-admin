/* eslint-disable react-hooks/exhaustive-deps */
import { Button, InputLabel, Typography } from '@material-ui/core';
import ArrowDropDownRoundedIcon from '@material-ui/icons/ArrowDropDownRounded';
import classnames from 'classnames/bind';
import React, { useEffect, useState } from 'react';
import { CInput } from 'src/components/Base/Input';
import { ISelect } from 'src/components/Base/Select2/Select2';
import SelectMethod from 'src/features/User/components/Transactions/SelectMethod/SelectMethod';
import { METHOD_FILTER, TFilter, TPair } from './Constant';
import { ICoin } from './DigitalCreditModal/Constant';
import DigitalCreditModal from './DigitalCreditModal/DigitalCreditModal';
import styles from 'src/features/User/components/Transactions/Transaction.module.scss';
import CustomDateRangePicker from 'src/components/DateRangePicker';
import { DateRange } from 'src/interfaces/user';
import { CSelect } from 'src/components/Base/Select';

const cx = classnames.bind(styles);

export const ITEMS_FILTER = {
  PAIR: 'pair',
  ORDER_ID: 'orderId',
  METHOD: 'method',
  COIN: 'coin',
  POOL: 'pool',
  USER_ID: 'userId',
  DATE_RANGE: 'dateRange',
};
export interface IFilterBar {
  handleCancelOrder?: (orderId: number) => void;
  coinList?: ICoin[];
  pairList: TPair[];
  handleFilterCondition?: (condition: TFilter) => void;
  conditionFilter?: TFilter;
  itemFilter: string[];
  size?: 'md' | 'lg';
  validateNumber?: boolean;
}

const FilterBar: React.FC<IFilterBar> = (props) => {
  // const [pair, setPair] = useState<number>(-1);
  const [method, setMethod] = useState<number[]>([METHOD_FILTER[0].value]);
  // const [orderId, setOrderId] = useState<string>();
  const [userId, setUserId] = useState<string>();
  const [coinId, setCoinId] = useState<number>(-1);
  const [orderId, setOrderId] = useState<string>();
  const [pool, setPool] = useState<string>();
  const [conditionFilter, setConditionFilter] = useState<TFilter>({});
  const [refElm, setRefEml] = useState<HTMLButtonElement | null>(null);
  const filter = (condition?: TFilter) => {
    if (props.handleFilterCondition) {
      props.handleFilterCondition(condition ? condition : conditionFilter);
    }
  };

  useEffect(() => {
    if (props.conditionFilter) {
      // setPair(props.conditionFilter.pair ? props.conditionFilter.pair : -1);
      setMethod(props.conditionFilter.method ? props.conditionFilter.method : [METHOD_FILTER[0].value]);
      setUserId(props.conditionFilter.userId ? props.conditionFilter.userId : '');
      setOrderId(props.conditionFilter.orderId ? props.conditionFilter.orderId : '');
      setPool(props.conditionFilter.pool ? props.conditionFilter.pool : '');
      setConditionFilter(props.conditionFilter);
    }
  }, [props.conditionFilter]);

  const handleChangePair = (value: number) => {
    if (Number(value) === -1) {
      delete conditionFilter.pair;
    } else {
      conditionFilter.pair = value;
    }
    // setPair(value);
    setConditionFilter(conditionFilter);
    filter();
  };

  const handleChangeMethod = (values: ISelect[]) => {
    if (values.length > 0) {
      const methods: number[] = [];
      values.map((item: ISelect) => {
        methods.push(Number(item.value));
      });
      setMethod(methods);
      conditionFilter.method = methods;
      setConditionFilter(conditionFilter);
      filter();
    }
  };
  const handleChangeOrderId = (value: string) => {
    setOrderId(value);
    conditionFilter.orderId = value;
    setConditionFilter(conditionFilter);
  };

  const handleChangeUserId = (value: string) => {
    setUserId(value);
    conditionFilter.userId = value;
    setConditionFilter(conditionFilter);
  };

  const handleChangePool = (value: string) => {
    setPool(value);
    conditionFilter.pool = value;
    setConditionFilter(conditionFilter);
  };

  const handleSelectCoin = (value: number) => {
    if (value === -1) {
      delete conditionFilter?.coinId;
      setConditionFilter(conditionFilter);
    } else {
      conditionFilter.coinId = value;
      setConditionFilter(conditionFilter);
    }
    setCoinId(value);
    filter();
  };

  const handleChangTime = (date: DateRange) => {
    conditionFilter.startDate = date.startDate;
    conditionFilter.endDate = date.endDate;
    setConditionFilter(conditionFilter);
    filter();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const converOptionsSelect = (arrayObj: any[], labelKey1: string, valueKey: string, labelKey2?: string) => {
    const res: { label: string; value: string }[] = [];
    res.push({ value: '-1', label: 'All' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    arrayObj.map((item: any) => {
      res.push({
        label: !labelKey2 ? item[labelKey1] : item[labelKey1] + '/' + item[labelKey2],
        value: item[valueKey],
      });
    });
    return res;
  };

  // const getLabelByPairId = () => {
  //   const pairFilter = props.pairList.filter((e: TPair) => e.pairs_id === pair)[0];
  //   return pairFilter ? pairFilter.base_name + '/' + pairFilter.quote_name : 'All';
  // };

  const getOptionFromMethodId = (methodId: number[]) => {
    const option: ISelect[] = [];
    METHOD_FILTER.map((item) => {
      methodId.map((id) => {
        if (item.value === id) {
          option.push({ value: id.toString(), label: item.label });
        }
      });
    });
    return option;
  };

  const getLabelFromCoinId = () => {
    const coin = props.coinList?.find((e: ICoin) => e.id === coinId);
    if (coin) {
      return coin.name;
    }
    return 'All';
  };

  const pairOptions = converOptionsSelect(props.pairList, 'base_name', 'pairs_id', 'quote_name');

  return (
    <div className={cx('filter-bar')}>
      {props.itemFilter.includes(ITEMS_FILTER.PAIR) && (
        <div className={cx('div-select')}>
          <InputLabel className={cx('label-select')}>Pair:</InputLabel>
          <CSelect
            value={props.conditionFilter?.pair ? undefined : pairOptions[0]}
            className={cx('pair-select')}
            options={pairOptions}
            onChange={handleChangePair}
            defaultValue={pairOptions[0]}
            showSearchBar={true}
            hideSearchBarSearchIcon={true}
          />
          {/* <Button
            endIcon={<ArrowDropDownRoundedIcon className={cx(`arrow-icon-${props.size}`)} />}
            className={cx(`button-select-${props.size}`)}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => setRefEml(event.currentTarget)}
          >
            <Typography className={cx(`text-option-select-${props.size}`)}>{getLabelByPairId()}</Typography>
          </Button>
          <DigitalCreditModal
            open={Boolean(refElm)}
            handleClose={() => setRefEml(null)}
            refElm={refElm}
            options={converOptionsSelect(props.pairList, 'base_name', 'pairs_id', 'quote_name')}
            onClick={handleChangePair}
          /> */}
        </div>
      )}
      {props.itemFilter.includes('orderId') && (
        <div className={cx('div-select')}>
          <InputLabel className={cx('label-select')}>Order ID:</InputLabel>
          <CInput
            placeholder="Search"
            defaultValue={orderId}
            onChange={(value: string) => handleChangeOrderId(value)}
            validateNumber={props.validateNumber}
            onKeyPress={() => {
              filter();
            }}
            classNamePrefix={cx(`input-filter-order-${props.size}`)}
            onBlur={() => filter()}
          />
        </div>
      )}
      {props.itemFilter.includes(ITEMS_FILTER.METHOD) && (
        <div className={cx('div-select')}>
          <InputLabel className={cx('label-select')}>Method:</InputLabel>
          <SelectMethod
            option={getOptionFromMethodId(method)}
            onClick={handleChangeMethod}
            options={METHOD_FILTER}
            size={props.size}
            endAdornment={<ArrowDropDownRoundedIcon className={cx(`arrow-icon-${props.size}`)} />}
          />
        </div>
      )}
      {props.itemFilter.includes(ITEMS_FILTER.COIN) && (
        <div className={cx('div-select')}>
          <InputLabel className={cx('label-select')}>Digital credit:</InputLabel>
          <Button
            endIcon={<ArrowDropDownRoundedIcon className={cx(`arrow-icon-${props.size}`)} />}
            className={cx(`button-select-${props.size}`)}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => setRefEml(event.currentTarget)}
          >
            <Typography className={cx('text-option-select')}>{getLabelFromCoinId()}</Typography>
          </Button>
          <DigitalCreditModal
            open={Boolean(refElm)}
            handleClose={() => setRefEml(null)}
            refElm={refElm}
            options={props.coinList ? converOptionsSelect(props.coinList, 'name', 'id') : []}
            onClick={handleSelectCoin}
          />
        </div>
      )}
      {props.itemFilter.includes(ITEMS_FILTER.POOL) && (
        <div className={cx('div-select')}>
          <InputLabel className={cx('label-select')}>Pool:</InputLabel>
          <CInput
            closeIcon={false}
            size="sm"
            placeholder="Search"
            defaultValue={pool}
            onChange={(value: string) => handleChangePool(value)}
            onKeyPress={() => {
              filter();
            }}
            classNamePrefix={cx(`input-filter-order-${props.size}`)}
          />
        </div>
      )}
      {props.itemFilter.includes(ITEMS_FILTER.USER_ID) && (
        <div className={cx('div-select')}>
          <InputLabel className={cx('label-select')}>User ID:</InputLabel>
          <CInput
            closeIcon={false}
            placeholder="Search"
            defaultValue={userId}
            validateNumber={props.validateNumber}
            onChange={(value: string) => handleChangeUserId(value)}
            onKeyPress={() => {
              filter();
            }}
            classNamePrefix={cx(`input-filter-order-${props.size}`)}
          />
        </div>
      )}
      {props.itemFilter.includes(ITEMS_FILTER.DATE_RANGE) && (
        <div className={cx('div-select')}>
          <InputLabel className={cx('label-select')}>Time:</InputLabel>
          <CustomDateRangePicker
            onChange={(date: DateRange) => handleChangTime(date)}
            classNameProps={'fix-style-date-range'}
            month={2}
            maxDate={new Date()}
            formStyle={'style-date-range-form'}
            defaultShowDate={true}
            defaultEndDate={props.conditionFilter?.endDate}
            defaultStartDate={props.conditionFilter?.startDate}
            startDate={props.conditionFilter?.startDate}
            endDate={props.conditionFilter?.endDate}
          />
        </div>
      )}
    </div>
  );
};
FilterBar.defaultProps = {
  validateNumber: true,
};

export default FilterBar;
