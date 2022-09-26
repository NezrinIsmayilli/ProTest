import React from 'react';
import { ProFormItem } from 'components/Lib';
import MaskedInput from 'antd-mask-input';
import { Form } from 'antd';
import {} from 'utils/rules';
import styles from '../styles.module.scss';

export const MobileNumber = ({
  index,
  type,
  handleAddValue,
  handleDeleteValue,
  getFieldDecorator,
  getFieldError,
  label,
  placeholder = '',
}) => {
  return (
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
          rules: [
            {
              min: 12,
              message: 'Nömrə düzgün daxil edilməyib.',
              transform: value => {
                if (value) {
                  const number = String(value)
                    .replace(/ /g, '')
                    .replace(/_/g, '')
                    .replace(/-/g, '')
                    .replace('(', '')
                    .replace(')', '');
                  if (number) return number;
                }
                return `(111) 11 111 11 11`;
              },
            },
          ],
        })(
          <MaskedInput
            size="large"
            mask="(111) 11 111 11 11"
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
};
