import React from 'react';
import { connect } from 'react-redux';
import { Table } from 'components/Lib';
import styles from './styles.module.scss';

const LoginLogout = props => {
  const { isLoading, selectedRow, loginData } = props;
  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 60,
      render: (value, row, index) => index + 1,
    },
    {
      title: 'Daxil olma vaxtı',
      dataIndex: 'startsAt',
      render: value => value,
    },
    {
      title: 'Çıxış vaxtı',
      dataIndex: 'endsAt',
      align: 'left',
      render: value => value || 'Davam edir',
    },
  ];
  return (
    <div
      //   ref={componentRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
      }}
    >
      <div
        id="recievablesActionDropDown"
        className={styles.exportBox}
        style={{
          justifyContent: 'space-between',
          width: '100%',
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
              {`${selectedRow?.prospectTenantPerson?.name} ${
                selectedRow?.prospectTenantPerson?.lastName
                  ? selectedRow?.prospectTenantPerson?.lastName
                  : null
              } `}
            </label>
          </div>
        </div>
      </div>

      <div
        className={styles.opInvTable}
        style={{
          width: 'calc(100% + 30px)',
          marginTop: 32,
          maxHeight: 600,
          paddingRight: 8,
          overflowY: 'auto',
          marginRight: -16,
        }}
      >
        <Table
          scroll={{ x: 'max-content' }}
          dataSource={loginData}
          loading={isLoading}
          className={styles.invoiceTable}
          columns={columns}
          pagination={false}
          rowKey={record => record.id}
          rowClassName={styles.row}
        />
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  isLoading: state.loadings.fetchLoginTime,
});

export const LoginLogoutModal = connect(
  mapStateToProps,
  {}
)(LoginLogout);
