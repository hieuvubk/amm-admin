/* eslint-disable @typescript-eslint/no-explicit-any */
import { InputLabel, makeStyles } from '@material-ui/core';
import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from 'src/store/hooks';
import { CSelect } from 'src/components/Base/Select';
import { getPairsApi } from 'src/pages/Pair/api/index';

interface Props {
  dataFilter?: { [key: string]: any };
  setDataFilter?: (v: any) => void;
}

const FilterOrderForm: React.FC<Props> = ({ setDataFilter = () => {}, dataFilter = {} }) => {
  const useStyle = makeStyles(() => ({
    filterBar: {
      display: 'flex',
      flexDirection: 'row',
      marginBottom: '20px',
      marginTop: '20px',
    },
    wrapContainer: {
      border: '1px solid gray',
      padding: '20px',
      borderRadius: '5px',
    },
    divSelect: {
      display: 'flex',
      flexDirection: 'row',
      marginRight: '30px',
    },
    labelSelect: {
      marginRight: '20px',
      marginTop: 'auto',
      marginBottom: 'auto',
    },
  }));
  const classes = useStyle();
  const dispatch = useAppDispatch();

  const pairListStore = useAppSelector((state) => state.pair.pair.data);
  useEffect(() => {
    dispatch(getPairsApi());
  }, [dispatch]);
  return (
    <div className={classes.filterBar}>
      <div className={classes.divSelect}>
        <InputLabel className={classes.labelSelect}>Pair:</InputLabel>
        <CSelect
          options={[
            { value: '', label: 'All' },
            ...pairListStore.map((item: any) => ({
              value: `${item.pairs_id}`,
              label: `${item.base_symbol}/${item.quote_symbol}`,
            })),
          ]}
          onChange={(v) => {
            setDataFilter({
              ...dataFilter,
              pair: v,
            });
          }}
          placeholder={'Pair'}
        />
      </div>
      <div className={classes.divSelect}>
        <InputLabel className={classes.labelSelect}>Method:</InputLabel>
        <CSelect
          // isMulti
          options={[
            { value: 1, label: 'OrderBook Stellar' },
            { value: 2, label: 'OrderBook Evry' },
            { value: 4, label: 'Liquidity Pool' },
          ]}
          onChange={(v) => {
            setDataFilter({
              ...dataFilter,
              method: v,
            });
          }}
          placeholder="Method"
        />
      </div>
    </div>
  );
};

export default FilterOrderForm;
