/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';

import { Table } from 'components/Lib';

// actions
import {
  deleteArchiveEmployee,
  fetchArchiveEmployees,
  setSelectedEmployee,
  resetTimecardData,
} from 'store/actions/hrm/timecard';

import Fullname from './Fullname';
import EditableCell from './EditableCell';

import styles from '../styles.module.scss';

const arrayFromDaysInMonth = Array.from(Array(moment().daysInMonth()).keys());

function WorkTimeRecordTable(props) {
  const {
    archiveEmployees,
    selectedArchive,
    selectedEmployee,

    isTableLoading,
    isDeleteLoading,

    deleteArchiveEmployee,
    fetchArchiveEmployees,
    setSelectedEmployee,
    resetTimecardData,
  } = props;

  useEffect(
    () => () => {
      resetTimecardData();
    },
    []
  );

  const { id: selectedArchiveId } = selectedArchive;

  function handleDelete(archiveId) {
    deleteArchiveEmployee(archiveId, () => onSucces(archiveId));
  }

  function onSucces(archiveId) {
    fetchArchiveEmployees(selectedArchiveId);
    if (selectedEmployee?.id === archiveId) {
      setSelectedEmployee({
        attribute: null,
      });
    }
  }

  // if (archiveEmployees.length === 0 && !isTableLoading) {
  //   return <ProEmpty />;
  // }

  const columns = [
    {
      title: '№',
      // dataIndex: 'id',
      key: 'id',
      width: 60,
      fixed: 'left',
      align: 'center',
      render: (value, row, index) => index + 1,
    },
    {
      title: 'Əməkdaş',
      // dataIndex: '',
      key: 'fullname',
      align: 'left',
      fixed: 'left',
      width: 400,
      render: (value, row) => (
        <Fullname
          employeeName={row.employeeName}
          employeeSurname={row.employeeSurname}
          employeePatronymic={row.employeePatronymic}
          employeeOccupationName={row.occupationName}
          employeeAttachmentUrl={row.image}
          isDeleteLoading={isDeleteLoading}
          canDelete={row?.id}
          onDelete={() => {
            // delete template archive id // check it can be delete
            if (row?.id) {
              handleDelete(row.id);
            }
          }}
        />
      ),
    },
  ];

  const days = archiveEmployees[0]?.days || arrayFromDaysInMonth;

  const daysCols = days.map((day, index) => ({
    title: index + 1,
    key: day.id ? day.id : day.date,
    width: 60,
    dataIndex: `days[${index}]`,
    align: 'center',
    render: (value, row) => <EditableCell row={row.days[index]} />,
  }));

  const generatedColumns = [...columns, ...daysCols];
  useEffect(() => {
    if (archiveEmployees.length > 0) {
      setSelectedEmployee({ attribute: archiveEmployees[0] });
    }
  }, [archiveEmployees]);
  function handleRowClick(data) {
    return {
      onClick: () => {
        setSelectedEmployee({
          attribute: data,
        });
      },
    };
  }

  return (
    <Table
      size="middle"
      rowClassName={styles.row}
      className={`${styles.table} ${
        isTableLoading || archiveEmployees.length === 0 ? styles.hideScroll : ''
      }`}
      loading={isTableLoading}
      dataSource={archiveEmployees}
      columns={generatedColumns}
      rowKey={record => record.employeeId}
      onRow={handleRowClick}
      scroll={{ x: 'max-content' }}
    />
  );
}

const mapStateToProps = state => ({
  archiveEmployees: state.hrmTimecardReducer.archiveEmployees,
  selectedArchive: state.hrmTimecardReducer.selectedArchive,
  selectedEmployee: state.hrmTimecardReducer.selectedEmployee,

  isDeleteLoading: !!state.loadings.deleteArchiveEmployee,
  isTableLoading:
    !!state.loadings.fetchArchiveEmployees ||
    !!state.loadings.fetchTimecardArchivesByDate,
});

export default connect(
  mapStateToProps,
  {
    deleteArchiveEmployee,
    fetchArchiveEmployees,
    setSelectedEmployee,
    resetTimecardData,
  }
)(WorkTimeRecordTable);
