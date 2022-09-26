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

export function NavigationButtons({ children }) {
  const { pathname } = useLocation();

  return (
    <Row gutter={32} type="flex" align="middle">
      <Col span={18}>
        <div>
          <div>
            <Can I={read} a={permissions.hrm_working_employees}>
              <Link to={pathNameList.workers}>
                <ProFilterButton active={pathname === pathNameList.workers}>
                  İşcilər
                </ProFilterButton>
              </Link>
            </Can>
            <Can I={read} a={permissions.hrm_activities}>
              <Link to={pathNameList.operations}>
                <ProFilterButton active={pathname === pathNameList.operations}>
                  Əməliyyatlar
                </ProFilterButton>
              </Link>
            </Can>

            <Can I={read} a={permissions.hrm_fired_employees}>
              <Link to={pathNameList.dismissedPeople}>
                <ProFilterButton
                  active={pathname === pathNameList.dismissedPeople}
                >
                  Azad olunanlar
                </ProFilterButton>
              </Link>
            </Can>
          </div>
        </div>
      </Col>
      {children}
    </Row>
  );
}
