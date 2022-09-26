/* eslint-disable jsx-a11y/alt-text */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { InfoBoxItem, InfoCard, ProFormItem, Can } from 'components/Lib';
import { Button, Checkbox } from 'antd';
import { FaTrash, FaUser } from 'react-icons/fa';

import {
  addToBlackListWorker,
  removeToBlackListWorker,
  deleteWorker,
  fetchDismissedWorkers,
} from 'store/actions/hrm/workers';

import { permissions, accessTypes } from 'config/permissions';

import styles from './styles.module.scss';

const employmentTypes = {
  1: 'Tam ştat',
  2: 'Yarım ştat',
  3: 'Ştatdan kənar',
};

function DismissedPeopleInfoBox(props) {
  const {
    dismissedWorkersLoading,
    fetchDismissedWorkers,
    workerData,
    addToBlackListWorker,
    removeToBlackListWorker,
    setIsOpenDeleteModal,
    setIsOpenWarningModal,
  } = props;

  const {
    name,
    surname,
    patronymic,
    occupationName,
    attachmentUrl,
    hireDate,
    contractNumber,
    workScheduleName,
    isInBlacklist,
    calendarName,
    finCode,
    gender,
    birthday,
    employmentType,
    salary,
    currencyName,
    email,
    mobileNumber,
    address,
    fireOrderNumber,
    fireDate,
    fireNote,
    fireReasonName,
  } = workerData || {};

  const history = useHistory();
  const [activeTab, setActiveTab] = useState(1);

  const onChangeCheckBox = React.useCallback(
    checked => {
      if (checked === true) {
        addToBlackListWorker(workerData.id, () => fetchDismissedWorkers());
      } else {
        removeToBlackListWorker(workerData.id, () => fetchDismissedWorkers());
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workerData]
  );

  return (
    <div className={styles.infoBox}>
      <div className={`${styles.padding24} ${styles.header}`}>
        <InfoCard
          name={name}
          surname={surname}
          patronymic={patronymic}
          occupationName={occupationName}
          attachmentUrl={attachmentUrl}
          width="48px"
          height="48px"
        />
      </div>
      <div>
        <div className={styles.flexCenter}>
          <Button
            type="primary"
            size="large"
            className={`${styles.btnTab} ${
              activeTab === 1 ? styles.activeTab : ''
            }`}
            onClick={() => {
              setActiveTab(1);
            }}
          >
            Ətraflı
          </Button>
          <Button
            type="primary"
            size="large"
            className={`${styles.btnTab} ${
              activeTab === 2 ? styles.activeTab : ''
            }`}
            onClick={() => {
              setActiveTab(2);
            }}
          >
            Xitam
          </Button>
        </div>
        <div className={styles.padding24}>
          {activeTab === 1 ? (
            <div>
              <InfoBoxItem label="İşə başlama tarixi" text={hireDate} />
              <InfoBoxItem
                label="Əmək müqaviləsi nömrəsi"
                text={contractNumber}
              />
              <InfoBoxItem label="İş qrafiki" text={workScheduleName} />
              <InfoBoxItem label="Təqvim adı" text={calendarName} />
              <InfoBoxItem label="Fin kod" text={finCode} />
              <InfoBoxItem
                label="Cinsi"
                text={gender === 1 ? 'Kişi' : 'Qadın'}
              />
              <InfoBoxItem label="Doğum tarixi" text={birthday} />
              <InfoBoxItem
                label="Ştat növü"
                text={employmentTypes[employmentType]}
              />
              <InfoBoxItem label="Əməkhaqqı" text={salary} />
              <InfoBoxItem label="Ödəniş valyutası" text={currencyName} />
              <InfoBoxItem label="Email" text={email} />
              <InfoBoxItem label="Telefon" text={mobileNumber} />
              <InfoBoxItem label="Yaşadığı ünvan" text={address} />
            </div>
          ) : (
            <div>
              <InfoBoxItem label="Əmr nömrəsi" text={fireOrderNumber} />
              <InfoBoxItem label="Xitam tarixi" text={fireDate} />
              <InfoBoxItem label="Əsas" text={fireReasonName} />
              <InfoBoxItem label="Qeyd" text={fireNote} />

              <Can I={accessTypes.manage} a={permissions.hrm_fired_employees}>
                <ProFormItem>
                  <Checkbox
                    name="isInBlacklist"
                    className={styles.checkbox}
                    disabled={dismissedWorkersLoading}
                    checked={isInBlacklist}
                    onChange={({ target: { checked } }) =>
                      onChangeCheckBox(checked)
                    }
                  >
                    Qara siyahı
                  </Checkbox>
                </ProFormItem>
              </Can>
            </div>
          )}
        </div>
        <Can I={accessTypes.manage} a={permissions.hrm_fired_employees}>
          <div className={`${styles.flexCenter} ${styles.padding24}`}>
            <Button
              type="danger"
              size="large"
              className={styles.remove}
              onClick={() => setIsOpenDeleteModal(true)}
              disabled={isInBlacklist}
            >
              <FaTrash />
              Sil
            </Button>
            <Button
              type="primary"
              size="large"
              className={styles.accept}
              disabled={isInBlacklist}
              onClick={() => {
                if (workerData.isInBlackList) {
                  setIsOpenWarningModal(true);
                } else {
                  history.replace(
                    `/hrm/employees/dismissed-people/edit/${workerData.id}`
                  );
                }
              }}
            >
              <FaUser /> İşə qəbul et
            </Button>
          </div>
        </Can>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  isLoading: state.workersReducer.isLoading,
  dismissedWorkersLoading: state.loadings.dismissedWorkers,
});

export default connect(
  mapStateToProps,
  {
    fetchDismissedWorkers,
    addToBlackListWorker,
    removeToBlackListWorker,
    deleteWorker,
  }
)(DismissedPeopleInfoBox);
