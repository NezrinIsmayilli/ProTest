import React, { useState, useEffect } from 'react';

import { connect } from 'react-redux';
import moment from 'moment';
import {
    Sidebar,
    ProDateRangePicker,
    ProInput,
    ProSidebarItem,
    ProSelect,
    ProTypeFilterButton,
} from 'components/Lib';
import { Row, Col } from 'antd';
import { fetchUsedCallOperators } from 'store/actions/calls/internalCalls';

const CallSidebar = ({
    profile,
    fetchUsedCallOperators,
    credential,
    onFilter,
    filters,
    usedOperators,
    handleChange
}) => {
    const [statusGroupFilter, setStatusGroupFilter] = useState(filters.statusDriection? Number(filters.statusDriection):1);
    const [statuses, setStatuses] = useState([]);
    const statusData = [
        { id: 1, name: 'Cavablandırılmış' },
        { id: 2, name: 'Buraxılmış' },
    ];
    useEffect(() => {
        if (usedOperators.length === 0) fetchUsedCallOperators();
    }, [fetchUsedCallOperators, usedOperators.length]);

    const handleDatePicker = (startValue, endValue) => {
        handleChange(1);
        const startDate = startValue
            ? moment(startValue).format('DD-MM-YYYY')
            : undefined;
        const endDate = endValue
            ? moment(endValue).format('DD-MM-YYYY')
            : undefined;
        onFilter('dateFrom', startDate);
        onFilter('dateTo', endDate);
    };

    const handleStatusFilter = ids => {
        handleChange(1);
        setStatuses(ids);
        onFilter('statuses', ids);
    };

    const handleStageGroupFilter = id => {
        handleChange(1);
        onFilter("statusDriection",id)
        if (id === 1) {
            onFilter('fromNumber', undefined);
            onFilter('toNumber', undefined);
        }
        if (id === 2) {
            onFilter('toNumber', credential?.number);
            onFilter('fromNumber', undefined);
        }
        if (id === 3) {
            onFilter('fromNumber', credential?.number);
            onFilter('toNumber', undefined);
        }
        setStatusGroupFilter(id);
    };


    useEffect(() => {
        handleChange(filters.page? filters.page:1);
      },[]);
    return (
        <Sidebar title="Çağrı mərkəzi">
            <ProSidebarItem label="İstiqamət">
                <Row gutter={2} style={{ marginTop: '8px' }}>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Hamısı"
                            isActive={statusGroupFilter === 1}
                            onClick={() => handleStageGroupFilter(1)}
                        />
                    </Col>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Daxil olan"
                            isActive={statusGroupFilter === 2}
                            onClick={() => handleStageGroupFilter(2)}
                        />
                    </Col>
                    <Col span={8}>
                        <ProTypeFilterButton
                            label="Xaric olan"
                            isActive={statusGroupFilter === 3}
                            onClick={() => handleStageGroupFilter(3)}
                        />
                    </Col>
                </Row>
            </ProSidebarItem>
            <ProSidebarItem label="Tarix">
                <ProDateRangePicker 
                onChangeDate={handleDatePicker}
                defaultStartValue={filters.dateFrom ? filters.dateFrom:undefined}
                defaultEndValue={filters.dateTo ? filters.dateTo:undefined} 
                 />
            </ProSidebarItem>
            <ProSidebarItem label="Zəng edən">
                <ProSelect
                    mode="multiple"
                    onChange={values => {
                        handleChange(1);
                        onFilter('fromOperators', values)}}
                    data={[
                        ...usedOperators.map(operator => ({
                            ...operator,
                            name: `${operator.prospectTenantPerson?.name} ${
                                operator.prospectTenantPerson?.lastName
                                    ? operator.prospectTenantPerson?.lastName
                                    : ''
                            } (${operator.number})`,
                        })),
                    ]}
                    value={filters.fromOperators?filters.fromOperators.map(Number):undefined}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Zəngi qəbul edən">
                <ProSelect
                    mode="multiple"
                    onChange={values => {
                        handleChange(1);
                        onFilter('toOperators', values)}}
                    data={[
                        ...usedOperators.map(operator => ({
                            ...operator,
                            name: operator.prospectTenantPerson
                                ? `${operator.prospectTenantPerson?.name} ${
                                      operator.prospectTenantPerson?.lastName
                                          ? operator.prospectTenantPerson
                                                ?.lastName
                                          : ''
                                  } (${operator.number})`
                                : operator.number,
                        })),
                    ]}
                    value={filters.toOperators?filters.toOperators.map(Number):undefined}
                />
            </ProSidebarItem>
            <ProSidebarItem label="Status">
                <ProSelect
                    mode="multiple"
                    value={filters.statuses?filters.statuses.map(Number):statuses}
                    onChange={handleStatusFilter}
                    data={statusData}
                />
            </ProSidebarItem>
        </Sidebar>
    );
};

const mapStateToProps = state => ({
    usedOperators: state.internalCallsReducer.usedOperators,
    credential: state.profileReducer.credential,
    profile: state.profileReducer.profile,
});

export default connect(
    mapStateToProps,
    { fetchUsedCallOperators }
)(CallSidebar);
