import React from 'react';
import styles from './styles.module.scss';

export function MoneyBalance(props) {
  const { label, balance } = props;

  return (
    <div className={styles.subSelect}>
      <strong className={styles.subLabel}>{label}</strong>
      <strong className={styles.valueSuccess}>{balance}</strong>
    </div>
  );
}
