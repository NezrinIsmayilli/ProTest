import React, { useState } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Modal, Button, Avatar } from 'antd';
// utils
import { fetchAnnouncementById } from 'store/actions/jobs/announcements';

import AnnouncementDetailsTab from '../Tabs/AnnouncementDetailsTab';
import PersonDetailsTab from '../Tabs/PersonDetailsTab';
import styles from './styles.module.scss';

function MoreDetails(props) {
  const { visible, setIsVisible, openInterviewCalendar, announcement } = props;
  const {
    name = '',
    surname = '',
    patronymic = '',
    announcementName = '',
    createdAt = '',
    image = '',
  } = announcement || {};

  const [activeTab, setActiveTab] = useState(0);
  const handleChangeTab = value => setActiveTab(value);

  function formatDate(date) {
    return date ? moment(date).format('DD.MM.YYYY') : '';
  }

  const getTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <AnnouncementDetailsTab
            openInterviewCalendar={openInterviewCalendar}
          />
        );
      case 1:
        return <PersonDetailsTab />;
      default:
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
          padding: '32px 20px',
        }}
      >
        <div className={styles.profile}>
          <Avatar size={50} src={image} icon="user" />
          <div className={styles.profileRight}>
            <h5 className={styles.profileName}>
              {name} {surname} {patronymic}
            </h5>
            <h6>
              <span>{announcementName}</span>
            </h6>
            <h6>Elanın tarixi: {formatDate(createdAt)}</h6>
          </div>
        </div>

        <div className={styles.detailsTab}>
          <Button
            size="large"
            type={activeTab === 0 ? 'primary' : ''}
            onClick={() => handleChangeTab(0)}
          >
            Elan
          </Button>
          <Button
            size="large"
            type={activeTab === 1 ? 'primary' : ''}
            onClick={() => handleChangeTab(1)}
          >
            Namizəd
          </Button>
        </div>

        {getTabContent()}
      </div>
    </Modal>
  );
}

const mapStateToProps = state => ({
  announcement: state.announcementsReducer.announcement,
  selectedAnnouncement: state.announcementsReducer.selectedAnnouncement,
  announcementLoading: !!state.loadings.fetchAnnouncementById,
});

export default connect(
  mapStateToProps,
  {
    fetchAnnouncementById,
  }
)(MoreDetails);
