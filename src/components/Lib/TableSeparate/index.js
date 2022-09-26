import React from 'react';
import PropTypes from 'prop-types';

import { Table } from 'antd';

import styles from './styles.module.scss';

export function TableSeparate(props) {
  return (
    <div>
      <Table
        rowClassName={styles.row}
        className={styles.tableLight}
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

TableSeparate.propTypes = {
  columns: PropTypes.array,
  dataSource: PropTypes.array,
};

TableSeparate.defaultProps = {
  columns: [],
  dataSource: [],
};
