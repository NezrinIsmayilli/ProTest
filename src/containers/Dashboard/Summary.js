import React from 'react';
import { Spin } from 'antd';
import { defaultNumberFormat, formatNumberToLocale } from 'utils';
import styles from './styles.module.scss';

export default function Summary(props) {
  const { label, value, loading, mainCurrency } = props;
  return (
    <div className={styles.Summary} style={{ margin: '20px 0' }}>
      <div className={styles.container}>
        <label className={styles.label}>{label}</label>
        <span
          className={styles.value}
          style={Number(value) > 0 ? { color: 'green' } : { color: 'red' }}
        >
          {value < 0 || value >= 0 ? (
            formatNumberToLocale(defaultNumberFormat(value))
          ) : (
            <Spin spinning={loading}></Spin>
          )}{' '}
          {mainCurrency?.code}{' '}
        </span>
      </div>
    </div>
  );
}
