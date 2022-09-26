import React from 'react';
import { Input } from 'antd';
import { ProFormItem } from 'components/Lib';
import { urlRule, shortTextMaxRule } from 'utils/rules';
import styles from '../styles.module.scss';

export const Website = ({
  index,
  type,
  handleAddValue,
  handleDeleteValue,
  getFieldDecorator,
  getFieldError,
  label,
  placeholder = '',
}) => (
  <ProFormItem
    label={label}
    help={getFieldError(`${type}[${index}]`)?.[0]}
    customStyle={styles.formItem}
    
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {getFieldDecorator(`${type}[${index}]`, {
        rules: [urlRule, shortTextMaxRule],
      })(
        <Input
          size="large"
          className={`${styles.select} ${styles.addNumber}`}
          placeholder={placeholder}
        />
      )}
      {index === 0 ? (
        <img
          width={24}
          height={24}
          src="/img/icons/add.svg"
          alt="trash"
          className={styles.icon}
          onClick={() => handleAddValue(type)}
          style={{ cursor: 'pointer' }}
        />
      ) : (
        <img
          width={24}
          height={24}
          src="/img/icons/delete.svg"
          alt="trash"
          className={styles.icon}
          onClick={() => handleDeleteValue(type, index)}
          style={{ cursor: 'pointer' }}
        />
      )}
    </div>
  </ProFormItem>
);
