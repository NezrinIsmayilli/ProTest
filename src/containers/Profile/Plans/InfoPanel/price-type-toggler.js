import React from 'react';

import { Row, Col, Button } from 'antd';

import { usePlansContext } from '../plans-context';

function PriceTypeToggler() {
  const { priceTypeChangeHandle, priceType, editMode } = usePlansContext();

  if (!editMode) {
    return null;
  }

  return (
    <Row gutter={16}>
      <Col span={12}>
        <Button
          onClick={() => priceTypeChangeHandle('priceMonthly')}
          type={priceType === 'priceMonthly' ? 'primary' : 'default'}
          size="large"
          block
        >
          Aylıq
        </Button>
      </Col>

      <Col span={12}>
        <Button
          onClick={() => priceTypeChangeHandle('priceYearly')}
          type={priceType === 'priceYearly' ? 'primary' : 'default'}
          size="large"
          block
        >
          İllik
        </Button>
      </Col>
    </Row>
  );
}

export default PriceTypeToggler;
