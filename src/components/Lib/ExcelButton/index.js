import React from 'react';
import { IconButton } from 'components/Lib';
import styles from './styles.module.scss';

export const ExcelButton = ({ ...rest }) => (
  <IconButton
    buttonSize="large"
    buttonStyle={{}}
    className={styles.excelButton}
    label="Excell-ə çıxarış"
    icon="excel-blue"
    {...rest}
  />
);
