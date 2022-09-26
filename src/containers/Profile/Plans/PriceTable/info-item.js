import React from 'react';
import { Typography } from 'antd';

const { Paragraph } = Typography;

function InfoItem({ children = '' }) {
  return (
    <div>
      <Paragraph ellipsis={{ rows: 2 }}>{children}</Paragraph>
    </div>
  );
}

export default InfoItem;
