/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef } from 'react';
import { Table } from 'antd';
import { connect } from 'react-redux';
import styles from '../../styles.module.scss';

function PriceTypeTab(props) {
  const { details, priceTypeData } = props;
  const componentRef = useRef();
  const columns = [
    {
      title: '№',
      width: 80,
      render: (val, row, index) => index + 1,
    },
    {
      title: 'Qiymət tipi',
      dataIndex: 'name',
      align: 'left',
      render: (value, row) => value,
    },
    // {
    //   title: '',
    //   dataIndex: 'id',
    //   width: 64,
    //   align: 'right',
    //   render: (id, row) => (
    //     <OpFinOpInvoiceTableAction row={row} productId={id} />
    //   ),
    // },
  ];
  return (
    <div style={{ width: '100%' }} ref={componentRef}>
      <div
        className={styles.exportBox}
        style={{
          justifyContent: 'space-between',
          width: '100%',
          marginTop: 40,
        }}
      >
        <div className={styles.exportBox}>
          <div className={styles.columnDetailItem}>
            <label
              style={{
                fontWeight: 600,
                fontSize: 24,
                lineHeight: '24px',
                marginBottom: 10,
                color: '#373737',
              }}
            >
              {details?.name}
            </label>
            <span
              style={{
                fontSize: 18,
                lineHeight: '16px',

                color: '#CBCBCB',
              }}
            >
              {details?.type || 'Bölmə'}
            </span>
          </div>
        </div>
      </div>

      <div
        className={styles.opInvTable}
        style={{
          marginTop: 32,
          maxHeight: 600,
          paddingRight: 8,
          overflowY: 'auto',
        }}
      >
        <Table
          scroll={{ x: 'max-content' }}
          dataSource={priceTypeData}
          className={styles.customWhiteTable}
          columns={columns}
          pagination={false}
          rowKey={record => record.id}
          rowClassName={styles.row}
        />
      </div>
    </div>
  );
}

const mapStateToProps = state => ({});
export default connect(
  mapStateToProps,
  {}
)(PriceTypeTab);
