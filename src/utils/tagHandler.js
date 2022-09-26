import React from 'react';
import { Tag } from 'antd';

export const tagHandler = text => {
  let color = 'green';
  switch (text) {
    case 'Approved':
      color = 'blue';
      break;
    case 'Delivery':
      color = '';
      break;
    case 'Yeni':
      color = '';
      break;
    case 'In progress':
      color = 'gold';
      break;
    case 'Reject':
      color = 'red';
      break;
    case 'Aktiv':
      color = 'gold';
      break;
    case 'Silinib':
      color = '';
      break;
    case 'Qaralama':
      color = 'purple';
      break;
    default:
      break;
  }
  return (
    <Tag
      color={color}
      key={text}
      style={{ fontSize: '16px', padding: '5px 7px' }}
    >
      {text}
    </Tag>
  );
};
