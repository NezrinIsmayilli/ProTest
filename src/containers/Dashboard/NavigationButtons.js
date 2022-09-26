import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Row, Col } from 'antd';
import { ProFilterButton, Can } from 'components/Lib';
import { permissions, accessTypes } from 'config/permissions';

const { read } = accessTypes;

const pathNameList = {
  sales: '/dashboard/commerce-and-finance',
  employees: '/dashboard/employees',
  jobs: '/dashboard/employees-search',
};

const NavigationButtons = props => {
  const { children } = props;
  const { pathname } = useLocation();

  return (
    <div>
      <Row gutter={32} type="flex" align="middle">
        <Col span={14}>
          <Can I={read} a={permissions.dashboard}>
            <Link to={pathNameList.sales}>
              <ProFilterButton active={pathname === pathNameList.sales}>
                Ticarət/Maliyyə
              </ProFilterButton>
            </Link>
          </Can>
        </Col>
        <Col span={10}>{children}</Col>
      </Row>
    </div>
  );
};

export default NavigationButtons;
