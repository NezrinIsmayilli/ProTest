import React, { useState, useEffect } from 'react';

import { connect } from 'react-redux';
import moment from 'moment';
import {
  Sidebar,
  ProDateRangePicker,
  ProSearch,
  ProSidebarItem,
  ProSelect,
  ProTypeFilterButton,
} from 'components/Lib';
import { Row, Col } from 'antd';
import { fetchCallApplyTypes } from 'store/actions/settings/applyTypes';
import {
  fetchUsedCallOperators,
  fetchUsedCallContacts,
} from 'store/actions/calls/internalCalls';

const CallSidebar = ({
  fetchUsedCallOperators,
  fetchUsedCallContacts,
  usedCallContacts,
  onFilter,
  credential,
  callApplyTypes,
  fetchCallApplyTypes,
  usedOperators,
  setAnsweredCallData,
  handleChange,
  filters
}) => {
  const [statusGroupFilter, setStatusGroupFilter] = useState(filters.directions.length==1? Number(filters.directions)==2?3:2:1);
  const [answeredFilter, setAnsweredFilter] = useState(filters.statuses? Number(filters.statuses):1);
  const [number,setNumber]=useState(filters.fromNumber)
  const [subApplyTypes, setSubApplyTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    if (usedOperators.length === 0) fetchUsedCallOperators();
    if (usedCallContacts.length === 0) fetchUsedCallContacts();
    if (callApplyTypes.length === 0) fetchCallApplyTypes();
  }, []);
  const callType = [
    { id: 1, name: 'Məlumat' },
    { id: 2, name: 'Şikayət' },
    { id: 3, name: 'Təklif' },
    { id: 4, name: 'Sifariş' },
    { id: 5, name: 'Səhv' },
  ];
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
  const handleChangeCatalogId = (type, v) => {
    handleChange(1);
    if (type === 'parent') {
      onFilter('parentAppealTypes', v);
      handleGetChildCats(v);
    } else if (type === 'child') {
      onFilter('appealTypes', v);
    }
  };
  const handleGetChildCats = v => {
    
    setSubApplyTypes([]);
    let arr=[];
  
    if (callApplyTypes.length > 0) {
      v.map(applyTypesId => {
        callApplyTypes.map(applyType => {
          if (applyType.id == applyTypesId) {
            const data = applyType.children.filter(
              ({ id }) => !arr.map(({ id }) => id).includes(id)
             
            );
          
            data.map(item=>arr.push(item))
            
          }
        });
      });
     
      setSubApplyTypes([...arr]);
    }
  };

  useEffect(()=>{
    if (callApplyTypes.length > 0) {
      let data2=[];
      filters?.parentAppealTypes && filters.parentAppealTypes.map(applyTypesId => {
        callApplyTypes.map(applyType => {
          if (applyType.id == applyTypesId) {
           
            let filterData=filters.appealTypes?.filter(
              appealId=>applyType.children?.map(({ id }) => id).includes(Number(appealId)))
                  
              if(filterData?.length>0){
                data2.push(
                  filterData
                  )
              }
          }
        });
      });          
      onFilter('appealTypes',[...data2])
    }
  },[filters.parentAppealTypes]);


  const handleStatusFilter = ids => {
    setStatuses(ids);
    onFilter('visualStages', ids);
  };
  const handleNumberFilter = value => {
    handleChange(1);
    onFilter('fromNumber', value);
  };
  const handleOperatorFilter = values => {
    handleChange(1);
    onFilter('operators', values);
  };
  const handleAnsweredFilter = id => {
    handleChange(1);
    if (id === 1) {
      onFilter('statuses', [1]);
    }
    if (id === 2) {
      onFilter('statuses', [2]);
      onFilter('directions', [2]);
    }
    setAnsweredCallData([]);
    setAnsweredFilter(id);
  };
  const handleStageGroupFilter = id => {
    handleChange(1);
    if (id === 1) {
      onFilter('directions', [1, 2]);
    }
    if (id === 2) {
      onFilter('directions', [1]);
    }
    if (id === 3) {
      onFilter('directions', [2]);
    }
    setStatusGroupFilter(id);
  };

  useEffect(() => {
    handleChange(filters.page? filters.page:1);
  },[]);

  useEffect(()=>{
    if(filters.parentAppealTypes&&callApplyTypes.length>0){
      handleGetChildCats(filters.parentAppealTypes.map(Number))
    }
  },[callApplyTypes])


  return (
    <Sidebar title="Çağrı mərkəzi">
      <ProSidebarItem label="İcra statusu">
        <Row gutter={2} style={{ marginTop: '8px' }}>
          <Col span={12}>
            <ProTypeFilterButton
              label="Cavablandırılmış"
              isActive={answeredFilter === 1}
              onClick={() => handleAnsweredFilter(1)}
            />
          </Col>
          <Col span={12}>
            <ProTypeFilterButton
              style={{ padding: '1px' }}
              label="Cavablandırılmamış"
              isActive={answeredFilter === 2}
              onClick={() => handleAnsweredFilter(2)}
            />
          </Col>
        </Row>
      </ProSidebarItem>
      {answeredFilter === 1 ? (
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
      ) : null}
      <ProSidebarItem label="Tarix">
        <ProDateRangePicker
         onChangeDate={handleDatePicker}
         defaultStartValue={filters.dateFrom ? filters.dateFrom:undefined}
         defaultEndValue={filters.dateTo ? filters.dateTo:undefined} />
      </ProSidebarItem>
      <ProSidebarItem label="Operator">
        <ProSelect
          mode="multiple"
          onChange={values => handleOperatorFilter(values)}
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
          value={filters.operators? filters.operators.map(Number):undefined}
        />
      </ProSidebarItem>
      <ProSidebarItem label="Nömrə ">
                <ProSearch
                    onChange={e => {
                      setNumber(e.target.value)
                        if (e.target.value === '') {
                            handleNumberFilter(undefined);
                        }
                    }}
                    onSearch={value => handleNumberFilter(value)}
                    value={number}
                />
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
      {answeredFilter === 1 ? (
        <>
          <ProSidebarItem label="Zəng növü">
            <ProSelect
              mode="multiple"
              onChange={values => {
                handleChange(1);
                onFilter('types', values)}}
              data={callType}
              value={filters.types? filters.types.map(Number):undefined}
            />
          </ProSidebarItem>
          <ProSidebarItem label="Müraciət növü">
            <ProSelect
              mode="multiple"
              onChange={values => {
                
                if(values.length==0){onFilter('appealTypes',undefined)}
                handleChangeCatalogId('parent', values)
                    }}
              data={callApplyTypes}
              value={filters.parentAppealTypes? filters.parentAppealTypes.map(Number):undefined}
            />
          </ProSidebarItem>
          <ProSidebarItem label="Müraciət alt növü">
            <ProSelect
              mode="multiple"
              disabled={subApplyTypes.length === 0}
              onChange={values => handleChangeCatalogId('child', values)}
              data={subApplyTypes}
              value={filters.appealTypes? filters.appealTypes.map(Number):undefined}
            />
          </ProSidebarItem>
        </>
      ) : null}
      {/* <ProSidebarItem label="Status">
        <ProSelect
          mode="multiple"
          value={statuses}
          onChange={handleStatusFilter}
          keys={['label']}
          // data={Object.values(
          //   expeditors.find(
          //     ({ tenantPersonId }) => tenantPersonId === profile.id
          //   )
          //     ? expeditorStages
          //     : orderStatuses
          // ).filter(orderStatus => orderStatus.group === statusGroupFilter)}
        />
      </ProSidebarItem> */}
    </Sidebar>
  );
};

const mapStateToProps = state => ({
  usedOperators: state.internalCallsReducer.usedOperators,
  usedCallContacts: state.internalCallsReducer.usedCallContacts,
  credential: state.profileReducer.credential,
  profile: state.profileReducer.profile,
  callApplyTypes: state.applyTypesReducer.callApplyTypes,
});

export default connect(
  mapStateToProps,
  { fetchUsedCallOperators, fetchUsedCallContacts, fetchCallApplyTypes }
)(CallSidebar);
