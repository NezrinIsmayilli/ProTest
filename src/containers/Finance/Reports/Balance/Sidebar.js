import React from 'react';
import {
    Sidebar as ProSidebar,
    ProSidebarItem,
    ProSelect,
    ProAsyncSelect,
} from 'components/Lib';

const Sidebar = props => {
    const {
        balanceReport,
        employees,
        onFilter,
        businessUnits,
        ajaxBusinessUnitSelectRequest,
        filters,
        profile,
        businessUnitLength,
    } = props;

    const handleCounterpartyFilter = tenantIds => {
        onFilter('tenantPersons', tenantIds);
    };

    return (
        <ProSidebar title="Təsisçi pulları">
            {businessUnitLength === 1 &&
            profile.businessUnits.length === 0 ? null : (
                <ProSidebarItem label="Biznes blok">
                    <ProAsyncSelect
                        mode="multiple"
                        selectRequest={ajaxBusinessUnitSelectRequest}
                        valueOnChange={values => {
                            onFilter('businessUnitIds', values);
                        }}
                        disabled={businessUnitLength === 1}
                        data={businessUnits?.map(item =>
                            item.id === null ? { ...item, id: 0 } : item
                        )}
                        disabledBusinessUnit={businessUnitLength === 1}
                        value={
                            businessUnitLength === 1
                                ? businessUnits[0]?.id === null
                                    ? businessUnits[0]?.name
                                    : businessUnits[0]?.id
                                : filters.businessUnitIds
                        }
                    />
                </ProSidebarItem>
            )}
            <ProSidebarItem label="Təsisçi">
                <ProSelect
                    data={employees.filter(({ id }) =>
                        balanceReport
                            ?.map(({ tenantPersonId }) => tenantPersonId)
                            .includes(id)
                    )}
                    mode="multiple"
                    onChange={handleCounterpartyFilter}
                    keys={['name', 'lastName', 'patronymic']}
                    allowClear
                />
            </ProSidebarItem>
        </ProSidebar>
    );
};

export default Sidebar;
