import React, { useState, useEffect } from 'react';
import { Table, ProSelect } from 'components/Lib';
import { Checkbox, Spin } from 'antd';
import { connect } from 'react-redux';
import {
  fetchStageRoleExecutors,
  updateStageRoleExecutors,
} from 'store/actions/settings/order-roles';

const stages = {
  stageNewDraft: {
    name: 'stageNewDraft',
    label: 'Yeni',
    defaultRoles: [3, 4],
    defaultRole: 4,
  },
  stageExecution: {
    name: 'stageExecution',
    label: 'Icrada',
    defaultRoles: [1, 3, 4],
    defaultRole: 4,
  },
  stageCanceled: {
    name: 'stageCanceled',
    defaultRoles: [3, 4],
    label: 'Imtina',
    defaultRole: 4,
  },
  stageDone: {
    name: 'stageDone',
    label: 'Bitib',
    defaultRoles: [3, 4],
    defaultRole: 4,
  },
};

const roles = [
  {
    id: 1,
    name: 'İcraçı',
    key: 'executor',
  },
  {
    id: 2,
    name: 'Supervayzer',
    key: 'supervisor',
  },
  {
    id: 3,
    name: 'Operator',
    key: 'operators',
  },
  {
    id: 4,
    name: 'Admin',
    key: 'admins',
  },
];
const RegulationsList = props => {
  const {
    stageRoles,
    fetchStageRoleExecutors,
    updateStageRoleExecutors,
    warehousemen,
    expeditors,
    operators,
  } = props;

  const [stageChanging, setStageChanging] = useState(null);
  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      align: 'left',
      width: 80,
      render: (value, item, index) => index + 1,
    },
    {
      title: 'Status',
      dataIndex: 'label',
      width: 300,
      align: 'left',
      render: value => value || '-',
    },
    {
      title: 'İcraçı rol',
      width: 350,
      align: 'left',
      render: (value, { name, role, defaultRoles, defaultRole }) => {
        return (
          <>
            <ProSelect
              data={roles.filter(role => defaultRoles.includes(role.id))}
              size="middle"
              value={role || defaultRole}
              allowClear={false}
              loading={stageChanging === name}
              onChange={role => handleUpdateStageRoleExecutors(name, role)}
            />

            {name === 'stageExecution' ? (
              <Spin spinning={stageChanging === 'allowToSelectTenantPerson'}>
                <Checkbox
                  checked={stageRoles.allowToSelectTenantPerson}
                  disabled={
                    stageRoles.stageDelivery !== 2 ||
                    stageChanging === 'allowToSelectTenantPerson'
                  }
                  onChange={handleTenantPersonChange}
                  style={{
                    fontSize: '12px',
                    margin: 5,
                  }}
                >
                  İcraçı mən tərəfindən təyin edilsin.
                </Checkbox>
              </Spin>
            ) : null}
          </>
        );
      },
    },
    {},
  ];

  const handleTenantPersonChange = event => {
    const data = {
      ...stageRoles,
      allowToSelectTenantPerson: event.target.checked,
    };
    setStageChanging('allowToSelectTenantPerson');
    updateStageRoleExecutors({
      data,
      onSuccessCallback: () => {
        fetchStageRoleExecutors();
        setStageChanging(null);
      },
      onFailureCallback: () => {
        setStageChanging(null);
      },
    });
  };
  const handleUpdateStageRoleExecutors = (stage, role) => {
    const data = {
      ...stageRoles,
      [stage]: role === 4 ? null : role,
      allowToSelectTenantPerson:
        stage === 'stageDelivery' && role !== 2
          ? null
          : stageRoles.allowToSelectTenantPerson,
    };
    setStageChanging(stage);
    updateStageRoleExecutors({
      data,
      onSuccessCallback: () => {
        fetchStageRoleExecutors();
        setStageChanging(null);
      },
      onFailureCallback: () => {
        setStageChanging(null);
      },
    });
  };
  useEffect(() => {
    fetchStageRoleExecutors();
  }, []);

  return (
    <div>
      <Table
        columns={columns}
        scroll={{ x: 'none' }}
        isWhiteTable
        dataSource={Object.keys(stageRoles)
          .filter(stageRole => stageRole !== 'allowToSelectTenantPerson')
          .map(stageRole => ({
            ...stages[stageRole],
            role: stageRoles[stageRole],
          }))}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      ></div>
    </div>
  );
};

const mapStateToProps = state => ({
  warehousemen: state.orderRolesReducer.warehousemen,
  expeditors: state.orderRolesReducer.expeditors,
  operators: state.orderRolesReducer.operators,
  stageRoles: state.orderRolesReducer.stageRoles,
});

export const Regulations = connect(
  mapStateToProps,
  {
    fetchStageRoleExecutors,
    updateStageRoleExecutors,
  }
)(RegulationsList);
