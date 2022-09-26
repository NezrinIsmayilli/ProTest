import React, { useState } from 'react';
import { Input, Button } from 'antd';

import styles from './styles.module.scss';

const { TextArea } = Input;

const Content = ({ handleInformationChange }) => {
  const [value, setValue] = useState('');

  return (
    <div style={{ width: '500px', padding: '24px 32px' }}>
      <span className={styles.additional}>Əlavə məlumat</span>
      <TextArea
        autoSize={false}
        rows={4}
        value={value}
        placeholder="Yazın"
        onChange={e => setValue(e.target.value)}
        style={{ marginTop: '20px' }}
      />
      <Button
        style={{
          backgroundColor: '#55AB80',
          width: '30%',
          fontSize: '14px',
          marginTop: '12px',
          color: 'white',
        }}
        size="large"
        onClick={() => handleInformationChange(value)}
      >
        Təsdiq et
      </Button>
    </div>
  );
};

export default Content;
