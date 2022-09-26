import React, { useEffect } from 'react';

import { connect } from 'react-redux';
import moment from 'moment';
import {
  Sidebar,
  ProDateRangePicker,
  ProInput,
  ProSidebarItem,
  ProSelect,
} from 'components/Lib';
import { fetchCallRoles } from 'store/actions/settings/call-roles';

const OperatorSidebar = ({
  operators,
  fetchCallRoles,
  customFilter,
  setCustomFilter,
  onFilter,
  operatorReports,
}) => {
  useEffect(() => {
    fetchCallRoles();
  }, []);
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
  const handleFilter = (type, value) => {
    setCustomFilter(prevFilters => ({
      ...prevFilters,
      [type]: value === '' ? null : value,
    }));
  };
  return (
    <Sidebar title="Operatorların statistikası">
      <ProSidebarItem label="Tarix">
        <ProDateRangePicker
          onChangeDate={handleDatePicker}
          notRequired={false}
        />
      </ProSidebarItem>
      <ProSidebarItem label="Operator">
        <ProSelect
          mode="multiple"
          onChange={values => handleFilter('operator', values)}
          data={operators
            .filter(({ operator }) =>
              operatorReports?.map(item => item?.id).includes(operator?.id)
            )
            .map(operator => ({
              ...operator,
              id: operator?.operator?.id,
              name: operator?.operator?.prospectTenantPerson
                ? `${operator?.operator?.prospectTenantPerson?.name} ${
                    operator?.operator?.prospectTenantPerson?.lastName
                      ? operator?.operator?.prospectTenantPerson?.lastName
                      : ''
                  } (${operator?.operator?.number})`
                : operator?.operator?.number,
            }))}
        />
      </ProSidebarItem>
      <ProSidebarItem label="Daxil olan zəng sayı">
        <div style={{ display: 'flex' }}>
          <ProInput
            value={customFilter.incomingCallsFrom}
            onChange={event =>
              handleFilter('incomingCallsFrom', event.target.value)
            }
            placeholder="Dan"
          />
          <ProInput
            value={customFilter.incomingCallsTo}
            onChange={event =>
              handleFilter('incomingCallsTo', event.target.value)
            }
            placeholder="Dək"
          />
        </div>
      </ProSidebarItem>
      <ProSidebarItem label="Xaric olan zəng sayı">
        <div style={{ display: 'flex' }}>
          <ProInput
            value={customFilter.outgoingCallsFrom}
            onChange={event =>
              handleFilter('outgoingCallsFrom', event.target.value)
            }
            placeholder="Dan"
          />
          <ProInput
            value={customFilter.outgoingCallsTo}
            onChange={event =>
              handleFilter('outgoingCallsTo', event.target.value)
            }
            placeholder="Dək"
          />
        </div>
      </ProSidebarItem>
      <ProSidebarItem label="Buraxılmış zəng sayı">
        <div style={{ display: 'flex' }}>
          <ProInput
            value={customFilter.missedCallFrom}
            onChange={event =>
              handleFilter('missedCallFrom', event.target.value)
            }
            placeholder="Dan"
          />
          <ProInput
            value={customFilter.missedCallTo}
            onChange={event => handleFilter('missedCallTo', event.target.value)}
            placeholder="Dək"
          />
        </div>
      </ProSidebarItem>
      <ProSidebarItem label="Danışıq müddəti, dəq">
        <div style={{ display: 'flex' }}>
          <ProInput
            value={customFilter.callTimeFrom}
            onChange={event => handleFilter('callTimeFrom', event.target.value)}
            placeholder="Dan"
          />
          <ProInput
            value={customFilter.callTimeTo}
            onChange={event => handleFilter('callTimeTo', event.target.value)}
            placeholder="Dək"
          />
        </div>
      </ProSidebarItem>
      <ProSidebarItem label="Aktivlik müddəti, dəq">
        <div style={{ display: 'flex' }}>
          <ProInput
            value={customFilter.idleFrom}
            onChange={event => handleFilter('idleFrom', event.target.value)}
            placeholder="Dan"
          />
          <ProInput
            value={customFilter.idleTo}
            onChange={event => handleFilter('idleTimeTo', event.target.value)}
            placeholder="Dək"
          />
        </div>
      </ProSidebarItem>
    </Sidebar>
  );
};

const mapStateToProps = state => ({
  operators: state.callRolesReducer.operators,
});

export default connect(
  mapStateToProps,
  { fetchCallRoles }
)(OperatorSidebar);
