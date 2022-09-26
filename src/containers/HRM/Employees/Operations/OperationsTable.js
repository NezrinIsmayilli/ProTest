/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { FaCaretUp, FaCaretDown } from 'react-icons/all';
import { Table, InfoCard } from 'components/Lib';
import { Row, Col, Spin, Affix, Tooltip } from 'antd';

// actions
import { infoEmployeeActivityVacation } from 'store/actions/employeeActivity/employeeActivityVacation';
import { infoEmployeeActivitySickLeave } from 'store/actions/employeeActivity/employeeActivitySickLeave';
import { infoEmployeeActivityBusinessTrip } from 'store/actions/employeeActivity/employeeActivityBusinessTrip';
import { infoEmployeeActivityFire } from 'store/actions/employeeActivity/employeeActivityFire';
import { infoEmployeeActivityAppointment } from 'store/actions/employeeActivity/employeeActivityAppointment';
import { infoEmployeeActivityTimeOff } from 'store/actions/employeeActivity/employeeActivityTimeOff';
import { fetchWorker, fetchEmployeeActivity } from 'store/actions/hrm/workers';

import { workerOperationTypes } from 'utils';

import getEmployeeActivityDetails from '../Shared/getEmployeeActivityDetails';

import EntranceOperation from './EntranceOperation';
import AppointmentOperation from './AppointmentOperation';
import FireOperation from './FireOperation';
import BusinessTripOperation from './BusinessTripOperation';
import SickLeaveOperation from './SickLeaveOperation';
import VacationOperation from './VacationOperation';
import TimeOffOperation from './TimeOffOperation';

import styles from './styles.module.scss';

function OperationsTable(props) {
  const {
    isLoading,
    employeeActivities,
    infoEmployeeActivityVacation,
    vacation,
    infoEmployeeActivitySickLeave,
    sickLeave,
    infoEmployeeActivityBusinessTrip,
    businessTrip,
    infoEmployeeActivityFire,
    fire,
    infoEmployeeActivityAppointment,
    appointment,
    infoEmployeeActivityTimeOff,
    timeOff,
    infoLoading,
    fetchEmployeeActivity,
    entrance,
    filters,
    onFilter,
  } = props;
  const [operationType, setOperationType] = useState(null);
  const [rowId, setRowId] = useState(null);
  const handleSortTable = (orderBy, order) => {
    onFilter('order', order);
    onFilter('orderBy', orderBy);
  };
  const userColumns = [
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      render: (value, row, index) => index + 1,
    },
    {
      title: 'Əməkdaş',
      key: 'fullName',
      width: 250,
      render: (text, record) => (
        <InfoCard
          name={record.name}
          surname={record.surname}
          patronymic={record.patronymic}
          occupationName={record.occupationName}
          attachmentUrl={record.attachmentUrl}
          width="32px"
          height="32px"
        />
      ),
    },
    {
      title: 'Bölmə',
      dataIndex: 'structureName',
      width: 140,
      ellipsis: true,
      render: text => (
        <Tooltip placement="topLeft" title={text || ''}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>Əməliyyat tarixi</span>
          <div className={styles.buttonSortIcon}>
            <FaCaretUp
              color={
                filters.orderBy === 'createdAt' && filters.order === 'asc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('createdAt', 'asc')}
            />
            <FaCaretDown
              color={
                filters.orderBy === 'createdAt' && filters.order === 'desc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('createdAt', 'desc')}
            />
          </div>
        </div>
      ),
      dataIndex: 'createdAt',
      width: 140,
      render: createdAt => createdAt || ' - ',
    },
    {
      title: 'Əməliyyat növü',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: type => getEmployeeActivityDetails(type),
    },
  ];
  const removeOperationType = () => {
    setOperationType(null);
  };

  useEffect(() => {
    if (employeeActivities.length > 0) {
      detailForm(employeeActivities[0]);
    }
  }, [employeeActivities]);

  const detailForm = data => {
    const { id, type, employeeId } = data;
    setRowId(id);
    if (type === workerOperationTypes.Entrance) {
      // fetchWorker(employeeId);
      fetchEmployeeActivity(id, employeeId); // activity id
    } else if (type === workerOperationTypes.Vacation) {
      infoEmployeeActivityVacation(id);
    } else if (type === workerOperationTypes.SickLeave) {
      infoEmployeeActivitySickLeave(id);
    } else if (type === workerOperationTypes.TimeOff) {
      infoEmployeeActivityTimeOff(id);
    } else if (type === workerOperationTypes.BusinessTrip) {
      infoEmployeeActivityBusinessTrip(id);
    } else if (type === workerOperationTypes.Fire) {
      infoEmployeeActivityFire(id);
    } else if (type === workerOperationTypes.Appointment) {
      infoEmployeeActivityAppointment(id);
    }
    setOperationType(type);
  };

  let rightaActionsBoxContent = null;

  if (operationType) {
    if (operationType === workerOperationTypes.Entrance) {
      rightaActionsBoxContent = <EntranceOperation infoData={entrance} />;
    } else if (operationType === workerOperationTypes.Vacation) {
      rightaActionsBoxContent = (
        <VacationOperation
          infoData={vacation}
          removeOperationType={removeOperationType}
        />
      );
    } else if (operationType === workerOperationTypes.TimeOff) {
      rightaActionsBoxContent = (
        <TimeOffOperation
          infoData={timeOff}
          removeOperationType={removeOperationType}
        />
      );
    } else if (operationType === workerOperationTypes.Fire) {
      rightaActionsBoxContent = (
        <FireOperation
          infoData={fire}
          removeOperationType={removeOperationType}
        />
      );
    } else if (operationType === workerOperationTypes.BusinessTrip) {
      rightaActionsBoxContent = (
        <BusinessTripOperation
          infoData={businessTrip}
          removeOperationType={removeOperationType}
        />
      );
    } else if (operationType === workerOperationTypes.SickLeave) {
      rightaActionsBoxContent = (
        <SickLeaveOperation
          infoData={sickLeave}
          removeOperationType={removeOperationType}
        />
      );
    } else if (operationType === workerOperationTypes.Appointment) {
      rightaActionsBoxContent = (
        <AppointmentOperation
          infoData={appointment}
          removeOperationType={removeOperationType}
        />
      );
    }
  }

  return (
    <Row gutter={8}>
      <Col xl={16} xxl={18} className="paddingBottom70">
        <div className={styles.tableCustomStyle}>
          <Table
            bordered={false}
            loading={isLoading}
            dataSource={employeeActivities}
            rowKey={record => record.id}
            columns={userColumns}
            onRow={data => ({
              onClick: () => detailForm(data),
            })}
            rowClassName={record => {
              let className = '';
              if (record.id === rowId) className = styles.activeRow;
              return className;
            }}
          />
        </div>
      </Col>
      <Col xl={8} xxl={6}>
        <Spin spinning={infoLoading}>
          <Affix
            offsetTop={10}
            target={() => document.getElementById('hrmArea')}
          >
            <div className={`${styles.infoContainer} scrollbar`}>
              {rightaActionsBoxContent}
            </div>
          </Affix>
        </Spin>
      </Col>
    </Row>
  );
}

const mapStateToProps = state => ({
  employeeActivities: state.employeeActivitiesReducer.employeeActivities,
  isLoading: !!state.loadings.fetchEmployeeActivities,

  vacation: state.vacationReducer.data,
  entrance: state.workersReducer.worker,
  sickLeave: state.sickLeaveReducer.data,
  businessTrip: state.businessTripReducer.data,
  fire: state.fireReducer.data,
  appointment: state.appointmentReducer.data,
  timeOff: state.timeOffReducer.data,
  infoLoading:
    state.vacationReducer.isLoading ||
    state.sickLeaveReducer.isLoading ||
    state.businessTripReducer.isLoading ||
    state.fireReducer.isLoading ||
    state.appointmentReducer.isLoading ||
    state.timeOffReducer.isLoading ||
    state.workersReducer.isLoading,
});

export default connect(
  mapStateToProps,
  {
    infoEmployeeActivityVacation,
    infoEmployeeActivitySickLeave,
    infoEmployeeActivityBusinessTrip,
    infoEmployeeActivityFire,
    infoEmployeeActivityAppointment,
    infoEmployeeActivityTimeOff,
    fetchWorker,
    fetchEmployeeActivity,
  }
)(OperationsTable);
