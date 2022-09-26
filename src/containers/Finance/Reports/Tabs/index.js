import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ProFilterButton, Can } from 'components/Lib';
import { permissions, accessTypes } from 'config/permissions';

const { read } = accessTypes;

export const basePathName = '/finance/reports';

export const pathNameList = {
  expense_report: `${basePathName}/expenses`,
  advance_report: `${basePathName}/advances`,
  employee_payment_report: `${basePathName}/employees`,
  balance_creation_report: `${basePathName}/balances`,
  currency_history_report: `${basePathName}/currencies`,
  cashbox_balance_report: `${basePathName}/cashbox-balance`,
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
          <Can I={read} a={permissions.expense_report}>
            <Link to={pathNameList.expense_report}>
              <ProFilterButton
                active={pathname === pathNameList.expense_report}
              >
                Pul axınları
              </ProFilterButton>
            </Link>
          </Can>
          <Can I={read} a={permissions.advance_report}>
            <Link to={pathNameList.advance_report}>
              <ProFilterButton
                active={pathname === pathNameList.advance_report}
              >
                Avanslar
              </ProFilterButton>
            </Link>
          </Can>

          <Can I={read} a={permissions.employee_payment_report}>
            <Link to={pathNameList.employee_payment_report}>
              <ProFilterButton
                active={pathname === pathNameList.employee_payment_report}
              >
                Təhtəl hesab
              </ProFilterButton>
            </Link>
          </Can>
          <Can I={read} a={permissions.balance_creation_report}>
            <Link to={pathNameList.balance_creation_report}>
              <ProFilterButton
                active={pathname === pathNameList.balance_creation_report}
              >
                Təsisçi pulları
              </ProFilterButton>
            </Link>
          </Can>
          <Can I={read} a={permissions.currency_history_report}>
            <Link to={pathNameList.currency_history_report}>
              <ProFilterButton
                active={pathname === pathNameList.currency_history_report}
              >
                Valyuta tarixçəsi
              </ProFilterButton>
            </Link>
          </Can>
          <Can I={read} a={permissions.cashbox_balance_report}>
            <Link to={pathNameList.cashbox_balance_report}>
              <ProFilterButton
                active={pathname === pathNameList.cashbox_balance_report}
              >
                Hesab qalıqları
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
