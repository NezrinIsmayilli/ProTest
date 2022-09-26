/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef } from 'react';
import { Table, Tooltip } from 'antd';
import { connect } from 'react-redux';
import styles from '../../styles.module.scss';

function CashboxTab(props) {
  const { details, cashboxData, financeOperationsIsLoading } = props;
  const componentRef = useRef();
  const columns = [
    {
      title: '№',
      width: 80,
      render: (val, row, index) => index + 1,
    },
    {
      title: 'Hesab növü',
      dataIndex: 'type',
      align: 'left',
      width: 150,
      render: value =>
        value === 1
          ? 'Nəğd'
          : value === 2
          ? 'Bank Transferi'
          : value === 3
          ? 'Kart ödənişi'
          : value === 4
          ? 'Digər'
          : '-',
    },
    {
      title: 'Hesab adı',
      dataIndex: 'name',
      align: 'center',
      width: 250,
      render: value => value,
    },
    {
      title: 'Transfer hesabları',
      dataIndex: 'transferCashboxes',
      align: 'center',
      width: 200,
      render: (value, row) =>
        value && value.length > 0 ? (
          value.length > 1 ? (
            <div style={{ display: 'inline-flex', alignItems: 'center' }}>
              {value[0].cashboxName}
              <Tooltip
                placement="right"
                title={
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {value.map(cashbox => (
                      <span>{cashbox.cashboxName}</span>
                    ))}
                  </div>
                }
              >
                <span className={styles.serialNumberCount}>{value.length}</span>
              </Tooltip>
            </div>
          ) : (
            value[0].cashboxName
          )
        ) : (
          '-'
        ),
    },
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
          dataSource={cashboxData}
          className={styles.customWhiteTable}
          loading={financeOperationsIsLoading}
          columns={columns}
          pagination={false}
          rowKey={record => record.id}
          rowClassName={styles.row}
        />
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  financeOperationsIsLoading: state.loadings.financeOperations,
});
export default connect(
  mapStateToProps,
  {}
)(CashboxTab);
