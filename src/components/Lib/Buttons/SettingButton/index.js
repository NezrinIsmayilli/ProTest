import React from 'react';
import { Button, Tooltip } from 'antd';
import styles from './styles.module.scss';

export const SettingButton = ({
  size = 'large',
  icon = 'setting',
  ...rest
}) => (
  <Tooltip placement="top" title="Cədvəl tənzimləmələri">
    <Button size={size} className={styles.settingButton} icon={icon} {...rest}>
    </Button>
  </Tooltip>

);
