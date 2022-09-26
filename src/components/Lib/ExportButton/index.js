import React from 'react';
import { Button } from 'antd';

import { ReactComponent as ExportIcon } from 'assets/img/icons/export.svg';

import styles from './style.module.scss';

export function ExportButton(props) {
  return (
    <Button className={styles.exportButton} htmlType="button" {...props}>
      <ExportIcon />
      <span>İxrac</span>
    </Button>
  );
}
