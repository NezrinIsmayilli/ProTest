import React from 'react';
import { Input } from 'antd';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';

export const ProSearch = props => {
  const { t } = useTranslation()
  const {
    onSearch,
    onChange,
    label,
    allowClear = true,
    size = 'large',
    autoComplete = 'off',
    ...rest
  } = props;
  return (
    <Input.Search
      placeholder={t('input')}
      onSearch={onSearch}
      onChange={onChange}
      allowClear={allowClear}
      className={styles.search}
      autoComplete={autoComplete}
      size={size}
      {...rest}
    />
  );
};
