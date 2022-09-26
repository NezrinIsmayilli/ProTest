import React from 'react';
// components
import { Button, Modal } from 'antd';
import { CloseCircleFilled } from '@ant-design/icons';
import styles from './index.module.scss';

function Warning(props) {
  const { visible, toggleVisible, removeStock } = props;

  const closeBtn = () => {
    toggleVisible(false);
  };
  const repeatedly = () => {
    removeStock();
    toggleVisible(false);
  };
  return (
    <Modal
      visible={visible}
      closable={false}
      centered
      width={500}
      footer={null}
      className={styles.customModal}
      destroyOnClose
    >
      <div className={styles.MoreDetails}>
        <div className={styles.text}>
          <p>Xəta baş verdi</p>
        </div>
        <div className={styles.errorBtn}>
          <CloseCircleFilled />
        </div>
        <div className={styles.closeBtn}>
          <div className={styles.two}>
            {' '}
            <Button type="primary" onClick={repeatedly}>
              Yenidən cəhd et
            </Button>
          </div>
          <div className={styles.one}>
            {' '}
            <Button onClick={closeBtn}>Bağla</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default Warning;
