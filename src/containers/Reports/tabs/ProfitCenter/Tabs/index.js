import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ProFilterButton, Can } from 'components/Lib';
import { permissions, accessTypes } from 'config/permissions';

const { read } = accessTypes;

export const basePathName = '/reports/profit_center';

export const pathNameList = {
  profit_center_contracts: `${basePathName}/profit_center_contracts`,
};

const Tabs = ({ children }) => {
  const { pathname } = useLocation();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <div>
          <Can I={read} a={permissions.profit_center_contracts}>
            <Link to={pathNameList.profit_center_contracts}>
              <ProFilterButton
                active={pathname === pathNameList.profit_center_contracts}
              >
                Müqavilələr
              </ProFilterButton>
            </Link>
          </Can>
        </div>
      </div>
      {children}
    </div>
  );
};

const ReportTabs = Tabs;

export default ReportTabs;
