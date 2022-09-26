import React from 'react';
import { Spin, Row, Col } from 'antd';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';

export default function Summary(props) {
  const { label, loading = false, data, children, mainCurrency } = props;
  const { t } = useTranslation();
  return (
    <div className={styles.Indicators} style={{ margin: '20px 0' }}>
      <Row className={styles.header} gutter={32} type="flex" align="middle">
        {label === 'dashboard:financialIndicators' ? (
          <>
            <Col span={12}>{t(label)}</Col>
            <Col span={12}>{children}</Col>
          </>
        ) : (
          <>
            <Col span={16}>{t(label)}</Col>
            <Col span={8}>{children}</Col>
          </>
        )}
      </Row>
      <Spin spinning={loading}>
        {data.map(({ label, value, icon }) => (
          <div className={styles.field}>
            <div className={styles.report}>
              <span
                className={styles.report__value}
                style={
                  Number(value) > 0 ? { color: 'green' } : { color: 'red' }
                }
              >
                {label === 'dashboard:margin' && value ? (
                  parseFloat(value).toFixed(2)
                ) : value || 0 ? (
                  formatNumberToLocale(defaultNumberFormat(value))
                ) : (
                  <Spin spinning={loading}></Spin>
                )}{' '}
                {label === 'dashboard:margin' ? '%' : mainCurrency?.code}{' '}
              </span>
              <label className={styles.report__name}>{t(label)}</label>
            </div>

            <div className={styles.icon__container}>{icon}</div>
          </div>
        ))}
      </Spin>
    </div>
  );
}
