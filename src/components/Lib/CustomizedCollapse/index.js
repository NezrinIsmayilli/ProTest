import React from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'antd';
import { FaCaretDown, FaCaretUp } from 'react-icons/fa';

export const customPanelStyle = {
  background: '#ffffff',
  borderRadius: 4,
  marginBottom: 24,
  minHeight: 88,
  paddingTop: 22,
  paddingLeft: 10,
  paddingRight: 10,
  border: 0,
  userSelect: 'none',
};

export const customCollapseStyle = {
  margin: '25px 15px 100px 0',
  padding: '0 10px',
  userSelect: 'none',
  background: 'transparent',
};

export const customHeaderStyle = {
  fontSize: '15px',
  fontWeight: 500,
  cursor: 'pointer',
  margin: 0,
};

const { Panel } = Collapse;

export const CustomHeader = ({ title }) => (
  <p style={customHeaderStyle}>{title}</p>
);

export function CustomizedCollapse(props) {
  const { children, onChange, collapseKey, header, active } = props;
  return (
    <Collapse
      style={customCollapseStyle}
      bordered={false}
      onChange={() => onChange(collapseKey)}
      activeKey={active}
      expandIconPosition="right"
      expandIcon={({ isActive }) =>
        isActive ? <FaCaretUp /> : <FaCaretDown />
      }
    >
      <Panel
        key={collapseKey}
        // header={() => <p style={customHeaderStyle}>{header}</p>}
        header={<CustomHeader title={header} />}
        style={customPanelStyle}
      >
        {children}
      </Panel>
    </Collapse>
  );
}

CustomizedCollapse.propTypes = {
  children: PropTypes.any,
  onChange: PropTypes.func,
  collapseKey: PropTypes.string,
  active: PropTypes.string,
  header: PropTypes.string,
};
