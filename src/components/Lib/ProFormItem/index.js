import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';

import { messages } from 'utils/messages';

import styles from './styles.module.scss';

export function ProFormItem({
  children,
  validateStatus,
  helperText = '',
  help = validateStatus
    ? validateStatus === 'minError'
      ? messages.mintextLimitMessage(3)
      : messages.requiredText
    : helperText,
  autoHeight = false,
  customStyle = {},
  ...rest
}) {
  return (
    <Form.Item
      {...rest}
      colon={false}
      validateStatus={validateStatus === 'minError' ? 'error' : validateStatus}
      help={help}
      className={`${styles.formItem} ${customStyle} ${
        autoHeight ? styles.autoHeight : ''
      }`}
    >
      {children}
    </Form.Item>
  );
}

ProFormItem.propTypes = {
  children: PropTypes.any,
  validateStatus: PropTypes.string,
  help: PropTypes.string,
  autoHeight: PropTypes.bool,
};
