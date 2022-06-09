/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable max-len */
import _, { values } from 'lodash';
import React, { useEffect, useState, ChangeEvent } from 'react';
import { CSelect } from 'src/components/Base/Select';
import styles from './Transaction.module.scss';
import classnames from 'classnames/bind';
import {
  HISTORY_TYPES,
  ModeDisplay,
  HIS_TYPE_ID,
  HISTORY_TYPE,
} from 'src/features/User/components/Transactions/Constant';
import { useParams } from 'react-router-dom';
import { OpenOrder } from './OpenOrder';
import { OrderHistory } from './OrderHistory';
import { TradeHistory } from './TradeHistory';
import useReturnUrl from 'src/hooks/useReturnUrl';
const cx = classnames.bind(styles);

export const getFilterSize = (modeDisplay: ModeDisplay): 'md' | 'lg' => {
  if (modeDisplay === ModeDisplay.user || modeDisplay === ModeDisplay.admin) {
    return 'lg';
  }
  return 'md';
};

interface ParamTypes {
  userId: string;
}

const urlRedirectPage = useReturnUrl();
export const renderFowardUrl = (
  element: JSX.Element,
  { url = urlRedirectPage, path, key }: { url?: string; path: string; key?: string },
): JSX.Element => {
  return (
    <a key={key} target="_blank" rel="noopener noreferrer" href={url + path} style={{ textDecoration: 'none' }}>
      {element}
    </a>
  );
};

const Transactions: React.FC = () => {
  const { userId } = useParams<ParamTypes>();
  const [historyType, setHistoryType] = useState(HIS_TYPE_ID.OPEN_ORDER);
  return (
    <div>
      <div className={cx('select-element')}>
        <label>History type: </label>
        <CSelect
          options={HISTORY_TYPES}
          defaultValue={HISTORY_TYPES[0]}
          onChange={(value) => {
            setHistoryType(value);
          }}
        />
      </div>
      <div className={cx('table-info')}>
        {historyType === HIS_TYPE_ID.OPEN_ORDER && (
          <>
            <h3>{HISTORY_TYPE.OPEN_ORDER}</h3>
            <OpenOrder userId={userId} modeDisplay={ModeDisplay.user} limitRecord={10} />
          </>
        )}
        {historyType === HIS_TYPE_ID.ORDER_HISTORY && (
          <>
            <h3>{HISTORY_TYPE.ORDER_HISTORY}</h3>
            <OrderHistory userId={userId} modeDisplay={ModeDisplay.user} limitRecord={10} />
          </>
        )}
        {historyType === HIS_TYPE_ID.TRADE_HISTORY && (
          <>
            <h3>{HISTORY_TYPE.TRADE_HISTORY}</h3>
            <TradeHistory userId={userId} modeDisplay={ModeDisplay.user} limitRecord={10} />
          </>
        )}
      </div>
    </div>
  );
};

export default Transactions;
