import React from 'react';
import styles from './styles.module.scss';
const Section = ({ section, value }) => (
    <div className={styles.details}>
      <span className={styles.section}>{section}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );

  export default Section;