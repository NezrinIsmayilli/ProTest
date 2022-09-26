import React from 'react';
import { Result } from 'antd';
import { MyLayout, Col, Row } from 'components/Lib';

export default function NotFound() {
  return (
    <MyLayout>
      <Row>
        <Col>
          <Result
            style={{ paddingTop: 100 }}
            status="404"
            title="404"
            subTitle="Səhifə tapılmadı."
          />
        </Col>
      </Row>
    </MyLayout>
  );
}
