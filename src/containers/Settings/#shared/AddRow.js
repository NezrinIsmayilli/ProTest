import React from 'react';
import { Button, Input } from 'antd';
import { FaSave, FaWindowClose } from 'react-icons/fa';

import styles from '../index.module.sass';

export function AddRow(props) {
  const {
    value,
    inputRef,
    onKeyUp,
    inputChangeHandle,
    error,
    toggleHandle,
    handleSubmit,
    placeholder,
    name = 'name',
    maxLength,
  } = props;

  return (
    <tr>
      <td />
      <td>
        <Input
          value={value}
          ref={inputRef}
          type="text"
          onKeyUp={onKeyUp}
          onChange={inputChangeHandle}
          style={{
            borderColor: error ? 'red' : '#dedede',
            fontSize: 13,
          }}
          placeholder={placeholder}
          name={name}
          maxLength={maxLength}
        />
        <div>
          <Button onClick={toggleHandle} className={styles.delete} type="link">
            <FaWindowClose size={18} />
          </Button>
          <Button onClick={handleSubmit} className={styles.edit} type="link">
            <FaSave size={18} />
          </Button>
        </div>
      </td>
    </tr>
  );
}
