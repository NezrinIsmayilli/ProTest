/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useState, useEffect } from 'react';
import { Table, Tooltip } from 'antd';
import { DetailButton } from 'components/Lib';
import { connect } from 'react-redux';
import MoreDetails from 'containers/Users/MoreDetails';
import styles from '../../styles.module.scss';

function UserTab(props) {
  const { userData, usersLoading, details, users, profile } = props;
  const componentRef = useRef();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const handleDetailClick = row => {
    setSelectedRow(users.find(user => user.id === row.id));
    setIsVisible(true);
  };
  // useEffect(() => {
  //   if (details) {
  //     const me = users.find(user => user.isItMe === true);
  //   } else {
  //   }
  // }, [details]);
  const getColumns = () => {
    const columns = [
      {
        title: '№',
        width: 80,
        render: (val, row, index) => index + 1,
      },
      {
        title: 'İstifadəçi adı',
        dataIndex: 'name',
        align: 'left',
        ellipsis: true,
        render: (value, row) => (
          <Tooltip
            placement="topLeft"
            title={`${value} ${row.surname ? row.surname : ''}` || ''}
          >
            <span>{`${value} ${row.surname ? row.surname : ''}` || '-'}</span>
          </Tooltip>
        ),
      },
      {
        title: 'Rol',
        dataIndex: 'role',
        align: 'left',
        width: 100,
        render: (value, row) => (row.isAdmin ? 'Təsisçi' : value || '-'),
      },
    ];
    if (profile.businessUnits?.length === 0 || details?.id !== null) {
      columns.push({
        title: 'Seç',
        width: 100,
        align: 'center',
        render: (_, row) => (
          <DetailButton
            onClick={() => handleDetailClick(row)}
            style={{ height: '30px' }}
            disabled={users.find(user => user.id === row.id) === undefined}
          />
        ),
      });
    }
    return columns;
  };

  return (
    <div style={{ width: '100%' }} ref={componentRef}>
      <MoreDetails
        visible={isVisible}
        row={selectedRow}
        users={users}
        setIsVisible={setIsVisible}
      />
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
          dataSource={userData}
          className={styles.customWhiteTable}
          loading={usersLoading}
          columns={getColumns()}
          pagination={false}
          rowKey={record => record.id}
          rowClassName={styles.row}
        />
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  usersLoading: !!state.loadings.fetchUsers,
  profile: state.profileReducer.profile,
});
export default connect(
  mapStateToProps,
  {}
)(UserTab);
