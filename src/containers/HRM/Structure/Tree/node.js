import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'antd';
import './node.css';

const propTypes = {
  nodeData: PropTypes.object.isRequired,
};

const CustomNode = ({ nodeData }) => {
  const employees = (
    <div
      style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}
    >
      {nodeData.employees?.map(employee => (
        <span>
          {employee.name} {employee.surname} {employee.patronymic}
        </span>
      ))}
    </div>
  );

  if (nodeData.employees && nodeData.employees.length > 0) {
    return (
      <div
        style={{ cursor: 'pointer' }}
        className={
          nodeData.highlight
            ? 'oc-node selected oc-node-custom'
            : 'oc-node oc-node-custom'
        }
      >
        <Tooltip title={employees} placement="right">
          <div className="position">{nodeData.title}</div>
        </Tooltip>
      </div>
    );
  }
  return (
    <div
      className={
        nodeData.highlight
          ? 'oc-node selected oc-node-custom'
          : 'oc-node oc-node-custom'
      }
    >
      <Tooltip title={nodeData.title} placement="right">
        <div className="position">{nodeData.title}</div>
      </Tooltip>
    </div>
  );
};

CustomNode.propTypes = propTypes;

export default CustomNode;
