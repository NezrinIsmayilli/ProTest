import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ProFilterButton, Can } from 'components/Lib';
import { permissions, accessTypes } from 'config/permissions';

const { read } = accessTypes;

export const basePathName = '/finance/sales_bonus';

export const pathNameList = {
  employee_sales_bonus_configuration: `${basePathName}/employee_bonus`,
  sales_bonus_configuration: `${basePathName}/sales_bonus_configuration`,
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
          <Can I={read} a={permissions.employee_sales_bonus_configuration}>
            <Link to={pathNameList.employee_sales_bonus_configuration}>
              <ProFilterButton
                active={
                  pathname === pathNameList.employee_sales_bonus_configuration
                }
              >
                Əməkdaşlar üzrə bonuslar
              </ProFilterButton>
            </Link>
          </Can>
          <Can I={read} a={permissions.sales_bonus_configuration}>
            <Link to={pathNameList.sales_bonus_configuration}>
              <ProFilterButton
                active={pathname === pathNameList.sales_bonus_configuration}
              >
                Tənzimləmələr
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
