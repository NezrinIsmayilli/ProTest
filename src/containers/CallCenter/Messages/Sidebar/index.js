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

const MesgSideBar = ({
  fetchCallIvr,
  callIvr,
  onFilter,
  credential,
  filters,
  fetchUsedCallContacts,
  usedCallContacts,
}) => {
  const [statusGroupFilter, setStatusGroupFilter] = useState(1);
  const [workTimeFilter, setWorkTimeFilter] = useState(2);
  useEffect(() => {
    if (usedCallContacts.length === 0) fetchUsedCallContacts();
    if (callIvr.length === 0) fetchCallIvr();
  }, [
    callIvr.length,
    fetchCallIvr,
    fetchUsedCallContacts,
    usedCallContacts.length,
  ]);
  const handleDatePicker = (startValue, endValue) => {
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
    if (value) onFilter(type, value);
    if (value === '') onFilter(type, null);
  };
  const handleNumberFilter = value => {
    onFilter('fromNumber', value);
  };
  const handleStageGroupFilter = id => {
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

  return (
    <Sidebar title="Mesajlar">
      <ProSidebarItem label="Status">
        <Row gutter={2} style={{ marginTop: '8px' }}>
          <Col span={12}>
            <ProTypeFilterButton
              label="Hamısı"
              isActive={statusGroupFilter === 1}
              onClick={() => handleStageGroupFilter(1)}
            />
          </Col>
          <Col span={12}>
            <ProTypeFilterButton
              label="Yeni"
              isActive={statusGroupFilter === 2}
              onClick={() => handleStageGroupFilter(2)}
            />
          </Col>
          <Col span={12}>
            <ProTypeFilterButton
              label="İcrada"
              isActive={statusGroupFilter === 3}
              onClick={() => handleStageGroupFilter(3)}
            />
          </Col>
          <Col span={12}>
            <ProTypeFilterButton
              label="Bitmiş"
              isActive={statusGroupFilter === 3}
              onClick={() => handleStageGroupFilter(3)}
            />
          </Col>
        </Row>
      </ProSidebarItem>
      <ProSidebarItem label="Qarşı tərəf ">
        <ProSearch onSearch={value => handleNumberFilter(value)} />
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
)(MesgSideBar);
