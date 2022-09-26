import React, { Fragment, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { moduleForFilter } from 'utils';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { fetchUsers } from 'store/actions/users';
import {
  Sidebar,
  SidebarLink,
  ProSidebarItem,
  ProDateRangePicker,
  ProSelect,
  ProAsyncSelect
} from 'components/Lib';

const AuditSideBar = props => {
  const {
    tenant,
    onFilter,
    filters,
    profile,
    permissionsList,
    handlePaginationChange,
    fetchBusinessUnitList,
    filterSelectedUsers,
    fetchUsers
  } = props;

  const [customFilter, setCustomFilter] = useState([]);
  const [subApplyTypes, setSubApplyTypes] = useState([]);
  const [subApplyValue, setSubApplyValue] = useState([]);
  const [
    filterSelectedBusinessUnit,
    setFilterSelectedBusinessUnit,
] = useState([]);


  const [businessUnits, setBusinessUnits] = useState([]);
  const [users, setUsers] = useState([]);
  const [modulId, setModulId] = useState(undefined);
  const getPath = path => `/profile/${path}`;
  const type = [
    { id: 1, name: 'Əlavə etmə' },
    { id: 2, name: 'Düzəliş' },
    { id: 3, name: 'Silinmə' },
    { id: 5, name: 'Sənəd ixracı' },
  ];
  const [businessUnitLength, setBusinessUnitLength] = useState(2);

  useEffect(() => {
      fetchBusinessUnitList({
          filters: {
              limit: 10,
              page: 1,
              isDeleted: 0,
              businessUnitIds: profile.businessUnits?.map(({ id }) => id),
          },
          onSuccess: data => {
              setBusinessUnitLength(data.data?.length || 0);
          },
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDefaultFilter = (type, value) => {
    handlePaginationChange(1);
    onFilter(type, value);
};
  const handleDatePicker = (startValue, endValue) => {
    handlePaginationChange(1);
    const startDate = startValue
      ? moment(startValue).format('DD-MM-YYYY')
      : undefined;
    const endDate = endValue
      ? moment(endValue).format('DD-MM-YYYY')
      : undefined;
    onFilter('dateFrom', startDate);
    onFilter('dateTo', endDate);
  };

  const handleChangeModuleId = (type, values) => {
    handlePaginationChange(1);
    if (type === 'parent') {
      setSubApplyTypes([]);
      setModulId(values);
    } else if (type === 'child') {
      setSubApplyValue(values);
    }
  };


  useEffect(() => {
    if (modulId?.length > 0) {
      const arr = [];
      modulId.map(applyTypesId => {
        moduleForFilter.map(applyType => {
          if (applyType.id == applyTypesId) {
            const data = applyType.subModule.filter(
              ({ id }) => !subApplyTypes.map(({ id }) => id).includes(id)
            );
            if (!subApplyTypes.includes(...data)) {
              arr.push(...data);
            }
          }
        });
      });
      setSubApplyTypes([...subApplyTypes, ...arr]);
      setSubApplyValue(
        subApplyValue.filter(item =>
          [...subApplyTypes, ...arr].map(({ id }) => id).includes(item)
        )
      );
    }
  }, [modulId]);
  useEffect(() => {
    if (subApplyValue.length > 0) {
      const arr = [];
      subApplyTypes.map(({ id, categories }) =>
        subApplyValue.includes(id)
          ? categories
            ? arr.push(id, ...categories)
            : arr.push(id)
          : null
      );
      setCustomFilter(arr);
    } else {
      const arr = [];
      subApplyTypes.map(({ id, categories }) =>
        categories ? arr.push(id, ...categories) : arr.push(id)
      );
      // if (modulId?.includes('user')) {
      //   arr.push('user');
      // }
      setCustomFilter(arr);
    }

  }, [modulId, subApplyValue]);

  useEffect(() => {
    if (modulId?.length === 0) {
      onFilter('parentModule', modulId);
      onFilter('modules', null);
      onFilter('childModule', [])
      setSubApplyTypes([])
    } else if (customFilter.length > 0)
    {   onFilter('parentModule', modulId);
        if(subApplyValue)
        {onFilter('childModule',subApplyValue)}
       onFilter('modules', customFilter);
    }
  }, [customFilter]);

  const permissionsListReq = permissionsList.filter(
    permission => permission.key === 'tenant_requisites'
  );

useEffect(()=>{
  handlePaginationChange(filters.page? filters.page:1)
  setModulId(filters.parentModule? filters.parentModule:undefined);
  setSubApplyValue(filters.childModule? filters.childModule:[]);

  if (filters.businessUnitIds) {
    fetchBusinessUnitList({
        filters: {
            isDeleted: 0,
            businessUnitIds: profile.businessUnits?.map(({ id }) => id),
            ids: filters.businessUnitIds.map(Number),
        },
        onSuccess: data => {
            const appendList = [];
            if (data.data) {
                data.data.forEach(element => {
                    appendList.push({
                        id: element.id,
                        name: element.name,
                        ...element,
                    });
                });
            }
            setFilterSelectedBusinessUnit(appendList);
        },
    });
}


},[])

const ajaxBusinessUnitSelectRequest = (
  page = 1,
  limit = 20,
  search = '',
  stateReset = 0,
  onSuccessCallback
) => {
  const filters = {
      limit,
      page,
      name: search,
      isDeleted: 0,
      businessUnitIds: profile.businessUnits?.map(({ id }) => id),
  };
  fetchBusinessUnitList({
      filters,
      onSuccess: data => {
          const appendList = [];
          if (data.data) {
              data.data.forEach(element => {
                  appendList.push({
                      id: element.id,
                      name: element.name,
                      ...element,
                  });
              });
          }
          if (onSuccessCallback !== undefined) {
              onSuccessCallback(!appendList.length);
          }
          if (stateReset) {
              setBusinessUnits(appendList);
          } else {
              setBusinessUnits(businessUnits.concat(appendList));
          }
      },
  });
};

const ajaxUsersSelectRequest = (
  page = 1,
  limit = 20,
  search = '',
  stateReset = 0,
  onSuccessCallback
) => {
  const defaultFilters = {
      limit,
      page,
      'filters[search]': search,
      businessUnitIds: filters?.businessUnitIds
          ? filters?.businessUnitIds
          : undefined,
  };
  fetchUsers({
      filters: defaultFilters,
      onSuccessCallback: data => {
          const appendList = [];
          if (data.data) {
              data.data.forEach(element => {
                  appendList.push({
                      id: element.id,
                      name: element.name,
                      ...element,
                  });
              });
          }
          if (onSuccessCallback !== undefined) {
              onSuccessCallback(!appendList.length);
          }
          if (stateReset) {
            setUsers(appendList);
          } else {
            setUsers(users.concat(appendList));
          }
      },
  });
};




  return (
    <Sidebar title="Info">
      <SidebarLink path={getPath('main')} name="Şəxsi məlumat" />
      <SidebarLink path={getPath('security')} name="Təhlükəsizlik və giriş" />

      {tenant?.isAdmin ? (
        <SidebarLink path={getPath('company')} name="Şirkət haqqında" />
      ) : null}
      {tenant?.isAdmin && permissionsListReq[0]?.permission === 1 ? (
        <SidebarLink path={getPath('requisites')} name="Rekvizitlər" />
      ) : permissionsListReq[0]?.permission === 0 ? null : (
        <SidebarLink path={getPath('requisites')} name="Rekvizitlər" />
      )}

      {tenant?.isAdmin ? (
        <Fragment>
          <SidebarLink path={getPath('invoice')} name="Ödənişlər" />
          <SidebarLink path={getPath('logs')} name="Audit log" />
          <SidebarLink path={getPath('apps')} name="Tətbiqlər" />
          <SidebarLink
            path={getPath('operations')}
            name="Əməliyyatların silinməsi"
          />
          {/* <SidebarLink path={getPath('plans')} name="Paketlər" /> */}
        </Fragment>
      ) : null}
      {businessUnitLength === 1 &&
      profile.businessUnits.length === 0 ? null : (
        <ProSidebarItem label="Biznes blok">
          <ProAsyncSelect
            mode="multiple"
            valueOnChange={value => handleDefaultFilter('businessUnitIds', value)}
            selectRequest={ajaxBusinessUnitSelectRequest}
            value={
              filters.businessUnitIds ? filters.businessUnitIds.map(Number):
             ( businessUnitLength === 1
                ? businessUnits[0]?.id === null
                  ? businessUnits[0]?.name
                  : businessUnits[0]?.id
                : filters.businessUnitIds)
            }
            disabled={businessUnitLength === 1}
            data={
              filterSelectedBusinessUnit.length > 0
                  ? [
                        ...filterSelectedBusinessUnit.filter(
                            item => item.id !== null
                        ),
                        ...businessUnits
                            ?.map(item =>
                                item.id === null
                                    ? { ...item, id: 0 }
                                    : item
                            )
                            .filter(
                                item =>
                                    !filterSelectedBusinessUnit
                                        .map(({ id }) => id)
                                        ?.includes(item.id)
                            ),
                    ]
                  : businessUnits?.map(item =>
                        item.id === null
                            ? { ...item, id: 0 }
                            : item
                    )
            }
            disabledBusinessUnit={businessUnitLength === 1}
          />
        </ProSidebarItem>
      )}
      <ProSidebarItem label="Tarix">
        <ProDateRangePicker
          defaultStartValue={filters.dateFrom ? filters.dateFrom : undefined}
          defaultEndValue={filters.dateTo ? filters.dateTo : undefined}
          placeholderStart="Başlama"
          placeholderEnd="Bitmə"
          getCalendarContainer={trigger => trigger.parentNode.parentNode}
          onChangeDate={handleDatePicker}
        />
      </ProSidebarItem>
      <ProSidebarItem label="İstifadəçi">
        <ProAsyncSelect
          data={filterSelectedUsers.length > 0
            ? [
                  ...filterSelectedUsers,
                  ...users.filter(
                      item =>
                          !filterSelectedUsers
                              .map(({ id }) => id)
                              ?.includes(item.id)
                  ),
              ]
        : users}
        
          selectRequest={ajaxUsersSelectRequest}
          mode="multiple"
          value={filters.operators ? filters.operators.map(Number) : []}
          valueOnChange={value =>
            handleDefaultFilter('operators', value)
        }
          keys={['name', 'lastName', 'patronymic']}
          allowClear
        />
      </ProSidebarItem>
      <ProSidebarItem label="Modul">
        <ProSelect
          mode="multiple"
          value={filters.parentModule ? filters.parentModule.map(module=>module=='user'? module:Number(module)) : []}
          onChange={values =>handleChangeModuleId('parent', values)}
          data={moduleForFilter}
        />
      </ProSidebarItem>
      <ProSidebarItem label="Alt modul">
        <ProSelect
          mode="multiple"
          value={filters.childModule? filters.childModule.map(module=>module):subApplyValue}
          disabled={subApplyTypes.filter(({id})=>id!=='user')
          .length === 0}
          onChange={values => handleChangeModuleId('child', values)}
          data={subApplyTypes.filter(({id})=>id!=='user')}
        />
      </ProSidebarItem>
      <ProSidebarItem label="Əməliyyat növü">
        <ProSelect
          data={type}
          mode="multiple"
          value={filters.types ? filters.types.map(Number) : []}
          onChange={value => handleDefaultFilter('types', value)}
          allowClear
        />
      </ProSidebarItem>
    </Sidebar>
  );
};

const mapStateToProps = state => ({
  tenant: state.tenantReducer.tenant,
  permissionsList: state.permissionsReducer.permissions,
});

export default connect(
  mapStateToProps,
  {fetchBusinessUnitList,
    fetchUsers}
)(AuditSideBar);
