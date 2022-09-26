import React, { useEffect, useState } from 'react';

import { connect } from 'react-redux';
import moment from 'moment';
import {
  Sidebar,
  ProDateRangeDay,
  ProSidebarItem,
  ProSelect,
} from 'components/Lib';

import { fetchOperators } from 'store/actions/calls/reports';

const CallSidebar = ({ onFilter,filters, fetchOperators, operatorsList,handleChange,thisMonthEnd,thisMonthStart }) => {
  useEffect(() => {
    if (operatorsList.length === 0) fetchOperators();
  }, []);
  const [StartDate, setStartDate] = useState(filters.dateFrom!=thisMonthStart? filters.dateFrom:undefined);
  const [EndDate, setEndDate] = useState(filters.dateTo!=thisMonthEnd? filters.dateTo:undefined);
  const handleDatePicker = (startValue, endValue) => {
    handleChange(1);
    const startDate = startValue
      ? moment(startValue).format('DD-MM-YYYY')
      : undefined;
      setStartDate(startDate);
    const endDate = endValue
      ? moment(endValue).format('DD-MM-YYYY')
      : undefined;
      setEndDate(endDate);
    onFilter('dateFrom', startDate);
    onFilter('dateTo', endDate);
  };

  const statusData = [
    { id: 1, name: 'Onlayn' },
    { id: 2, name: 'Oflayn' },
    { id: 3, name: 'Zəngi emal edir' },
    { id: 4, name: 'Zəng daxil olur' },
    { id: 5, name: 'Danışır' },
    { id: 6, name: 'Xəttə saxlıyır' },
  ];

  useEffect(() => {
    handleChange(filters.page? filters.page:1);
  },[]);

  return (
    <Sidebar title="Status tarixçəsi">
      <ProSidebarItem label="Tarix">
        <ProDateRangeDay 
        onChangeDate={handleDatePicker}
        notRequired={StartDate||EndDate? true:false}
        defaultStartValue={StartDate}
        defaultEndValue={EndDate}
         />
      </ProSidebarItem>
      <ProSidebarItem label="Operator">
        <ProSelect
          mode="multiple"
          onChange={values =>{
            handleChange(1);
            onFilter('operators', values)}}
          data={operatorsList.map(operator => ({
            ...operator,
            id: operator?.id,
            name: operator?.prospectTenantPerson
              ? `${operator?.prospectTenantPerson?.name} ${
                  operator?.prospectTenantPerson?.lastName
                    ? operator?.prospectTenantPerson?.lastName
                    : ''
                } (${operator?.number})`
              : operator?.number,
          }))}
          value={filters.operators? filters.operators.map(Number):undefined}
        />
      </ProSidebarItem>
      <ProSidebarItem label="Status">
        <ProSelect
          mode="multiple"
          onChange={values =>{
            handleChange(1);
            onFilter('statuses', values)}}
          data={statusData}
          value={filters.statuses?filters.statuses.map(Number):undefined}
        />
      </ProSidebarItem>
    </Sidebar>
  );
};

const mapStateToProps = state => ({
  operatorsList: state.callReportsReducer.operatorsList,
});

export default connect(
  mapStateToProps,
  { fetchOperators }
)(CallSidebar);
