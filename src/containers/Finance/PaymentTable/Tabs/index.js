import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ProFilterButton, Can } from 'components/Lib';
import { permissions, accessTypes } from 'config/permissions';

const { read } = accessTypes;

export const basePathName = '/finance/payment_table';

export const pathNameList = {
  credit_payments: `${basePathName}/credit_payments`,
  credits_table: `${basePathName}/credits_table`,
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
          <Can I={read} a={permissions.credit_payments}>
            <Link to={pathNameList.credit_payments}>
              <ProFilterButton
                active={pathname === pathNameList.credit_payments}
              >
                Ödənişlər
              </ProFilterButton>
            </Link>
          </Can>
          <Can I={read} a={permissions.credits_table}>
            <Link to={pathNameList.credits_table}>
              <ProFilterButton active={pathname === pathNameList.credits_table}>
                Cədvəllər
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
