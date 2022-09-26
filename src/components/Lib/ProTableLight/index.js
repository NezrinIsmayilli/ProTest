import React from 'react';
import PropTypes from 'prop-types';

import { Table } from 'antd';

import styles from './styles.module.scss';

export function ProTableLight(props) {
  return (
    <div>
      <Table
        className={styles.table}
        bordered={false}
        pagination={false}
        locale={{
          emptyText: ' ', // dont show No data empty image and text
        }}
        {...props}
      />
    </div>
  );
}

ProTableLight.propTypes = {
  columns: PropTypes.array,
  dataSource: PropTypes.array,
};

ProTableLight.defaultProps = {
  columns: [],
  dataSource: [],
};
