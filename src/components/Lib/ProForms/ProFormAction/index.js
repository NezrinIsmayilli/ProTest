import React from 'react';
import { Button } from 'antd';
import { history } from 'utils/history';

export function ProFormAction({
  actionLoading,
  handleFormClick,
  disabled = false,
  type = 'primary',
  htmlType = 'submit',
  size = 'large',
  acceptText = 'Yadda saxla',
  cancelText = 'İmtina',
  returnUrl,
}) {
  return (
    <div>
      <Button
        loading={actionLoading}
        disabled={disabled}
        type={type}
        htmlType={htmlType}
        size={size}
        onClick={handleFormClick}
      >
        {acceptText}
      </Button>
      <Button
        style={{
          marginLeft: 10,
        }}
        size={size}
        onClick={returnUrl ? () => history.replace(returnUrl) : history.goBack}
      >
        {cancelText}
      </Button>
    </div>
  );
}
