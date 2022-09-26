import React, { useState, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';

// components
import { Button, Input } from 'antd';
import { ProFormItem } from 'components/Lib';
const inputStyle = {
  padding: ' 12px 30px 8px 30px',
  backgroundColor: '#e9e9e9',
  borderBottom: '2px solid #fff',
};
const AddInput = forwardRef((props, ref) => {
  const {
    isCreateLoading,
    onSubmit,
    label = 'Yeni',
    placeholder = 'ad',
    error
  } = props;



  const [value, setValue] = useState('');

  useImperativeHandle(ref, () => ({
    clear: () => {
      setValue('');
    },
  }));

  function onChange(e) {
    setValue(e.target.value);
  }

  return (
    <div style={inputStyle} >
      <ProFormItem label={label}>
        <Input.Search
          placeholder={placeholder}
          value={value}
          autoFocus
          onChange={onChange}
          onSearch={onSubmit}
          allowClear
          enterButton={
            <Button type="primary" icon="plus" loading={isCreateLoading} />
          }
        />
         {error&& <span style={{color:'red',fontSize:"12px"}}>Bu dəyər 3 simvoldan az olmamalıdır.</span>}
      </ProFormItem>
    </div>
  );
});

AddInput.propTypes = {
  isCreateLoading: PropTypes.bool,
  onSubmit: PropTypes.func,
  label: PropTypes.string,
  placeholder: PropTypes.string,
};

export default AddInput;
