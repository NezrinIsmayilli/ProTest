import React from 'react';
import styles from './styles.module.scss';

const FooterRow = ({ primary, quantity, secondary, color = '#7c7c7c' }) => (
  <div className={styles.opInvoiceContentFooter} style={{ color }}>
    <strong>{primary}</strong>
    <strong>{quantity}</strong>
    <strong>{secondary}</strong>
  </div>
);

export default FooterRow;
