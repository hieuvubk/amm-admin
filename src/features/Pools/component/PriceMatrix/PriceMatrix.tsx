import React from 'react';
import classNames from 'classnames/bind';
import styles from './PriceMatrix.module.scss';
import { getPrice } from 'src/pages/CreatePoolRequest/helpers/internalPrice';

const cx = classNames.bind(styles);

interface Props {
  tokens: Array<{ symbol: string; balance: string; weight: string }>;
}

const PriceMatrix: React.FC<Props> = ({ tokens }) => {
  return (
    <table className={cx('price-matrix-table')}>
      <thead>
        <tr>
          <th>Asset 2\ Asset 1</th>
          {tokens.map((token) => (
            <th key={token.symbol}>{token.symbol}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tokens.map((token1) => (
          <tr key={token1.symbol}>
            <td>{token1.symbol}</td>
            {tokens.map((token2) => {
              return <td key={token2.symbol}>{getPrice(token1, token2)}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PriceMatrix;
