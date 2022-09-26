import React from 'react';
import { ProSelect } from 'components/Lib';
import styles from './styles.module.scss';

export function SelectOption(props) {
  const {
    showSearch,
    keys,
    label,
    data,
    value,
    loading,
    placeholder,
    suffixIcon,
    onChange,
  } = props;

  return (
    <div className={styles.selectBox}>
      <h6 className={styles.label}>{label}</h6>
      <ProSelect
        {...props}
        suffixIcon={suffixIcon}
        showSearch={showSearch}
        keys={keys}
        loading={loading}
        size="large"
        data={data}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
      />
    </div>
  );
}
