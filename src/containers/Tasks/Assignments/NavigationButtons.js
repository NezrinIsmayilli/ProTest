import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Row, Col } from 'antd';
import { ProFilterButton, Can } from 'components/Lib';
import { permissions, accessTypes } from 'config/permissions';

const { read } = accessTypes;

export const basePathName = '/hrm/employees';

export const pathNameList = {
  workers: `${basePathName}/workers`,
  users: `${basePathName}/users`,
  dismissedPeople: `${basePathName}/dismissed-people`,
  operations: `${basePathName}/operations`,
};

const NavigationButtons = props => {
  const { type, onChange, children } = props;

  return (
    <Row gutter={32} type="flex" align="middle" style={{ margin: '15px 5px' }}>
      <Col span={16} >
        <div>
          <div>
            <ProFilterButton
              active={type === 'daily'}
              onClick={() => onChange('daily')}
            >
              Mənim tapşırıqlarım
            </ProFilterButton>
            <ProFilterButton
              active={type === 'assigned'}
              onClick={() => onChange('assigned')}
            >
              Təyin etdiklərim
            </ProFilterButton>

            <ProFilterButton
              active={type === 'delayed'}
              onClick={() => onChange('delayed')}
            >
              Müddəti bitənlər
            </ProFilterButton>
            <ProFilterButton
              active={type === 'projects'}
              onClick={() => onChange('projects')}
            >
              Layihələr
            </ProFilterButton>
          </div>
        </div>
      </Col>
      <Col span={8} align="end">
        {children}
      </Col>
    </Row>
  );
};

export default NavigationButtons;
