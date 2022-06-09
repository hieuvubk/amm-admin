import React from 'react';
import styles from './FilterForm.module.scss';
import classNames from 'classnames/bind';
import { CSelect } from 'src/components/Base/Select';
import { FEE_TYPE, POOL_TYPE, POOL_TYPE_BTN } from 'src/features/Pools/constants';
import { Autocomplete } from '@material-ui/lab';
import { InputAdornment, TextField } from '@material-ui/core';
import stylesSearchField from './styles';
import searchSVG from 'src/assets/icon/search.svg';
import { useAppSelector, useAppDispatch } from 'src/store/hooks';
import TabsSwitch from 'src/features/Pools/component/TabsSwitch';
import { setConditionFilter } from 'src/features/Pools/redux/pool.slice';
import TokenIcon from 'src/helpers/coinHelper/TokenIcon';
import { CInput } from 'src/components/Base/Input';

const cx = classNames.bind(styles);

interface Props {
  onFeeTypeChange: (feeType: number) => void;
}

const FilterForm: React.FC<Props> = ({ onFeeTypeChange }) => {
  const classes = stylesSearchField();
  const dispatch = useAppDispatch();
  const ref = React.useRef<HTMLDivElement>();

  const [tokensListDB, conditionFilter] = useAppSelector((state) => [
    state.allCoins.coins.data,
    state.pool.list.conditionFilter,
  ]);
  const [inputValue, setInputValue] = React.useState('');
  const [valueTokenSearch, setValueTokenSearch] = React.useState(
    tokensListDB.find(
      (token) =>
        token.bsc_address === (conditionFilter.tokensList_contains ? conditionFilter.tokensList_contains[0] : '0'),
    ) || null,
  );

  const handleSelectPoolType = (option: { value: boolean; label: string }) => {
    if (conditionFilter.crp !== option.value) {
      dispatch(setConditionFilter({ ...conditionFilter, crp: !conditionFilter.crp }));
    }
  };

  return (
    <div className={cx('filter-form')}>
      <TabsSwitch
        type="switch"
        options={POOL_TYPE_BTN}
        defaultOption={conditionFilter.crp === POOL_TYPE.FIXED.value ? POOL_TYPE_BTN[0] : POOL_TYPE_BTN[1]}
        onSelect={handleSelectPoolType}
      />

      <Autocomplete
        inputValue={inputValue}
        blurOnSelect={true}
        className={classes.searchField}
        classes={{
          noOptions: classes.noOptions,
          option: classes.option,
        }}
        options={tokensListDB}
        value={valueTokenSearch}
        getOptionLabel={(option) => (option.name ? option.name : inputValue)}
        onChange={(event, value) => {
          if (typeof value === 'object' && value !== null) {
            dispatch(setConditionFilter({ ...conditionFilter, tokensList_contains: [value.bsc_address] }));
            setValueTokenSearch(value);
          }
        }}
        onInputChange={(event, value) => {
          value === '' && setValueTokenSearch(null);
          setInputValue(value);
        }}
        noOptionsText="Not found"
        filterOptions={(options) =>
          options.filter((option) => option.name?.toLowerCase().includes(inputValue.toLowerCase()))
        }
        renderOption={(option) => (
          <>
            <TokenIcon name={option.symbol} size="36" />
            <div>{option.name}</div>
          </>
        )}
        renderInput={(params) => (
          <TextField
            inputRef={ref}
            className={classes.textField}
            {...params}
            placeholder="Search Digital credits"
            variant="outlined"
            onKeyPress={(event) => {
              if (event.key === 'Enter') {
                if (inputValue === '') {
                  dispatch(
                    setConditionFilter({
                      crp: conditionFilter.crp,
                    }),
                  );
                  ref.current?.blur();
                }
              }
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <img src={searchSVG} />
                </InputAdornment>
              ),
              endAdornment: <></>,
            }}
          />
        )}
      />

      <CInput
        isSearch
        size="sm"
        type="text"
        placeholder="Pool address"
        closeIcon={false}
        defaultValue={conditionFilter.id}
        onKeyPress={(value: string) => {
          if (value !== '') {
            dispatch(setConditionFilter({ ...conditionFilter, id: value.toLowerCase() }));
          } else {
            dispatch(setConditionFilter({ ...conditionFilter, id: undefined }));
          }
        }}
      />

      <CSelect
        className={cx('fee-select')}
        options={FEE_TYPE}
        defaultValue={FEE_TYPE[0]}
        onChange={(item): void => {
          onFeeTypeChange(item);
        }}
      />
    </div>
  );
};

export default FilterForm;
