import React from 'react';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import styles from '../styles.module.scss';

export function CustomerTypeDetail(props) {
  const { currency, name, price, discount } = props;
  return (
    <div className={styles.customerTypeDetail}>
      <span>{name}</span>

      <ul>
        <li>
          <span>Qiymət:</span>
          <span>
            {formatNumberToLocale(defaultNumberFormat(price))}&nbsp;{currency}
          </span>
        </li>
        <li>
          <span>Endirim:</span>
          <span>
            {formatNumberToLocale(defaultNumberFormat(discount))}&nbsp;{'%'}
          </span>
        </li>
      </ul>
    </div>
  );
}
