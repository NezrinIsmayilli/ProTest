import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Row, Col } from 'antd';
import { ProFilterButton, Can } from 'components/Lib';

import { permissions, accessTypes } from 'config/permissions';

const { read } = accessTypes;

export const basePathName = '/hrm/attendance';

export const pathNameList = {
  timecard: `${basePathName}/attendance-journal`,
  work_schedule: `${basePathName}/work-schedule`,
  calendar: `${basePathName}/production-calendar`,
};

export function NavigationButtons(props) {
  const { children } = props;
  const { pathname } = useLocation();

  return (
    <Row gutter={32} type="flex" align="middle" style={{ marginBottom: 16 }}>
      <Col span={18}>
        <Can I={read} a={permissions.calendar}>
          <Link to={pathNameList.calendar}>
            <ProFilterButton active={pathname === pathNameList.calendar}>
              İstehsalat təqvimi
            </ProFilterButton>
          </Link>
        </Can>
        <Can I={read} a={permissions.timecard}>
          <Link to={pathNameList.timecard}>
            <ProFilterButton active={pathname === pathNameList.timecard}>
              Davamiyyət jurnalı
            </ProFilterButton>
          </Link>
        </Can>
        <Can I={read} a={permissions.work_schedule}>
          <Link to={pathNameList.work_schedule}>
            <ProFilterButton active={pathname === pathNameList.work_schedule}>
              İş rejimi
            </ProFilterButton>
          </Link>
        </Can>
      </Col>
      {children}
    </Row>
  );
}
