import React from 'react';
import {
    Sidebar as ProSidebar,
    ProSidebarItem,
    ProAsyncSelect,
} from 'components/Lib';

const Sidebar = props => {
    const {
        contacts,
        onFilter,
        businessUnits,
        ajaxBusinessUnitSelectRequest,
        ajaxSelectRequest,
        filters,
        profile,
        businessUnitLength,
    } = props;

    return (
        <ProSidebar title="Avanslar">
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
            <ProSidebarItem label="Qarşı tərəf">
                <ProAsyncSelect
                    mode="multiple"
                    keys={['name', 'surname', 'patronymic']}
                    selectRequest={ajaxSelectRequest}
                    data={contacts}
                    allowClear
                    valueOnChange={value => onFilter('contacts', value)}
                />
            </ProSidebarItem>
        </ProSidebar>
    );
};

export default Sidebar;
