import React from 'react';
import { customCollapseStyle, customPanelStyle } from 'components/Lib';
import { Collapse, Skeleton } from 'antd';

export default function SettingsSkeleton() {
  return (
    <div>
      <Collapse
        bordered={false}
        style={customCollapseStyle}
        defaultActiveKey={['1']}
      >
        <Collapse.Panel
          showArrow={false}
          disabled
          key="1"
          style={customPanelStyle}
        >
          <Skeleton active paragraph={{ rows: 5 }} />
        </Collapse.Panel>
      </Collapse>
    </div>
  );
}
