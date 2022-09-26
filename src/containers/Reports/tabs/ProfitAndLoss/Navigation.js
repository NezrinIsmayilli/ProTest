import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ProFilterButton, Can } from 'components/Lib';
import { permissions, accessTypes } from 'config/permissions';

const { read } = accessTypes;

const mainPath = '/reports/profit-and-loss';

const pathNameList = {
  byMonth: `${mainPath}/by-month`,
  byQuarter: `${mainPath}/by-quarter`,
  byYear: `${mainPath}/by-year`,
};

const Tabs = ({ children }) => {
  const { pathname } = useLocation();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
      }}
    >
      <div>
        <div>
          <Can I={read} a={permissions.profit_and_loss_report}>
            <Link to={pathNameList.byMonth}>
              <ProFilterButton active={pathname === pathNameList.byMonth}>
                Aylar üzrə
              </ProFilterButton>
            </Link>
          </Can>

          <Can I={read} a={permissions.profit_and_loss_report}>
            <Link to={pathNameList.byQuarter}>
              <ProFilterButton active={pathname === pathNameList.byQuarter}>
                Rüblər üzrə
              </ProFilterButton>
            </Link>
          </Can>
          <Can I={read} a={permissions.profit_and_loss_report}>
            <Link to={pathNameList.byYear}>
              <ProFilterButton active={pathname === pathNameList.byYear}>
                İllər üzrə
              </ProFilterButton>
            </Link>
          </Can>
        </div>
      </div>
      {children}
    </div>
  );
};

const Navigation = Tabs;

export default Navigation;
