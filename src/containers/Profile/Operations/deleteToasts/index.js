import React from 'react';
// components
import { Button, Modal, Spin } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import styles from './index.module.scss';

function DeleteToasts(props) {
  const { visible, toggleVisible, data, setData } = props;

  const closeBtn = () => {
    toggleVisible(false);
    setData({});
  };
  return (
    <Modal
      visible={visible}
      closable={false}
      centered
      width={data && data?.status === 'success' ? 400 : 600}
      footer={null}
      className={styles.customModal}
      destroyOnClose
    >
      {data && data?.status === 'success' ? (
        <div className={styles.MoreDetails}>
          <div className={styles.text}>
            <p>Məlumatlar uğurla silindi</p>
          </div>
          <div className={styles.successBtn}>
            <CheckCircleFilled />
          </div>
          <div className={styles.closeBtn}>
            <div className={styles.one}>
              {' '}
              <Button onClick={closeBtn}>Bağla</Button>
            </div>
          </div>
        </div>
      ) : data && data?.status !== undefined && data?.status !== 'success' ? (
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
              <Button type="primary" onClick={closeBtn}>
                Yenidən cəhd et
              </Button>
            </div>
            <div className={styles.one}>
              {' '}
              <Button onClick={closeBtn}>Bağla</Button>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.MoreDetails}>
          <div className={styles.slider}>
            <ul>
              <li>
                <div className={styles.sliderContainer}>
                  Bron əməliyyatları silinir...
                </div>
              </li>
              <li>
                <div className={styles.sliderContainer}>
                  Ticarət əməliyyatları silinir...
                </div>
              </li>
              <li>
                <div className={styles.sliderContainer}>
                  Maliyyə əməliyyatları silinir...
                </div>
              </li>
              <li>
                <div className={styles.sliderContainer}>
                  İstehsalat əməliyyatları silinir...
                </div>
              </li>
            </ul>
          </div>

          <div className={styles.spin}>
            <Spin />
          </div>
        </div>
      )}
    </Modal>
  );
}

export default DeleteToasts;
