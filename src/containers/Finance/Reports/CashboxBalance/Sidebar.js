import React from 'react';

import {
    Sidebar as ProSidebar,
    ProSidebarItem,
    ProDatePicker,
    ProSelect,
    ProSearch,
    ProAsyncSelect,
} from 'components/Lib';
import moment from 'moment';

import { fullDateTimeWithSecond } from 'utils';

const Sidebar = props => {
    const {
        onFilter,
        businessUnits,
        ajaxBusinessUnitSelectRequest,
        filters,
        profile,
        businessUnitLength,
    } = props;

    return (
        <ProSidebar title="Hesab qalıqları">
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
            <ProSidebarItem label="Tarix">
                <ProDatePicker
                    defaultValue={moment()}
                    format={fullDateTimeWithSecond}
                    showToday
                    onChange={values =>
                        values
                            ? onFilter(
                                  'dateTime',
                                  moment(values).format(fullDateTimeWithSecond)
                              )
                            : onFilter('dateTime', undefined)
                    }
                />
            </ProSidebarItem>
            <ProSidebarItem label="Hesab növü">
                <ProSelect
                    mode="multiple"
                    onChange={e => onFilter('cashboxTypes', e)}
                    data={[
                        { id: 1, name: 'Nəğd' },
                        { id: 2, name: 'Bank Transferi' },
                        { id: 3, name: 'Kart ödənişi' },
                        { id: 4, name: 'Digər' },
                    ]}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Hesab ">
                <ProSearch onChange={e => {
                        if (e.target.value === '') {
                            onFilter('cashboxName', undefined);
                        }
                    }} onSearch={value => onFilter('cashboxName', value)} />
            </ProSidebarItem>
        </ProSidebar>
    );
};

export default Sidebar;
