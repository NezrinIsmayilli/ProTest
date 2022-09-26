import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ProTypeFilterButton } from 'components/Lib';
import { Col, Row } from 'antd';

const mainPath = '/call-center/reports/main_indicators';

const pathNameList = {
  days: `${mainPath}/days`,
  month: `${mainPath}/month`,
  quarter: `${mainPath}/quarter`,
};

const Tabs = ({ children }) => {
  const { pathname } = useLocation();

  return (
    <div>
      <div style={{ padding: '10px 24px' }}>
        <Row gutter={[6, 6]} style={{ marginTop: '8px' }}>
          <Col span={8}>
            <Link to={pathNameList.days}>
              <ProTypeFilterButton
                label="Gün"
                isActive={pathname === pathNameList.days}
              />
            </Link>
          </Col>

          <Col span={8}>
            <Link to={pathNameList.month}>
              <ProTypeFilterButton
                label="Ay"
                isActive={pathname === pathNameList.month}
              />
            </Link>
          </Col>

          <Col span={8}>
            <Link to={pathNameList.quarter}>
              <ProTypeFilterButton
                label="Rüb"
                isActive={pathname === pathNameList.quarter}
              />
            </Link>
          </Col>
        </Row>
      </div>
      {children}
    </div>
  );
};

const Navigation = Tabs;

export default Navigation;
