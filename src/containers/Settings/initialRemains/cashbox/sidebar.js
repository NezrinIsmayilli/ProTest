import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
    ProSidebarItem,
    ProDateRangePicker,
    ProSelect,
    ProSearch,
} from 'components/Lib';
import { fetchCashboxBalanceReport } from 'store/actions/finance/reports';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { useFilterHandle } from 'hooks/useFilterHandle';
import moment from 'moment';

import { accountTypeOptions } from 'utils';

const InitialRemainsWarehouseSideBar = props => {
    const {
        fetchCashboxBalanceReport,
        profile,
        fetchBusinessUnitList,
        businessUnits,
    } = props;

    const url = new URL(window.location.href);

    const [filters, onFilter] = useFilterHandle(
        {
            transactionTypes: [14],
            cashboxName: undefined,
            dateFrom: undefined,
            dateTime: undefined,
            cashboxTypes: [],
            businessUnitIds:
                businessUnits?.length === 1
                    ? businessUnits[0]?.id !== null
                        ? [businessUnits[0]?.id]
                        : undefined
                    : undefined,
        },
        ({ filters }) => {
            fetchCashboxBalanceReport({
                filters,
                forInitial: true,
            });
        }
    );

    useEffect(() => {
        fetchBusinessUnitList({
            filters: {
                isDeleted: 0,
                businessUnitIds: profile.businessUnits?.map(({ id }) => id),
            },
        });
    }, []);

    const addParamsToUrl = (key, value) => {
        if (Array.isArray(value)) {
            url.searchParams.set(`${key}`, value);
        } else {
            url.searchParams.set(key, value);
        }
        window.history.replaceState(null, null, url);
    };

    const handleDatePicker = (startValue, endValue) => {
        const startDate = startValue
            ? moment(startValue)
                  .startOf('day')
                  .format('DD-MM-YYYY HH:mm:ss')
            : undefined;
        const endDate = endValue
            ? moment(endValue)
                  .endOf('day')
                  .format('DD-MM-YYYY HH:mm:ss')
            : undefined;
        onFilter('dateFrom', startDate);
        onFilter('dateTime', endDate);
    };

    return (
        <>
            {businessUnits?.length === 1 &&
            profile?.businessUnits?.length === 0 ? null : (
                <ProSidebarItem label="Biznes blok">
                    <ProSelect
                        mode="multiple"
                        onChange={values => {
                            addParamsToUrl('businessUnitIds', values);
                            onFilter('businessUnitIds', values);
                        }}
                        value={
                            businessUnits?.length === 1
                                ? businessUnits[0]?.id === null
                                    ? businessUnits[0]?.name
                                    : businessUnits[0]?.id
                                : filters?.businessUnitIds
                        }
                        disabled={businessUnits?.length === 1}
                        data={businessUnits?.map(item =>
                            item.id === null ? { ...item, id: 0 } : item
                        )}
                        disabledBusinessUnit={businessUnits?.length === 1}
                    />
                </ProSidebarItem>
            )}
            <ProSidebarItem label="İlkin qalıq tarixi">
                <ProDateRangePicker
                    placeholderStart="Başlama"
                    placeholderEnd="Bitmə"
                    getCalendarContainer={trigger =>
                        trigger.parentNode.parentNode
                    }
                    onChangeDate={handleDatePicker}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Hesab növü">
                <ProSelect
                    mode="multiple"
                    data={accountTypeOptions}
                    size="large"
                    hasError={false}
                    showFirstOption={false}
                    onChange={e => onFilter('cashboxTypes', e)}
                />
            </ProSidebarItem>

            <ProSidebarItem label="Hesab">
                <ProSearch
                    onSearch={value => onFilter('cashboxName', value)}
                    onChange={e => {
                        if (e.target.value === '') {
                            onFilter('cashboxName', undefined);
                        }
                    }}
                    // onChange={(e, value) => handleChange(e, value)}
                />
            </ProSidebarItem>
        </>
    );
};

const mapStateToProps = state => ({
    tenant: state.tenantReducer.tenant,
    permissionsList: state.permissionsReducer.permissions,
    businessUnits: state.businessUnitReducer.businessUnits,
    profile: state.profileReducer.profile,
});

export default connect(
    mapStateToProps,
    { fetchCashboxBalanceReport, fetchBusinessUnitList }
)(InitialRemainsWarehouseSideBar);
