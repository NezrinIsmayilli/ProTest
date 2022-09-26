import React from 'react';

import styles from '../styles.module.scss';

export default function ModalInfoItem({ label = '', text = '' }) {
  return (
    <div className={styles.modalInfoItem}>
      <div className={styles.modalInfoLabel}>{label}</div>
      <div className={styles.modalInfoText}>{text}</div>
    </div>
  );
}
