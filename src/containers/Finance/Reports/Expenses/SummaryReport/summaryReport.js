import React from 'react';
import { Col, Row, Spin } from 'antd';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import styles from '../styles.module.scss';

const Summary = ({ value, subtitle, currency }) => {
  return (
    <div className={styles.summaryBox}>
      <span className={styles.value}>
        {formatNumberToLocale(defaultNumberFormat(value || 0))}{' '}
        {currency || '-'}
      </span>
      <span className={styles.caption}>{subtitle}</span>
    </div>
  );
};
export default function SummaryReport(props) {
  const { currency, bop, rop, eop, loading } = props;

  return (
    <Spin spinning={loading}>
      <Row gutter={12} style={{ marginTop: 12 }}>
        <Col xl={8} xxl={8}>
          <Summary currency={currency} value={bop} subtitle="Dövrün əvvəlinə" />
        </Col>
        <Col xl={8} xxl={8}>
          <Summary currency={currency} value={rop} subtitle="Dövrün nəticəsi" />
        </Col>
        <Col xl={8} xxl={8}>
          <Summary currency={currency} value={eop} subtitle="Dövrün sonuna" />
        </Col>
      </Row>
    </Spin>
  );
}
