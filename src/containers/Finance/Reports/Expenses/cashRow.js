import React from 'react';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import styles from './styles.module.scss';

export default function CashRow(props) {
  const { label, value, currency } = props;
  return (
    <div className={styles.cashInRow}>
      <span>{label}</span>
      <span>
        {formatNumberToLocale(defaultNumberFormat(value))} {currency}
      </span>
    </div>
  );
}
