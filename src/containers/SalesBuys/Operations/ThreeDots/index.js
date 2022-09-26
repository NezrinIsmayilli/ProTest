/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import { Popover } from 'antd';
import { deleteInvoice } from 'store/actions/operations';
import { fetchSalesInvoiceList } from 'store/actions/salesAndBuys';
import styles from './styles.module.scss';

const Content = ({
  row,
  handleThreeDotClick,
  setTransactionType,
  setTransactionModalIsVisible,
}) => (
  <div className={styles.container}>
    <div
      className={styles.finOperation}
      onClick={() =>
        handleThreeDotClick(
          setTransactionType,
          setTransactionModalIsVisible,
          1,
          row
        )
      }
    >
      Details
    </div>
    <div
      className={styles.invoiceContent}
      onClick={() =>
        handleThreeDotClick(
          setTransactionType,
          setTransactionModalIsVisible,
          2,
          row
        )
      }
    >
      Edit
    </div>
  </div>
);

const ThreeDots = ({
  row,
  invoiceId,
}) => (
  <>
    <Popover
      placement="left"
      trigger="click"
      content={
        <Content
          row={row}
          handleThreeDotClick={handleThreeDotClick}
          setTransactionType={setTransactionType}
          setTransactionModalIsVisible={setTransactionModalIsVisible}
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

export default connect(
  mapStateToProps,
  {
    fetchSalesInvoiceList,
    deleteInvoice,
  }
)(ThreeDots);
