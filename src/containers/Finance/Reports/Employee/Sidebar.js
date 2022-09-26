import React from 'react';
import {
    Sidebar as ProSidebar,
    ProSidebarItem,
    ProSelect,
    ProAsyncSelect,
} from 'components/Lib';

const Sidebar = props => {
    const {
        employeeReport,
        workers,
        onFilter,
        businessUnits,
        ajaxBusinessUnitSelectRequest,
        filters,
        profile,
        businessUnitLength,
    } = props;

    const handleEmployeeFilter = employeeIds => {
        onFilter('employees', employeeIds);
    };

    return (
        <ProSidebar title="Təhtəl hesab">
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
            <ProSidebarItem label="Əməkdaş">
                <ProSelect
                    data={workers.filter(({ id }) =>
                        employeeReport
                            ?.map(({ employeeId }) => employeeId)
                            .includes(id)
                    )}
                    mode="multiple"
                    onChange={handleEmployeeFilter}
                    keys={['name', 'surname', 'patronymic']}
                    allowClear
                />
            </ProSidebarItem>
        </ProSidebar>
    );
};

export default Sidebar;
