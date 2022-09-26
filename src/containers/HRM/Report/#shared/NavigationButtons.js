import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Row, Col } from 'antd';
import { ProFilterButton, Can } from 'components/Lib';

import { permissions, accessTypes } from 'config/permissions';

const { read } = accessTypes;

export const basePathName = '/hrm/report';

export const pathNameList = {
  salary: `${basePathName}/salary`,
  worktimerecord: `${basePathName}/work-time-record`,
  fines: `${basePathName}/fines`,
};

export function NavigationButtons() {
  const { pathname } = useLocation();

  return (
    <Row gutter={32} type="flex" align="middle">
      <Col span={18}>
        <Can I={read} a={permissions.lateness_report}>
          <Link to={pathNameList.fines}>
            <ProFilterButton active={pathname === pathNameList.fines}>
              Cərimələr
            </ProFilterButton>
          </Link>
        </Can>

        <Can I={read} a={permissions.payroll}>
          <Link to={pathNameList.salary}>
            <ProFilterButton active={pathname === pathNameList.salary}>
              Əməkhaqqı
            </ProFilterButton>
          </Link>
        </Can>

        <Can I={read} a={permissions.timecard_report}>
          <Link to={pathNameList.worktimerecord}>
            <ProFilterButton active={pathname === pathNameList.worktimerecord}>
              İş vaxtının uçotu
            </ProFilterButton>
          </Link>
        </Can>
      </Col>
    </Row>
  );
}
