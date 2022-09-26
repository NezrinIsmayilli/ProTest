import React from 'react';
import { Modal, Button } from 'antd';

import { IoIosClose } from 'react-icons/io';

import styles from './styles.module.scss';

export function ProWarningModal(props) {
  const {
    header = 'Diqqət',
    bodyTitle = 'İmtina etmək istədiyinizdən əminsinizmi?',
    bodyContent = 'İmtina etdiyiniz halda əlavə etdiyiniz məlumatlar yadda saxlanılmadan səhifə bağlanacaq.',
    cancelText = 'Geri',
    continueText = 'Davam et',
    titleIcon,
    open,
    maskClosable,
    okFunc,
    isLoading,
    width = 484,
    ...rest
  } = props;
  return (
    <Modal
      title={titleIcon}
      visible={open}
      wrapClassName={styles.deleteModal}
      centered
      closeIcon={<IoIosClose className={styles.closeIcon} />}
      maskClosable={maskClosable}
      width={width}
      footer={null}
      {...rest}
    >
      <h3 className={styles.title}>{header}</h3>
      <div className={styles.desc}>
        <p>{bodyTitle}</p>
        <p>{bodyContent}</p>
      </div>
      <div className={styles.modalButtons}>
        {continueText !== null && (
          <Button
            type="button"
            className={styles.deleteButton}
            onClick={okFunc}
            loading={isLoading}
          >
            <span>{continueText}</span>
          </Button>
        )}
        {cancelText !== null && (
          <Button
            type="button"
            className={styles.cancelButton}
            onClick={rest.onCancel}
          >
            <span>{cancelText}</span>
          </Button>
        )}
      </div>
    </Modal>
  );
}

ProWarningModal.displayName = 'ProWarningModal';

ProWarningModal.propTypes = {};
