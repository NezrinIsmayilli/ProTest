import React from 'react';
import { Layout } from 'antd';

import styles from './style.module.sass';

const { Content } = Layout;

export function ProfileLayout({ children }) {
  return (
    <section
      className={`aside-without-navigation scrollbar ${styles.profileSection}`}
      id="profile-area"
    >
      <Content className={styles.profileLayoutContent}>{children}</Content>
    </section>
  );
}
