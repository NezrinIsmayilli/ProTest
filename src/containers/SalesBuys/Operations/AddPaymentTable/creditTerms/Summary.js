import React from 'react';
import { Spin } from 'antd';
import { defaultNumberFormat, formatNumberToLocale, round } from 'utils';
import styles from '../styles.module.scss';

const SummaryComponent = props => {
  const { label, value, percent, loading, mainCurrency } = props;
  return (
    <div className={styles.Summary} style={{ margin: '20px 0' }}>
      <div className={styles.container}>
        <label className={styles.label}>{label}</label>
        <span className={styles.value}>
          {value < 0 || value >= 0 ? (
            formatNumberToLocale(defaultNumberFormat(value))
          ) : (
            <Spin spinning={loading}></Spin>
          )}{' '}
          {mainCurrency}{' '}
        </span>
      </div>
      <div className={styles.percent}>
        <span>{formatNumberToLocale(round(percent))} %</span>
      </div>
    </div>
  );
};
export const Summary = SummaryComponent;
