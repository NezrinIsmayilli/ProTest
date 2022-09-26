/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { ProModal, ProTextArea } from 'components/Lib';
import { setDescription } from 'store/actions/sales-operation';
import { Button } from 'antd';
import styles from '../../styles.module.scss';

const AddDescriptionModal = ({
  isVisible,
  toggleModal,
  description,
  setDescription,
}) => {
  const [draftDescription, setDraftDescription] = useState(undefined);

  const handleModal = () => {
    toggleModal();
  };

  const handleDescriptionChange = event => {
    setDraftDescription(event.target.value);
  };
  const handleConfirmClick = () => {
    setDescription({ newDescription: draftDescription });
    toggleModal();
  };

  useEffect(() => {
    setDraftDescription(description);
  }, [description]);
  return (
    <ProModal
      maskClosable
      width={800}
      isVisible={isVisible}
      customStyles={styles.AddDescriptionModal}
      handleModal={handleModal}
    >
      <div className={styles.AddDescription}>
        <h2>Əlavə məlumat</h2>
        <ProTextArea
          value={draftDescription}
          onChange={handleDescriptionChange}
        />
        <Button
          type="primary"
          style={{ marginTop: '20px' }}
          className={styles.confirmButton}
          onClick={handleConfirmClick}
        >
          Təsdiq et
        </Button>
      </div>
    </ProModal>
  );
};

const mapStateToProps = state => ({
  description: state.salesOperation.description,
});

export const AddDescription = connect(
  mapStateToProps,
  {
    setDescription,
  }
)(AddDescriptionModal);
