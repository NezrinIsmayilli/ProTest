/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { ProModal, ProTextArea } from 'components/Lib';
import { Button } from 'antd';
import styles from '../../../styles.module.scss';

const AddDescriptionModal = ({
    isVisible,
    toggleModal,
    description,
    selectedProducts,
    setSelectedProducts,
}) => {
    const [draftDescription, setDraftDescription] = useState(undefined);

    const handleModal = () => {
        toggleModal();
    };

    const handleDescriptionChange = event => {
        setDraftDescription(event.target.value);
    };
    const handleConfirmClick = () => {
        setSelectedProducts(
            selectedProducts.map(item => ({
                ...item,
                description: draftDescription,
            }))
        );
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
    {}
)(AddDescriptionModal);
