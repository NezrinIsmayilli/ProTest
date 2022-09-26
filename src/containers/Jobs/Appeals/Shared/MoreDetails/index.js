import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Modal, Button, Avatar } from 'antd';
// actions
import {
  fetchPersonById,
  fetchAppealOriginById,
} from 'store/actions/jobs/appeals';
import { fetchVacancyById } from 'store/actions/jobs/vacancies';
// utils
import { AppealOriginTypes } from 'utils';

import DetailsTab from './ModalTabs/DetailsTab';
import OriginTab from './ModalTabs/OriginTab';
import HistoryTab from './ModalTabs/HistoryTab';
import styles from './styles.module.scss';

function MoreDetails(props) {
  const {
    visible,
    setIsVisible,
    vacancy,
    appealOrigin,
    isLoading,
    isLoadingInvoiceList,
    person,
    selectedAppeal,
    // action
    fetchPersonById,
    fetchVacancyById,
    fetchAppealOriginById,
  } = props;

  const { person: appealPerson, originId, origin } = selectedAppeal || {};
  const id = appealPerson?.id;

  const [activeTab, setActiveTab] = useState(0);
  const handleChangeTab = value => setActiveTab(value);

  // person
  useEffect(() => {
    if (id) {
      fetchPersonById(id);
    }
  }, [id, fetchPersonById]);

  // vacancy
  useEffect(() => {
    if (id) {
      fetchVacancyById(id);
    }
  }, [id, fetchVacancyById]);

  // appealOrigin
  useEffect(() => {
    if (id) {
      fetchAppealOriginById(originId, AppealOriginTypes[origin]);
    }
  }, [id, originId, origin, fetchAppealOriginById]);

  const getTabContent = () => {
    if (person && vacancy) {
      switch (activeTab) {
        case 0:
          return <DetailsTab person={person} />;
        case 1:
          return <OriginTab title={vacancy?.name} vacancy={vacancy} />;
        case 2:
          return <HistoryTab />;
        default:
      }
    }
  };

  return (
    <Modal
      visible={visible}
      footer={null}
      width={700}
      closable={false}
      className={styles.customModal}
      onCancel={() => setIsVisible(false)}
    >
      <Button
        className={styles.closeButton}
        size="large"
        onClick={() => setIsVisible(false)}
      >
        <img
          width={14}
          height={14}
          src="/img/icons/X.svg"
          alt="trash"
          className={styles.icon}
        />
      </Button>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          padding: '32px 24px',
        }}
      >
        <div className={styles.headerInfo}>
          <Avatar size={50} src={person?.detail.image} icon="user" />

          <div className={styles.profileRight}>
            <h5 className={styles.profileName}>
              {person?.detail.name} {person?.detail.surname}{' '}
              {person?.detail.patronymic}
            </h5>
            <h6>
              <span>{person?.username}</span>
            </h6>
          </div>
        </div>
        <div className={styles.detailsTab}>
          <Button
            size="large"
            type={activeTab === 0 ? 'primary' : ''}
            onClick={() => handleChangeTab(0)}
          >
            Ətraflı
          </Button>
          <Button
            size="large"
            type={activeTab === 1 ? 'primary' : ''}
            onClick={() => handleChangeTab(1)}
            disabled={isLoading}
          >
            Mənbə
          </Button>
          <Button
            size="large"
            type={activeTab === 2 ? 'primary' : ''}
            onClick={() => handleChangeTab(2)}
            disabled={isLoadingInvoiceList}
          >
            Tarixçə
          </Button>
        </div>

        {getTabContent()}
      </div>
    </Modal>
  );
}

const mapStateToProps = state => ({
  selectedAppeal: state.appealsReducer.selectedAppeal,
  person: state.appealsReducer.person,
  vacancy: state.vacanciesReducer.vacancy,
  appealOrigin: state.appealsReducer.appealOrigin,
  isLoading: !!state.loadings.fetchAppealOriginById,
  vacancyLoading: !!state.loadings.fetchVacancyById,
  personLoading: !!state.loadings.fetchPersonById,
});

export default connect(
  mapStateToProps,
  {
    fetchPersonById,
    fetchVacancyById,
    fetchAppealOriginById,
  }
)(MoreDetails);
