/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState,useEffect } from 'react';
import { Sidebar, ProSelect,ProAsyncSelect, ProSearch, ProSidebarItem } from 'components/Lib';
import { connect } from 'react-redux';
// actions
import { fetchRoles } from 'store/actions/settings/roles';
import { userStatusTypes } from 'utils';
import { useTranslation } from 'react-i18next';

function UsersSidebar(props) {
  const { t } = useTranslation();
  Object.keys(userStatusTypes).forEach(function(key) {
    userStatusTypes[key] = {
      ...userStatusTypes[key],
      name: t(userStatusTypes[key].name),
    };
  });
  const {
    onFilter,
    setGroup,
    // data
    // actions
    fetchRoles,
    users,
    filters,
    fetchBusinessUnitList,
    profile,
  } = props;

  const [businessUnits, setBusinessUnits] = useState([]);
  const [roles, setRoles] = useState([]);
  useEffect(() => {
    fetchRoles();
  }, []);

  const handleFilter = value => {
    setGroup(undefined);
    onFilter('filters[role]', value);
  };

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

  const ajaxRolesSelectRequest = (
    page = 1,
    limit = 20,
    search = '',
    stateReset = 0,
    onSuccessCallback
  ) => {
    const defaultFilters = {
        limit,
        page,
        'filters[search]': search
    };
    fetchRoles({
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
              setRoles(appendList);
            } else {
              setRoles(roles.concat(appendList));
            }
        },
    });
  };

  const group=users.filter(user => user.isAdmin === true).length > 1
  ? [{ id: 'admins', name: 'Həmtəsisçi' }, ...roles]
  : roles;



  return (
    <Sidebar title={t('users:title')}>
      {businessUnits?.length === 1 &&
      profile.businessUnits.length === 0 ? null : (
        <ProSidebarItem label={t('users:businessUnit')}>
          
          <ProAsyncSelect
            mode="multiple"
            valueOnChange={values => onFilter('businessUnitIds', values)}
            selectRequest={ajaxBusinessUnitSelectRequest}
            value={
              businessUnits?.length === 1
                ? businessUnits[0]?.id === null
                  ? businessUnits[0]?.name
                  : businessUnits[0]?.id
                : filters.businessUnitIds
            }
            disabled={businessUnits?.length === 1}
            data={businessUnits?.map(item =>
              item.id === null ? { ...item, id: 0 } : item
            )}
            disabledBusinessUnit={businessUnits?.length === 1}
          />
        </ProSidebarItem>
      )}
      <ProSidebarItem label={t('users:name')}>
        <ProSearch onChange={e => {
                        if (e.target.value === '') {
                          onFilter('filters[search]', undefined);
                        }
                    }} onSearch={value => onFilter('filters[search]', value)} />
      </ProSidebarItem>
      <ProSidebarItem label={t('users:status')}>
        <ProSelect
          data={userStatusTypes}
          // value={filters.status}
          onChange={value => onFilter('filters[status]', value)}
        />
      </ProSidebarItem>
      <ProSidebarItem label={t('users:group')}>
        <ProAsyncSelect
          selectRequest={ajaxRolesSelectRequest}
          data={
            group
          }
          valueOnChange={value =>
            value === 'admins' ? setGroup(value) : handleFilter(value)
          }
          allowClear
          // loading={rolesLoading}
          // value={filters.role}
        />
      </ProSidebarItem>
    </Sidebar>
  );
}

const mapStateToProps = state => ({
  users: state.usersReducer.users,
  rolesLoading: !!state.loadings.roleActionsLoading,
});

export default connect(
  mapStateToProps,
  { fetchRoles }
)(UsersSidebar);
