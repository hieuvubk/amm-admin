/* eslint-disable @typescript-eslint/no-explicit-any */
import { InputLabel } from '@material-ui/core';
import classnames from 'classnames/bind';
import React from 'react';
import { CInput } from 'src/components/Base/Input';
import CSelect, { ISelect } from 'src/components/Base/Select/Select';
import { ICollectedFee, IDownloadCollectedFee } from 'src/features/MarketOverview/constants/index';
import { METHOD_FILTER } from 'src/features/User/components/Transactions/Constant';
import SelectMethod from 'src/features/User/components/Transactions/SelectMethod';
import { getAllPairs } from 'src/pages/Pair/redux/Pair.slice';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import style from '../style/MarketOverView.module.scss';
import { stylesFilter } from './styles';
import { TradingMethod } from 'src/constants/dashboard';

const cx = classnames.bind(style);

interface IFilterFormProps {
  conditionFilter: ICollectedFee;
  setConditionFilter: React.Dispatch<React.SetStateAction<ICollectedFee>>;
  setDownloadFeeFilter: React.Dispatch<React.SetStateAction<IDownloadCollectedFee>>;
}

const METHOD_FILTER_WITHOUT_PANCAKESWAP = METHOD_FILTER.filter((i) => {
  return i.value !== TradingMethod.PancakeswapPool;
});

export const FilterChart: React.FC<IFilterFormProps> = ({ setConditionFilter, setDownloadFeeFilter }) => {
  const classes = stylesFilter();
  const dispatch = useAppDispatch();
  const pairList = useAppSelector((state) => state.pair.pairs);
  const [method, setMethod] = React.useState<number[]>(
    METHOD_FILTER_WITHOUT_PANCAKESWAP.map((method) => Number(method.value)),
  );

  const pairOptions: ISelect[] = [{ label: 'All', value: undefined }];

  React.useEffect(() => {
    dispatch(getAllPairs());
  }, []);

  pairList &&
    pairList.length > 0 &&
    pairList.map((pair) =>
      pairOptions.push({ value: `${pair.pairs_id}`, label: `${pair.base_symbol}/${pair.quote_symbol}` }),
    );

  const getOptionFromMethodId = (methodId: number[]) => {
    const option: ISelect[] = [];
    METHOD_FILTER_WITHOUT_PANCAKESWAP.map((item) => {
      methodId.map((id) => {
        if (item.value === id) {
          option.push({ value: id.toString(), label: item.label });
        }
      });
    });
    return option;
  };

  return (
    <div className={classes.filterForm}>
      <div>
        <InputLabel className={cx('text-filter-bar')}>Method:</InputLabel>
        <SelectMethod
          size="lg"
          option={getOptionFromMethodId(method)}
          onClick={(values) => {
            if (values.length > 0) {
              setMethod([...values.map((value) => Number(value.value))]);

              if (values.length < 3) {
                setConditionFilter((prevState) => ({
                  ...prevState,
                  methods: [...values.map((value) => Number(value.value))],
                }));
                setDownloadFeeFilter((prevState) => ({
                  ...prevState,
                  method: [...values.map((value) => Number(value.value))],
                }));
              } else {
                setConditionFilter((prevState) => ({ ...prevState, methods: undefined }));
                setDownloadFeeFilter((prevState) => ({ ...prevState, method: undefined }));
              }

              if (method.length === 1 && values.length === 1) {
                // dispatch(
                //   openSnackbar({
                //     message: 'You have to choose at least one trading method!',
                //     variant: SnackbarVariant.ERROR,
                //   }),
                // );
              }
            }
          }}
          options={METHOD_FILTER_WITHOUT_PANCAKESWAP}
        />
      </div>
      <div>
        <InputLabel className={cx('text-filter-bar')}>Pair:</InputLabel>
        <CSelect
          className={cx('pair-select')}
          options={pairOptions}
          onChange={(value): void => {
            setConditionFilter((prevState) => ({ ...prevState, pair: value }));
            setDownloadFeeFilter((prevState) => ({ ...prevState, pair: value }));
          }}
          placeholder="All"
          showSearchBar={true}
          hideSearchBarSearchIcon={true}
        />
      </div>
      <div>
        <InputLabel className={cx('text-filter-bar')}>Pool address:</InputLabel>
        <CInput
          isSearch
          size="sm"
          placeholder="Search"
          onKeyPress={(value: string): void => {
            setConditionFilter((prevState) => ({ ...prevState, poolAddress: value }));
            setDownloadFeeFilter((prevState) => ({ ...prevState, poolAddress: value }));
          }}
        />
      </div>
    </div>
  );
};
