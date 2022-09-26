import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ProFilterButton, Can } from 'components/Lib';
import { permissions, accessTypes } from 'config/permissions';

const { read } = accessTypes;

export const basePathName = '/call-center/reports';

export const pathNameList = {
    statistics_of_operators: `${basePathName}/operator_reports`,
    supervisor_panel: `${basePathName}/supervisor_panel`,
    procall_status_history: `${basePathName}/procall_status_history`,
    main_indicators: `${basePathName}/main_indicators`,
    days: `${basePathName}/main_indicators/days`,
    month: `${basePathName}/main_indicators/month`,
    quarter: `${basePathName}/main_indicators/quarter`,
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
                    <Can I={read} a={permissions.statistics_of_operators}>
                        <Link to={pathNameList.statistics_of_operators}>
                            <ProFilterButton
                                active={
                                    pathname ===
                                    pathNameList.statistics_of_operators
                                }
                            >
                                Operatorların statistikası
                            </ProFilterButton>
                        </Link>
                    </Can>
                    <Can I={read} a={permissions.supervisor_panel}>
                        <Link to={pathNameList.supervisor_panel}>
                            <ProFilterButton
                                active={
                                    pathname === pathNameList.supervisor_panel
                                }
                            >
                                Supervayzer paneli
                            </ProFilterButton>
                        </Link>
                    </Can>
                    <Can I={read} a={permissions.procall_status_history}>
                        <Link to={pathNameList.procall_status_history}>
                            <ProFilterButton
                                active={
                                    pathname ===
                                    pathNameList.procall_status_history
                                }
                            >
                                Status tarixçəsi
                            </ProFilterButton>
                        </Link>
                    </Can>

                    {/* <Can I={read} a={permissions.main_indicators}>
                        <Link to={pathNameList.main_indicators}>
                            <ProFilterButton
                                active={
                                    pathname === pathNameList.main_indicators ||
                                    pathname === pathNameList.days ||
                                    pathname === pathNameList.month ||
                                    pathname === pathNameList.quarter
                                }
                            >
                                Əsas göstəricilər
                            </ProFilterButton>
                        </Link>
                    </Can> */}
                </div>
            </div>
            {children}
        </div>
    );
};

const CallTabs = Tabs;

export default CallTabs;
