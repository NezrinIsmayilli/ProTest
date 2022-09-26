/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  Table,
  InfoCard,
  DetailButton,
  ProDots,
  ProWarningModal,
  ProDotsItem,
  Can,
} from 'components/Lib';
import { useHistory } from 'react-router-dom';
import { permissions, accessTypes } from 'config/permissions';
import { Row, Col, Affix, Tooltip } from 'antd';
import {
  addToBlackListWorker,
  removeToBlackListWorker,
  deleteWorker,
  fetchDismissedWorkers,
} from 'store/actions/hrm/workers';
import { ReactComponent as UserBlackIcon } from 'assets/img/icons/userblacklist.svg';
import { FaRegTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import DismissedPeopleInfoBox from './DismissedPeopleInfoBox';

import styles from './styles.module.scss';

function renderNames(value) {
  return value || '-';
}

function DismissedPeopleTable(props) {
  const {
    dismissedWorkersFiltered,
    dismissedWorkersLoading,
    fetchDismissedWorkers,
    deleteWorker,
  } = props;
  const history = useHistory();
  // const returnUrl = '/hrm/employees/dismissed-people';

  const [workerData, setWorkerData] = useState();
  const [isOpenWarningModal, setIsOpenWarningModal] = useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);

  const handleNewWorkerClick = id => {
    history.push(`/hrm/employees/dismissed-people/edit/${id}`);
  };
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
      align: 'left',
      width: 280,
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
      align: 'left',
      width: 200,
      render: text => renderNames(text),
    },
    {
      title: 'Bölmə',
      dataIndex: 'structureName',
      align: 'left',
      width: 240,
      ellipsis: true,
      render: text => (
        <Tooltip placement="topLeft" title={text || ''}>
          <span>{renderNames(text)}</span>
        </Tooltip>
      ),
    },
    {},
    {
      title: 'Seç',
      align: 'left',
      width: 80,
      render: (_, row) => (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <DetailButton />
          <Can I={accessTypes.manage} a={permissions.hrm_fired_employees}>
            <ProDots>
              <>
                <ProDotsItem
                  label="İşə qəbul et"
                  icon="pencil"
                  onClick={() => handleNewWorkerClick(row.id)}
                />
                <ProDotsItem
                  label="Sil"
                  icon="trash"
                  onClick={() => handleDeleteWorkerModalOpen(row.id)}
                />
              </>
            </ProDots>
          </Can>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (workerData?.id) {
      const selectedWorker = dismissedWorkersFiltered.filter(
        dismissedWorker => dismissedWorker.id === workerData.id
      )[0];
      if (selectedWorker) {
        setWorkerData(selectedWorker);
      } else {
        setWorkerData(dismissedWorkersFiltered[0]);
      }
    } else {
      setWorkerData(dismissedWorkersFiltered[0]);
    }
  }, [dismissedWorkersFiltered]);

  function infoBoxFunc(id) {
    const worker = dismissedWorkersFiltered.find(item => item.id === id);
    setWorkerData(worker);
  }

  function deleteHandle(id) {
    setIsOpenDeleteModal(false);
    deleteWorker(id, () => onSuccesCallBack('Azad olunan işçi silindi.'));
    setWorkerData(null);
  }

  function onSuccesCallBack(message) {
    fetchDismissedWorkers();
    toast.success(message);
  }

  const handleDeleteWorkerModalOpen = id => {
    setIsOpenDeleteModal(true);
  };

  const handleDeleteWorkerModalClose = () => {
    setIsOpenDeleteModal(false);
  };

  return (
    <Row gutter={8}>
      <Col span={16} className="paddingBottom70">
        <Table
          scroll={{ x: 'max-content' }}
          bordered={false}
          loading={dismissedWorkersLoading}
          dataSource={dismissedWorkersFiltered}
          rowKey={record => record.id}
          columns={workerColumns}
          onRow={data => ({
            onClick: () => {
              infoBoxFunc(data.id);
            },
          })}
          rowClassName={record => {
            let className = '';
            if (record.id === workerData?.id) className = `${styles.activeRow}`;
            return className;
          }}
        />
      </Col>

      <Col span={8}>
        <Affix offsetTop={10} target={() => document.getElementById('hrmArea')}>
          <div className={`${styles.infoContainer} scrollbar`}>
            {workerData?.id && (
              <DismissedPeopleInfoBox
                workerData={workerData}
                setIsOpenDeleteModal={setIsOpenDeleteModal}
                setIsOpenWarningModal={setIsOpenWarningModal}
              />
            )}
          </div>
        </Affix>
      </Col>
      <ProWarningModal
        open={isOpenWarningModal}
        titleIcon={
          <div className={styles.rounded}>
            <UserBlackIcon />
          </div>
        }
        header="İşə qəbul"
        bodyContent="İşə qəbul etmək istədiyiniz işçi daha öncə qara siyahıya əlavə edilmişdir. İşə qəbul etmək üçün öncə qara siyahıdan çıxarmaq lazımdır"
        cancelText={null}
        continueText="Bağla"
        okFunc={() => setIsOpenWarningModal(false)}
      />
      <ProWarningModal
        open={isOpenDeleteModal}
        titleIcon={
          <div className={styles.rounded}>
            <FaRegTrashAlt />
          </div>
        }
        header="İşçini sil"
        bodyContent="İşçini sildiyiniz halda növbəti əməliyyatlarda silinən işçini seçim etmək mümkün olmayacaq. İşçiyə bağlı əvvəlki əməliyyatlar saxlanılacaq, həmin məlumatlara yalnız baxış imkanı olacaq redaktə etmək mümkün olmayacaq."
        cancelText="Geri"
        continueText="Sil"
        okFunc={() => deleteHandle(workerData.id)}
        onCancel={handleDeleteWorkerModalClose}
      />
    </Row>
  );
}

const mapStateToProps = state => ({
  workersFilteredData: state.workersReducer.workersFilteredData,
  dismissedWorkersFiltered: state.workersReducer.dismissedWorkersFiltered,
  isLoading: state.workersReducer.isLoading,
  dismissedWorkersLoading: state.loadings.dismissedWorkers,
});

export default connect(
  mapStateToProps,
  {
    addToBlackListWorker,
    removeToBlackListWorker,
    fetchDismissedWorkers,
    deleteWorker,
  }
)(DismissedPeopleTable);
