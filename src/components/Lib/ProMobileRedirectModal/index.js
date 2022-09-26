import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'antd';
import { useLocation } from 'react-router-dom';
import { ReactComponent as SmartphoneIcon } from 'assets/img/icons/smartphone.svg';
import styles from './styles.module.scss';

export function ProMobileRedirectModal() {
  const [redirectUrl, setRedirectUrl] = useState('https://prospect.az/');
  const location = useLocation();

  const isDashboard = /^\/dashboard/.test(location.pathname);

  useEffect(() => {
    const source = window.localStorage.getItem('source');

    if (source === 'jobs') {
      setRedirectUrl('https://www.projobs.az/');
    }
  }, []);

  return (
    <Modal
      title={null}
      closable={false}
      maskClosable={false}
      mask={false}
      footer={null}
      width={315}
      wrapClassName={styles.modal}
      visible={!isDashboard}
      centered
    >
      <div className={styles.content}>
        <SmartphoneIcon />

        <p className={styles.title}>
          Hörmətli istifadəçi, Prospect ERP proqram təminatı mobil
          ekran üçün nəzərdə tutulmayıb. Zəhmət olmasa, kompyuter və
          ya noutbuk ekranından daxil olun.
        </p>

        <a href={redirectUrl}>
          <Button type="primary" size="large">
            YAXŞI
          </Button>
        </a>
      </div>
    </Modal>
  );
}
