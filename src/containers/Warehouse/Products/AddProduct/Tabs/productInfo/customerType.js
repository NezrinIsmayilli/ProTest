import React from 'react';
import { Row, Col, Input } from 'antd';
import styles from '../../styles.module.scss';

const roundTo = require('round-to');

export function CustomerType(props) {
  const {
    currency,
    prices,
    setPrices,
    percentages,
    setPercentages,
    productPrice,
  } = props;

  const handlePercentageChange = value => {
    const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;

    if (value === '') {
      setPercentages({
        ...percentages,
        [currency.id]: null,
      });
      setPrices({
        ...prices,
        [currency.id]: null,
      });
    } else if (re.test(value) && Number(value) <= 100) {
      setPercentages({
        ...percentages,
        [currency.id]: value,
      });
      setPrices({
        ...prices,
        [currency.id]: Number(productPrice)
          ? roundTo((Number(productPrice) * Number(value)) / 100, 2)
          : null,
      });
    }
  };

  const handleAmountChange = value => {
    const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;

    if (value === '') {
      setPercentages({
        ...percentages,
        [currency.id]: null,
      });
      setPrices({
        ...prices,
        [currency.id]: null,
      });
    } else if (re.test(value) && value <= 1000000) {
      setPercentages({
        ...percentages,
        [currency.id]: productPrice
          ? roundTo((Number(value) * 100) / productPrice, 2)
          : null,
      });
      setPrices({
        ...prices,
        [currency.id]: value,
      });
    }
  };
  return (
    <div className={styles.customerTypeBox}>
      <label className={styles.customerTitle}>{currency.name}</label>
      <Row gutter={8}>
        <Col span={12}>
          <Input
            placeholder="Faiz"
            label="Faiz"
            value={percentages[currency.id]}
            onChange={event => handlePercentageChange(event.target.value)}
            className={styles.select}
            style={{ width: '100%' }}
            size="large"
          />
        </Col>
        <Col span={12}>
          <Input
            value={prices[currency.id]}
            onChange={event => handleAmountChange(event.target.value)}
            size="large"
            label="Qiymət"
            className={styles.select}
            style={{ width: '100%' }}
            placeholder="Qiymət"
          />
        </Col>
      </Row>
    </div>
  );
}
