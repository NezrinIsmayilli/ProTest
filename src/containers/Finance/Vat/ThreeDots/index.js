import React from 'react';
import { Popover } from 'antd';
import Content from './Content';
import styles from './styles.module.scss';

const ThreeDots = ({
  row,
  handleThreeDotClick,
  setTransactionType,
  setTransactionModalIsVisible,
  transactionModalIsVisible,
}) => (
  <>
    <Popover
      placement="left"
      trigger="click"
      content={
        !transactionModalIsVisible?
        <Content
          row={row}
          handleThreeDotClick={handleThreeDotClick}
          setTransactionType={setTransactionType}
          setTransactionModalIsVisible={setTransactionModalIsVisible}
        />:null
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
