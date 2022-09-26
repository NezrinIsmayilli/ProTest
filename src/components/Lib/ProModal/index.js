import React from 'react';
import { Spin, Button, Modal } from 'antd';
import styles from './styles.module.scss';

export const ProModal = props => {
  const {
    isVisible = false,
    isLoading = false,
    maskClosable = false,
    padding = false,
    width = 1200,
    handleModal = () => { },
    customStyles,
    children,
    ...rest
  } = props;
  return (
    <Modal
      visible={isVisible}
      footer={null}
      width={width}
      className={`${styles.customModal} ${customStyles}`}
      closable={false}
      maskClosable={maskClosable}
      onCancel={handleModal}
      {...rest}
    >
      {padding ? (
        <Spin spinning={isLoading}>
          <Button
            className={styles.closeButton}
            size="large"
            onClick={handleModal}
          >
            <img
              width={14}
              height={14}
              src="/img/icons/X.svg"
              alt="trash"
              className={styles.icon}
            />
          </Button>
          <div className={styles.container}>{children}</div>
        </Spin>
      ) : (
        <Spin spinning={isLoading}>
          <Button
            className={styles.closeButton}
            size="large"
            onClick={handleModal}
          >
            <img
              width={14}
              height={14}
              src="/img/icons/X.svg"
              alt="trash"
              className={styles.icon}
            />
          </Button>
          {children}
        </Spin>
      )}
    </Modal>
  );
};
