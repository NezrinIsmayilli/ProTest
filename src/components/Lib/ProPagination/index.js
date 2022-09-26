import React from 'react';
import { Pagination, Select } from 'antd';
import styles from './styles.module.scss';

export const ProPagination = props => {
  const {
    isLoading = false,
    currentPage = 1,
    pageSize = 8,
    handlePaginationChange,
    total = 0,
    ...rest
  } = props;

  return (
    <Pagination
      loading={isLoading}
      className={styles.pagination}
      current={currentPage}
      pageSize={pageSize}
      onChange={handlePaginationChange}
      total={total}
      size="small"
      {...rest}
    />
  );
};

export const ProPageSelect = props => {
  const { pageSize = 8, total = 0, ...rest } = props;
  const pages = [8, 10, 20, 50, 100];
  return (
    <>
      <Select
        value={pageSize}
        className={styles.pageSize}
        size="large"
        {...rest}
      >
        {pages.map(page => (
          <Select.Option key={page} value={page} className={styles.dropdown}>
            {page}
          </Select.Option>
        ))}
      </Select>
      <span className={styles.totalNumber}>Say: {total}</span>
    </>
  );
};
