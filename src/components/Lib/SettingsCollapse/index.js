import React from 'react';
import { customCollapseStyle, customPanelStyle } from 'components/Lib';
import { Collapse, Icon } from 'antd';

const { Panel } = Collapse;

export const SettingsPanel = ({ header, children, ...rest }) => (
  <Panel header={header} style={customPanelStyle} {...rest}>
    {children}
  </Panel>
);

export function SettingsCollapse({
  children,
  accordion = true,
  defaultActiveKey = ['1'],
  expandIconPosition = 'right',
  ...rest
}) {
  return (
    <Collapse
      accordion={accordion}
      bordered={false}
      style={customCollapseStyle}
      defaultActiveKey={defaultActiveKey}
      expandIconPosition={expandIconPosition}
      expandIcon={({ isActive }) => (
        <Icon type="caret-right" rotate={isActive ? 90 : 0} />
      )}
      {...rest}
    >
      {children}
    </Collapse>
  );
}
