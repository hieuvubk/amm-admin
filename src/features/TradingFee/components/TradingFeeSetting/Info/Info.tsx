import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './Info.module.scss';
import edit from 'src/assets/icon/edit-light.svg';
import { useAppSelector, useAppDispatch } from 'src/store/hooks';
import { getTradingFee } from 'src/features/TradingFee/redux/apis';
import EditTradingFee from 'src/features/TradingFee/components/EditTradingFee';
import BigNumber from 'bignumber.js';
const cx = classNames.bind(styles);

const Info: React.FC = () => {
  const dispatch = useAppDispatch();
  const listTradingFee = useAppSelector((state) => state.tradingFee.list);

  React.useEffect(() => {
    dispatch(getTradingFee());
  }, [dispatch]);

  const [stellar, setStellar] = useState({
    market_order: false,
    limit_order: false,
    indexMarket: -1,
    indexLimit: -1,
  });
  const [bsc, setBSC] = useState({
    market_order: false,
    limit_order: false,
    indexMarket: -1,
    indexLimit: -1,
  });

  const handleEditMarketOrder = (name: string, index: number) => {
    if (name === 'Stellar') {
      setStellar({ ...stellar, market_order: true, indexMarket: index });
    } else if (name === 'BSC') {
      setBSC({ ...bsc, market_order: true, indexMarket: index });
    }
  };

  const handleEditLimitOrder = (name: string, index: number) => {
    if (name === 'Stellar') {
      setStellar({ ...stellar, indexLimit: index, limit_order: true });
    } else if (name === 'BSC') {
      setBSC({ ...bsc, indexLimit: index, limit_order: true });
    }
  };

  const makeNiceNumber = (value: number) => {
    const str = value.toString();
    let index = 0;
    for (let i = str.length - 1; i >= 0; i--) {
      if (str[i] !== '0') {
        index = i;
        break;
      }
    }
    return new BigNumber(str.slice(0, index + 1));
  };

  const handleCancel = (name: string, info: string) => {
    if (name === 'Stellar') {
      info === 'market_order'
        ? setStellar({
            ...stellar,
            indexMarket: -1,
            market_order: false,
          })
        : setStellar({
            ...stellar,
            limit_order: false,
            indexLimit: -1,
          });
    } else if (name === 'BSC') {
      info === 'market_order'
        ? setBSC({
            ...bsc,
            market_order: false,
            indexMarket: -1,
          })
        : setBSC({
            ...bsc,
            limit_order: false,
            indexLimit: -1,
          });
    }
  };
  return (
    <div className={cx('info-container')}>
      {listTradingFee.length > 0 &&
        listTradingFee.map((element, index) => (
          <div className={cx('element')} key={index}>
            <div className={cx('head-title')}>{element.name}</div>

            {(stellar.market_order || bsc.market_order) &&
            (stellar.indexMarket === index || bsc.indexMarket === index) ? (
              <EditTradingFee
                id={element.id}
                handleCancel={() => handleCancel(element.name, 'market_order')}
                value={makeNiceNumber(element.market_order).toNumber()}
                name={element.name}
                info="market_order"
                label="Market order"
              />
            ) : (
              <div className={cx('info')}>
                Market order {makeNiceNumber(element.market_order).times(100).decimalPlaces(4).toString()}%{' '}
                <img src={edit} onClick={() => handleEditMarketOrder(element.name, index)} />
              </div>
            )}

            {(stellar.limit_order || bsc.limit_order) && (stellar.indexLimit === index || bsc.indexLimit === index) ? (
              <EditTradingFee
                id={element.id}
                handleCancel={() => handleCancel(element.name, 'limit_order')}
                value={new BigNumber(makeNiceNumber(element.limit_order)).toNumber()}
                name={element.name}
                info="limit_order"
                label="Limit order"
              />
            ) : (
              <div className={cx('info')}>
                Limit order {makeNiceNumber(element.limit_order).times(100).decimalPlaces(4).toString()}%{' '}
                <img src={edit} onClick={() => handleEditLimitOrder(element.name, index)} />
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default Info;
