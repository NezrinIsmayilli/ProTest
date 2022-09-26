/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Row, Col, Affix, Tooltip } from 'antd';
import {
  Table,
  InfoCard,
  Can,
  ProDots,
  ProDotsItem,
  DetailButton,
} from 'components/Lib';

import { toast } from 'react-toastify';
import swal from '@sweetalert/with-react';
import { permissions, accessTypes } from 'config/permissions';
import { workerOperationTypes } from 'utils';
import { deleteWorker, fetchFilteredWorkers } from 'store/actions/hrm/workers';
import InfoWorker from './InfoWorker';
import VacationForm from '../Shared/Operations/VacationForm';
import FireForm from '../Shared/Operations/FireForm';
import TimeOffForm from '../Shared/Operations/TimeOffForm';
import BusinessTripForm from '../Shared/Operations/BusinessTripForm';
import SickLeaveForm from '../Shared/Operations/SickLeaveForm';
import AppointmentForm from '../Shared/Operations/AppointmentForm';
import styles from './styles.module.scss';

function renderNames(value) {
  return value || '-';
}

function WorkersTable(props) {
  const {
    isLoading,
    workersFilteredData,
    operationType,
    setOperationType,
    deleteWorker,
    fetchFilteredWorkers,
  } = props;
  const history = useHistory();

  const [infoData, setInfoData] = useState(null);

  function onOperationChange(data) {
    setOperationType(data);
  }

  const handleDeleteWorker = id => {
    swal({
      title: 'Diqqət!',
      text: 'Əməkdaşı silmək istədiyinizə əminsinizmi?',
      buttons: ['İmtina', 'Sil'],
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) {
        deleteWorker(id, () => onSuccesCallBack('Əməkdaş silindi.'));
      }
    });
  };

  function onSuccesCallBack(message) {
    fetchFilteredWorkers({ filters: { lastEmployeeActivityType: 1 } });
    toast.success(message);
  }

  const workerColumns = [
    {
      title: '№',
      dataIndex: 'id',
      align: 'left',
      width: 60,
      render: (value, row, index) => index + 1,
    },
    {
      title: 'Əməkdaş',
      dataIndex: 'name',
      width: 250,
      align: 'left',
      ellipsis: true,
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
      title: 'Kod',
      dataIndex: 'code',
      width: 100,
      align: 'left',
      key: 'code',
      render: text => renderNames(text),
    },
    {
      title: 'Bölmə',
      dataIndex: 'structureName',
      width: 100,
      align: 'left',
      key: 'structureName',
      ellipsis: true,
      render: text => (
        <Tooltip placement="topLeft" title={text || ''}>
          <span>{renderNames(text)}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Vəzifə',
      dataIndex: 'occupationName',
      width: 100,
      align: 'left',
      ellipsis: true,
      render: text => (
        <Tooltip placement="topLeft" title={text || ''}>
          <span>{renderNames(text)}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Seç',
      align: 'center',
      width: 80,
      render: (text, record) => (
        <>
          <DetailButton onClick={() => setInfoData(record)} />
          <Can I={accessTypes.manage} a={permissions.hrm_working_employees}>
            <ProDots>
              <>
                <ProDotsItem
                  label="Məzuniyyət"
                  icon="palma"
                  onClick={() =>
                    onOperationChange(workerOperationTypes.Vacation)
                  }
                />
                <ProDotsItem
                  label="Ezamiyyət"
                  icon="businesstrip"
                  onClick={() =>
                    onOperationChange(workerOperationTypes.BusinessTrip)
                  }
                />

                <ProDotsItem
                  label="Xəstəlik"
                  icon="illness"
                  onClick={() =>
                    onOperationChange(workerOperationTypes.SickLeave)
                  }
                />

                <ProDotsItem
                  label="İcazə"
                  icon="permission"
                  onClick={() =>
                    onOperationChange(workerOperationTypes.TimeOff)
                  }
                />

                <ProDotsItem
                  label="İş görüşü"
                  icon="appoinment"
                  onClick={() =>
                    onOperationChange(workerOperationTypes.Appointment)
                  }
                />

                <ProDotsItem
                  label="Ə.M Xitam"
                  icon="workend"
                  onClick={() => onOperationChange(workerOperationTypes.Fire)}
                />
                <ProDotsItem
                  label="Düzəliş"
                  icon="pencil"
                  onClick={() =>
                    history.push(`/hrm/employees/workers/edit/${record.id}`)
                  }
                />
                <ProDotsItem
                  label="Sil"
                  icon="trash"
                  onClick={() => handleDeleteWorker(record.id)}
                />
              </>
            </ProDots>
          </Can>
        </>
      ),
    },
  ];

  function infoBoxFunc(id) {
    const arr = workersFilteredData.find(item => item.id === id);
    setInfoData(arr);
  }
  let rightaActionsBoxContent = null;
  if (operationType) {
    if (operationType === workerOperationTypes.Vacation) {
      rightaActionsBoxContent = (
        <VacationForm
          infoData={infoData}
          id={infoData.id}
          handleCancel={onOperationChange}
        />
      );
    } else if (operationType === workerOperationTypes.TimeOff) {
      rightaActionsBoxContent = (
        <TimeOffForm
          infoData={infoData}
          id={infoData.id}
          handleCancel={onOperationChange}
        />
      );
    } else if (operationType === workerOperationTypes.Fire) {
      rightaActionsBoxContent = (
        <FireForm
          infoData={infoData}
          id={infoData.id}
          handleCancel={onOperationChange}
        />
      );
    } else if (operationType === workerOperationTypes.BusinessTrip) {
      rightaActionsBoxContent = (
        <BusinessTripForm
          infoData={infoData}
          id={infoData.id}
          handleCancel={onOperationChange}
        />
      );
    } else if (operationType === workerOperationTypes.SickLeave) {
      rightaActionsBoxContent = (
        <SickLeaveForm
          infoData={infoData}
          id={infoData.id}
          handleCancel={onOperationChange}
        />
      );
    } else if (operationType === workerOperationTypes.Appointment) {
      rightaActionsBoxContent = (
        <AppointmentForm
          infoData={infoData}
          id={infoData.id}
          handleCancel={onOperationChange}
        />
      );
    }
  }

  const setFirstWorkerDetails = workersFilteredData => {
    return workersFilteredData.length > 0
      ? setInfoData(workersFilteredData[0])
      : setInfoData(null);
  };

  useEffect(() => {
    setFirstWorkerDetails(workersFilteredData);
  }, [workersFilteredData]);

  return (
    <Row gutter={8}>
      <Col xl={16} xxl={18} className="paddingBottom70">
        <Table
          bordered={false}
          loading={isLoading}
          className={styles.hrmTable}
          dataSource={workersFilteredData}
          rowKey={record => record.id}
          columns={workerColumns}
          onRow={data => ({
            onClick: () => infoBoxFunc(data.id),
          })}
          rowClassName={record => {
            let className = '';
            if (record.id === (infoData && infoData.id))
              className = `${styles.activeRow}`;
            return className;
          }}
        />
      </Col>

      <Col xl={8} xxl={6}>
        <Affix offsetTop={10} target={() => document.getElementById('hrmArea')}>
          <div className={`${styles.infoContainer} scrollbar`}>
            {infoData && operationType === null && (
              <InfoWorker infoData={infoData} />
            )}
            {rightaActionsBoxContent}
          </div>
        </Affix>
      </Col>
    </Row>
  );
}

const mapStateToProps = state => ({
  workersFilteredData: state.workersReducer.workersFilteredData,
  isLoading: state.workersReducer.isLoading,
});

export default connect(
  mapStateToProps,
  { deleteWorker, fetchFilteredWorkers, }
)(WorkersTable);
