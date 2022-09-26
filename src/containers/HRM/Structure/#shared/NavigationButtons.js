import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Row, Col } from 'antd';
import { ProFilterButton, Can } from 'components/Lib';

import { permissions, accessTypes } from 'config/permissions';

const { read } = accessTypes;

export const basePathName = '/hrm/structure';

export const pathNameList = {
  sections: `${basePathName}/sections`,
  positions: `${basePathName}/positions`,
  tree: `${basePathName}/tree`,
};

export default function NavigationButtons(props) {
  const { children } = props;
  const { pathname } = useLocation();

  return (
    <div style={{ marginBottom: 24 }}>
      <Row gutter={32} type="flex" align="middle">
        <Col span={14}>
          <div>
            <div>
              <Can I={read} a={permissions.structure}>
                <Link to={pathNameList.sections}>
                  <ProFilterButton active={pathname === pathNameList.sections}>
                    Bölmələr
                  </ProFilterButton>
                </Link>
              </Can>
              <Can I={read} a={permissions.occupation}>
                <Link to={pathNameList.positions}>
                  <ProFilterButton active={pathname === pathNameList.positions}>
                    Vəzifələr
                  </ProFilterButton>
                </Link>
              </Can>
              <Can I={read} a={permissions.occupation}>
                <Link to={pathNameList.tree}>
                  <ProFilterButton active={pathname === pathNameList.tree}>
                    Təşkilati struktur
                  </ProFilterButton>
                </Link>
              </Can>
            </div>
          </div>
        </Col>
        {children}
      </Row>
    </div>
  );
}
