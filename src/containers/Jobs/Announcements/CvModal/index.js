import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchPersonById } from 'store/actions/jobs/appeals';

import { Modal, Button } from 'antd';
import RenderDownload from 'containers/Jobs/Shared/render-download';
import styles from './styles.module.scss';

function CvModal(props) {
  const {
    visible,
    setIsVisible,
    // data
    selectedAnnouncement,
    personData,
    // action
    fetchPersonById,
  } = props;

  const { person } = selectedAnnouncement || {};
  const id = person?.id;

  useEffect(() => {
    if (id) {
      fetchPersonById(id);
    }
  }, [id, fetchPersonById]);

  return (
    <Modal
      visible={visible}
      footer={null}
      width={350}
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
        <RenderDownload personData={personData} />
      </div>
    </Modal>
  );
}

const mapStateToProps = state => ({
  personData: state.appealsReducer.person,
  selectedAnnouncement: state.announcementsReducer.selectedAnnouncement,
  personLoading: !!state.loadings.fetchPersonById,
});

export default connect(
  mapStateToProps,
  {
    fetchPersonById,
  }
)(CvModal);
