import React, { useState } from 'react';

// components
import { Input, Button } from 'antd';

import styles from './styles.module.scss';

const EditInput = props => {
  const { name, onSubmitEdit, isEditLoading, handleCancel } = props;
  const [value, setValue] = useState(() => name);

  function onChange(e) {
    setValue(e.target.value);
  }

  function handleSubmit() {
    onSubmitEdit(value);
  }

  function onKeyDown(e) {
    const key = e.keyCode || e.swich;
    if (key === 27) {
      e.preventDefault();
      handleCancel();
    }
  }

  return (
    <Input
      placeholder="Adını yazın"
      value={value}
      autoFocus
      onChange={onChange}
      onPressEnter={handleSubmit}
      onKeyDown={onKeyDown}
      className={styles.editInput}
      suffix={
        <>
          <Button
            type="link"
            style={{ color: '#383838', width: '16px' }}
            icon="close-circle"
            onClick={handleCancel}
          />
          <Button
            type="link"
            icon="save"
            loading={isEditLoading}
            onClick={handleSubmit}
          />
        </>
      }
    />
  );
};

export default EditInput;
