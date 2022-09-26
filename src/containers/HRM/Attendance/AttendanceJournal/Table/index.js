import React, { useRef } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';

// components
import { Row, Col, Icon, Spin } from 'antd';
import { Table, InfoCard } from 'components/Lib';

// import { permissions, accessTypes } from 'config/permissions';

// actions
import { editTimeCard, fetchTimeCard } from 'store/actions/hrm/attendance';

import Status from './Status';
import TimePicker from './TimePicker';

const antIcon = <Icon type="loading" style={{ fontSize: 20 }} spin />;

function AttendanceJournalTable(props) {
  const {
    isLoading,
    isEditSuccesLoading,
    isEditLoading,

    filteredTimeCard,
    date,
    editTimeCard,
    fetchTimeCard,
  } = props;

  const inTimeRef = useRef('');
  const outTimeRef = useRef('');
  const employeeRef = useRef(null);

  function handleInTimeChange(inTime, row) {
    inTimeRef.current = inTime || null;

    // reset outTime if id is diffirent
    if (employeeRef.current !== row.employeeId) {
      outTimeRef.current = row.outTime || null;
    }

    if (row.outTime) {
      outTimeRef.current = row.outTime;
    }

    employeeRef.current = row.employeeId;

    if (inTime && outTimeRef.current && inTime > outTimeRef.current) {
      toast.error('“Gəldi” vaxtı “Getdi” vaxtından sonra yazıla bilməz', {
        className: 'error-toast',
      });
    } else {
      editEmployeeTimeCard(row);
    }
  }

  function handleOutTimeChange(outTime, row) {
    outTimeRef.current = outTime || null;

    // reset inTime if id is diffirent
    if (employeeRef.current !== row.employeeId) {
      inTimeRef.current = row.inTime || null;
    }
    if (row.inTime) {
      inTimeRef.current = row.inTime;
    }

    employeeRef.current = row.employeeId;

    if (outTime && inTimeRef.current && outTime < inTimeRef.current) {
      toast.error('“Getdi” vaxtları “Gəldi” vaxtından əvvələ yazıla bilməz', {
        className: 'error-toast',
      });
    } else {
      editEmployeeTimeCard(row);
    }
  }

  function editEmployeeTimeCard() {
    const data = {
      date,
      inTime: inTimeRef.current || null,
      outTime: outTimeRef.current || null,
      employee: employeeRef.current,
    };

    editTimeCard(data, onSuccess);
  }

  function onSuccess() {
    fetchTimeCard({}, date, 'nofetchTimeCard');
  }

  // COLUMNS
  const columns = [
    {
      title: '№',
      key: 'index',
      width: 60,
      render: (value, row, index) => index + 1,
    },

    {
      title: 'Tarix',
      dataIndex: 'attendanceDate',
      key: 'date',
      width: 130,
      render: () => date,
    },

    {
      title: 'Əməkdaş',
      dataIndex: 'employee',
      key: 'employee',
      width: 220,
      render: (value, row) => (
        <InfoCard
          name={row.employeeName}
          surname={row.employeeSurname}
          patronymic={row.employeePatronymic}
          occupationName={row.employeeOccupationName}
          attachmentUrl={row.employeeAttachmentUrl}
          width="32px"
          height="32px"
        />
      ),
    },

    {
      title: 'Gəldi',
      dataIndex: 'inTime',
      width: 150,
      key: 'inTime',
      render: (value, row) => (
        <TimePicker
          value={value}
          label="Indi gəldi"
          row={row}
          sendChangedTime={handleInTimeChange}
        />
      ),
    },

    {
      title: 'Getdi',
      dataIndex: 'outTime',
      width: 150,
      key: 'outTime',
      render: (value, row) => (
        <TimePicker
          value={value}
          label="Indi getdi"
          row={row}
          sendChangedTime={handleOutTimeChange}
        />
      ),
    },

    {
      title: 'Status',
      dataIndex: 'employeeActivityTitle',
      key: 'employeeActivityTitle',
      width: 110,
      align: 'center',
      render: (value, row) => (
        <div style={{ whiteSpace: 'nowrap' }}>
          <Status
            value={value}
            type={row.employeeActivityType}
            currentEmployeeId={null}
          />
          <Spin
            indicator={antIcon}
            // size="small"
            spinning={
              row.employeeId === employeeRef.current &&
              (isEditSuccesLoading || isEditLoading)
            }
          />
        </div>
      ),
    },
  ];

  return (
    <Row gutter={32}>
      <Col span={24} className="paddingBottom70">
        <Table
          size="middle"
          loading={isLoading}
          dataSource={filteredTimeCard}
          columns={columns}
          rowKey={record => record.id}
        />
      </Col>
    </Row>
  );
}

AttendanceJournalTable.displayName = 'AttendanceJournalTable';

const mapStateToProps = state => ({
  isLoading: !!state.loadings.fetchTimeCard,
  isEditSuccesLoading: !!state.loadings.nofetchTimeCard,
  isEditLoading: !!state.loadings.editTimeCard,
  filteredTimeCard: state.attendanceReducer.filteredTimeCard,
  date: state.attendanceReducer.date,
});

export default connect(
  mapStateToProps,
  {
    editTimeCard,
    fetchTimeCard,
  }
)(AttendanceJournalTable);
