import React from 'react';
import { ProModal } from 'components/Lib';
import { Link } from 'react-router-dom';
import { ReactComponent as Logo } from 'assets/img/logo_smb_min.svg';
import styles from './styles.module.scss';

export default function InformModal(props) {
  const { isVisible, handleModal, displayName } = props;
  return (
    <ProModal
      maskClosable
      isVisible={isVisible}
      handleModal={handleModal}
      width={500}
      centered
      padding
    >
      <div className={styles.wrapper}>
        <div className={styles.layout}>
          <Link to="/" className={styles.logo}>
            <Logo height={56} />
          </Link>
        </div>
        <p className={styles.title}>Hörmətli {displayName},</p>
        <p className={styles.inform}>
          Prospect Cloud ERP sistemindən{' '}
          <span style={{ color: '#2AB07F', fontWeight: 700 }}>
            30 gün ödənişsiz istifadə{' '}
          </span>
          etmək üçün göndərdiyiniz sorğu qeydə alınmışdır. Ən qısa zamanda
          əməkdaşlarımız tərəfindən sizinlə əlaqə saxlanılacaq.
        </p>
        <p className={styles.auth}>
          *Qeydiyyat zamanı daxil etdiyiniz email və şifrə, sizin sorğunuz qəbul
          olunduqdan sonra aktivləşəcəkdir.
        </p>
        <p className={styles.footer}>Hörmətlə,</p>
        <p className={styles.footer}>Prospect ERP komandası</p>
      </div>
    </ProModal>
  );
}
