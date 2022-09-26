import React, { useEffect } from 'react';

import { connect } from 'react-redux';
import { Sidebar, ProInput, ProSidebarItem, ProSelect } from 'components/Lib';
import { fetchCallOperators } from 'store/actions/calls/internalCalls';

const OperatorSidebar = ({
  fetchCallOperators,
  operators,
  customFilter,
  setCustomFilter,
  operatorReports,
}) => {
  useEffect(() => {
    if (operators.length === 0) fetchCallOperators();
  }, []);
  const handleFilter = (type, value) => {
    setCustomFilter(prevFilters => ({
      ...prevFilters,
      [type]: value === '' ? null : value,
    }));
  };
  return (
    <Sidebar title="Supervayzer paneli">
      <ProSidebarItem label="Operator">
        <ProSelect
          mode="multiple"
          onChange={values => handleFilter('operator', values)}
          data={operators
            .filter(({ id }) =>
              operatorReports?.map(item => item?.id).includes(id)
            )
            .map(operator => ({
              ...operator,
              id: operator?.id,
              name: operator.prospectTenantPerson
                ? `${operator?.prospectTenantPerson?.name} ${
                    operator?.prospectTenantPerson?.lastName
                      ? operator?.prospectTenantPerson?.lastName
                      : ''
                  } (${operator?.number})`
                : operator?.number,
            }))}
        />
      </ProSidebarItem>
      <ProSidebarItem label="Cari status">
        <ProSelect
          mode="multiple"
          onChange={values => handleFilter('statuses', values)}
          data={[
            { id: 1, name: 'Onlayn' },
            { id: 2, name: 'Oflayn' },
            { id: 3, name: 'Zəngi emal edir' },
            { id: 4, name: 'Zəng daxil olur' },
            { id: 5, name: 'Danışır' },
            { id: 6, name: 'Xətdə saxlayır' },
          ]}
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
      <ProSidebarItem label="Orta danışıq müddəti, dəq">
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
    </Sidebar>
  );
};

const mapStateToProps = state => ({
  operators: state.internalCallsReducer.operators,
});

export default connect(
  mapStateToProps,
  { fetchCallOperators }
)(OperatorSidebar);
