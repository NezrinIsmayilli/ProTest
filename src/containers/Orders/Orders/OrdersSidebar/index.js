import React, { useState, useRef, useEffect } from 'react';

import { connect } from 'react-redux';
import moment from 'moment';
import {
  Sidebar,
  ProDateRangePicker,
  ProInput,
  ProSidebarItem,
  ProSearch,
  ProSelect,
  ProTypeFilterButton,
} from 'components/Lib';
import { Row, Col } from 'antd';
import { orderStatuses } from 'utils';
import { expeditorStages } from 'utils/constants';

const OrdersSidebar = ({
  profile,
  expeditors,
  onFilter,
  filters,
  partners,
  handleChange
}) => {
  const [statusGroupFilter, setStatusGroupFilter] = useState(filters.statusGroup?Number(filters.statusGroup):1);
  const [statuses, setStatuses] = useState(filters.visualStages? filters.visualStages.map(Number):[]);
  const [search, setSearch] = useState(filters.search?filters.search:null);
  const timerToClearSomewhere = useRef(null);
  const [amountFilter, setAmountFilter] = useState({
    amountFrom:filters.amountFrom? Number(filters.amountFrom): undefined,
    amountTo:filters.amountTo? Number(filters.amountTo): undefined,
  });

  const handleOrderSearch = query => {
    handleChange(1);
    const serial = query.split('/')[1];
    setSearch(query)
    onFilter('search',query)
    onFilter('serialNumber', serial || Number(query));
  };

  const handleContrpartySelect = ids => {
    handleChange(1);
    onFilter('partners', ids);
  };

  const handleSelectEkspeditor = ids => {
    handleChange(1);
    onFilter('deliveredByTenantPersons', ids);
  };

  const handleAmountChange = (type, value) => {
    handleChange(1);
    clearTimeout(timerToClearSomewhere.current);
    const re = /^[0-9]{1,9}$/;
    if ((re.test(value) && Number(value) <= 1000000) || value === '') {
      setAmountFilter(prevAmountFilter => ({
        ...prevAmountFilter,
        [type]: value,
      }));
      timerToClearSomewhere.current = setTimeout(
        () => onFilter(type, value),
        400
      );
    }
  };

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
    onFilter('visualStages', ids);
  };

  const handleStageGroupFilter = id => {
    handleChange(1);
    onFilter('statusGroup', id);
    setStatusGroupFilter(id);
  };

  useEffect(()=>{
    handleChange(filters.page? filters.page:1);
  },[])

  return (
    <Sidebar title="Sifarişlər">
      <ProSidebarItem label="Seçilmiş statuslar">
        <Row gutter={2} style={{ marginTop: '8px' }}>
          <Col span={8}>
            <ProTypeFilterButton
              label="Açıq"
              isActive={statusGroupFilter === 1}
              onClick={() => handleStageGroupFilter(1)}
            />
          </Col>
          <Col span={8}>
            <ProTypeFilterButton
              label="Bitib"
              isActive={statusGroupFilter === 2}
              onClick={() => handleStageGroupFilter(2)}
            />
          </Col>
          <Col span={8}>
            <ProTypeFilterButton
              label="Silinib"
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
      <ProSidebarItem label="Sənəd">
        <ProSearch onChange={e => {
                        setSearch(e.target.value);
                        if (e.target.value === '') {
                          handleChange(1)
                          onFilter('serialNumber', undefined)
                        }
                    }} onSearch={handleOrderSearch}
                    value={search} />
      </ProSidebarItem>
      <ProSidebarItem label="Qarşı tərəf">
        <ProSelect
          mode="multiple"
          onChange={handleContrpartySelect}
          data={partners}
          value={filters.partners? filters.partners.map(Number):undefined}
        />
      </ProSidebarItem>
      <ProSidebarItem label="Ekspeditor">
        <ProSelect
          mode="multiple"
          onChange={handleSelectEkspeditor}
          data={expeditors
            .filter(({ id }) => expeditors?.map(item => item?.id).includes(id))
            .map(expeditors => ({
              ...expeditors,
              id: expeditors?.tenantPersonId,
              name: `${expeditors?.tenantPersonName} ${expeditors?.tenantPersonLastName}`,
            }))}
          value={filters.deliveredByTenantPersons? filters.deliveredByTenantPersons.map(Number):undefined}
        />
      </ProSidebarItem>
      <ProSidebarItem label="Status">
        <ProSelect
          mode="multiple"
          value={statuses}
          onChange={handleStatusFilter}
          keys={['label']}
          data={Object.values(
            expeditors.find(
              ({ tenantPersonId }) => tenantPersonId === profile.id
            )
              ? expeditorStages
              : orderStatuses
          ).filter(orderStatus => orderStatus.group === statusGroupFilter)}
        />
      </ProSidebarItem>
      <ProSidebarItem label="Qiymət aralığı">
        <div style={{ display: 'flex' }}>
          <ProInput
            value={amountFilter.amountFrom}
            onChange={event =>
              handleAmountChange('amountFrom', event.target.value)
            }
            placeholder="Dan"
          />
          <ProInput
            value={amountFilter.amountTo}
            onChange={event =>
              handleAmountChange('amountTo', event.target.value)
            }
            placeholder="Dək"
          />
        </div>
      </ProSidebarItem>
    </Sidebar>
  );
};

const mapStateToProps = state => ({
  partners: state.partnersReducer.partners,
  expeditors: state.orderRolesReducer.expeditors,
  profile: state.profileReducer.profile,
});

export default connect(
  mapStateToProps,
  null
)(OrdersSidebar);
