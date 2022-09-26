import React from 'react';
import { Popover } from 'antd';
import Content from './Content';
import styles from './styles.module.scss';

const ThreeDots = ({
  row,
  handleDetailClick = () => {},
  handleDeleteClick = () => {},
}) => (
  <>
    <Popover
      placement="left"
      trigger="click"
      content={
        <Content
          row={row}
          handleDetailClick={handleDetailClick}
          handleDeleteClick={handleDeleteClick}
        />
      }
    >
      <img
        width={16}
        height={16}
        src="/img/icons/three-dots.svg"
        alt="trash"
        className={styles.icon}
        style={{ marginRight: '20px', cursor: 'pointer' }}
      />
    </Popover>
  </>
);

export default ThreeDots;
