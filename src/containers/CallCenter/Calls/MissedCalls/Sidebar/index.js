import React, { useState, useEffect } from 'react';

import { connect } from 'react-redux';
import moment from 'moment';
import {
  Sidebar,
  ProDateRangePicker,
  ProSearch,
  ProInput,
  ProSidebarItem,
  ProSelect,
  ProTypeFilterButton,
} from 'components/Lib';
import { Row, Col } from 'antd';
import { fetchCallIvr } from 'store/actions/settings/ivr';
import { fetchUsedCallContacts } from 'store/actions/calls/internalCalls';

const CallSidebar = ({
  fetchCallIvr,
  callIvr,
  onFilter,
  credential,
  filters,
  fetchUsedCallContacts,
  usedCallContacts,
  handleChange
}) => {
  const [statusGroupFilter, setStatusGroupFilter] = useState(filters.callbackStatuses?
   ( Number(filters.callbackStatuses)==1? 3:2) :1);
  const [workTimeFilter, setWorkTimeFilter] = useState(filters.isWorkingTime?
    Number(filters.isWorkingTime):2);
  const [number,setNumber]=useState(filters.fromNumber)
  useEffect(() => {
    if (usedCallContacts.length === 0) fetchUsedCallContacts();
    if (callIvr.length === 0) fetchCallIvr();
  }, []);
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
  const handleTimeChange = (type, value) => {
    handleChange(1);
    if (value) onFilter(type, value);
    if (value === '') onFilter(type, null);
  };
  const handleNumberFilter = value => {
    handleChange(1);
    onFilter('fromNumber', value);
  };
  const handleStageGroupFilter = id => {
    handleChange(1);
    if (id === 1) {
      onFilter('callbackStatuses', []);
    }
    if (id === 2) {
      onFilter('callbackStatuses', [2]);
    }
    if (id === 3) {
      onFilter('callbackStatuses', [1]);
    }
    setStatusGroupFilter(id);
  };
  const handleWorkTimeFilter = id => {
    handleChange(1);
    if (id === 0) {
      onFilter('isWorkingTime', 0);
    }
    if (id === 1) {
      onFilter('isWorkingTime', 1);
    }
    if (id === 2) {
      onFilter('isWorkingTime', undefined);
    }
    setWorkTimeFilter(id);
  };

  useEffect(() => {
    handleChange(filters.page? filters.page:1)
  },[]);

  return (
    <Sidebar title="Çağrı mərkəzi">
      <ProSidebarItem label="Status">
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
              label="Yığılmış"
              isActive={statusGroupFilter === 2}
              onClick={() => handleStageGroupFilter(2)}
            />
          </Col>
          <Col span={8}>
            <ProTypeFilterButton
              label="Yığılmamış"
              isActive={statusGroupFilter === 3}
              onClick={() => handleStageGroupFilter(3)}
            />
          </Col>
        </Row>
      </ProSidebarItem>
      <ProSidebarItem label="İş rejimi">
        <Row gutter={2} style={{ marginTop: '8px' }}>
          <Col span={8}>
            <ProTypeFilterButton
              label="Hamısı"
              isActive={workTimeFilter === 2}
              onClick={() => handleWorkTimeFilter(2)}
            />
          </Col>
          <Col span={8}>
            <ProTypeFilterButton
              label="İş vaxtı"
              isActive={workTimeFilter === 1}
              onClick={() => handleWorkTimeFilter(1)}
            />
          </Col>
          <Col span={8}>
            <ProTypeFilterButton
              label="Q-iş vaxtı"
              isActive={workTimeFilter === 0}
              onClick={() => handleWorkTimeFilter(0)}
            />
          </Col>
        </Row>
      </ProSidebarItem>
      <ProSidebarItem label="Tarix">
        <ProDateRangePicker 
        onChangeDate={handleDatePicker}
        defaultStartValue={filters.dateFrom ? filters.dateFrom:undefined}
        defaultEndValue={filters.dateTo ? filters.dateTo:undefined} />
      </ProSidebarItem>
      <ProSidebarItem label="Nömrə ">
        <ProSearch onChange={e => {
                        setNumber(e.target.value)
                        if (e.target.value === '') {
                            handleNumberFilter(undefined);
                        }
                    }} onSearch={value => handleNumberFilter(value)} 
                    value={number}/>
      </ProSidebarItem>
      <ProSidebarItem label="Qarşı tərəf">
        <ProSelect
          mode="multiple"
          onChange={values => {
            handleChange(1);
            onFilter('prospectContacts', values)}}
          data={usedCallContacts}
          value={filters.prospectContacts? filters.prospectContacts.map(Number):undefined}
        />
      </ProSidebarItem>
      <ProSidebarItem label="İVR">
        <ProSelect
          mode="multiple"
          onChange={values =>{
            handleChange(1);
            onFilter('ivrs', values)}}
          data={callIvr}
          value={filters.ivrs? filters.ivrs.map(Number):undefined}
        />
      </ProSidebarItem>
      <ProSidebarItem label="Gözləmə müddəti">
        <div style={{ display: 'flex' }}>
          <ProInput
            value={filters.waitTimeFrom}
            onChange={event =>
              handleTimeChange('waitTimeFrom', event.target.value)
            }
            placeholder="Dan"
          />
          <ProInput
            value={filters.waitTimeTo}
            onChange={event =>
              handleTimeChange('waitTimeTo', event.target.value)
            }
            placeholder="Dək"
          />
        </div>
      </ProSidebarItem>
    </Sidebar>
  );
};

const mapStateToProps = state => ({
  credential: state.profileReducer.credential,
  profile: state.profileReducer.profile,
  usedCallContacts: state.internalCallsReducer.usedCallContacts,
  callIvr: state.IVRReducer.callIvr,
});

export default connect(
  mapStateToProps,
  { fetchUsedCallContacts, fetchCallIvr }
)(CallSidebar);
