import React from 'react';
import { Modal, Button } from 'antd';

import styles from './styles.module.scss';

export function AddFormModal({
  withOutConfirm = false,
  confirmText,
  children,
  onConfirm,
  loading,
  ...rest
}) {
  return (
    <Modal
      footer={
        !withOutConfirm && (
          <Button
            key="submit"
            onClick={onConfirm}
            loading={loading}
            className={styles.confirmButton}
            type="primary"
          >
            {confirmText}
          </Button>
        )
      }
      className={styles.customModal}
      centered
      {...rest}
    >
      {children}
    </Modal>
  );
}
