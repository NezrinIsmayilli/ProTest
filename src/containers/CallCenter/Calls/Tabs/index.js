import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ProFilterButton, Can } from 'components/Lib';
import { permissions, accessTypes } from 'config/permissions';

const { read } = accessTypes;

export const basePathName = '/call-center/calls';

export const pathNameList = {
  missed_calls: `${basePathName}/missed_calls`,
  answered_calls: `${basePathName}/answered_calls`,
  internal_calls: `${basePathName}/internal_calls`,
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
          <Can I={read} a={permissions.missed_calls}>
            <Link to={pathNameList.missed_calls}>
              <ProFilterButton
                active={pathname === pathNameList.missed_calls}
              >
                Buraxılmış
              </ProFilterButton>
            </Link>
          </Can>
          <Can I={read} a={permissions.answered_calls}>
            <Link to={pathNameList.answered_calls}>
              <ProFilterButton
                active={
                  pathname === pathNameList.answered_calls
                }
              >
                İcra edilmiş
              </ProFilterButton>
            </Link>
          </Can>
          <Can I={read} a={permissions.internal_calls}>
            <Link to={pathNameList.internal_calls}>
              <ProFilterButton
                active={
                  pathname === pathNameList.internal_calls
                }
              >
                Daxili
              </ProFilterButton>
            </Link>
          </Can>
        </div>
      </div>
      {children}
    </div>
  );
};

const CallTabs = Tabs;

export default CallTabs;
