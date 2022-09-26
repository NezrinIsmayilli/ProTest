/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
// import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
// import moment from 'moment';

// components
import { Row, Col } from 'antd';
import // Table,
// ProFilterButton,
// ProSearch,
// ProCollapse,
// ProPanel,
'components/Lib';

import { NavigationButtons } from '../#shared';
import Sidebar from './Sidebar';
// import styles from './styles.module.scss';

//   // COLUMNS and Labels, must be inside SalesOperations component
//   const columns = [
//     {
//       title: '№',
//       dataIndex: 'id',
//       key: 'id',
//       render: (value, row, index) => index + 1,
//     },
//     {
//       title: 'Tarix',
//       dataIndex: 'operationDate',
//       key: 'operationDate',
//       render: value => value && value.substring(0, 10),
//     },
//     {
//       title: 'Sənəd',
//       dataIndex: 'invoiceNumber',
//       key: 'invoiceNumber',
//     },
//     {
//       title:
//         tab === 2 || tab === 3 ? 'Alıcı' : tab === 5 ? 'Anbar' : 'Təchizatçı',
//       dataIndex: 'clientName',
//       key: 'clientName',
//       render: (value, row) =>
//         tab === 2 || tab === 3
//           ? `${row.clientName} ${row.clientSurname || ''}`
//           : tab === 5
//           ? `${row.stockFromName}`
//           : `${row.supplierName} ${row.supplierSurname || ''}`,
//     },
//     {
//       title: 'Məbləğ',
//       dataIndex: 'amount',
//       key: 'amount',
//       // eslint-disable-next-line react/display-name
//       render: (value = '', row) => (
//         <PopoverAndDots value={Number(value).toFixed(2)} row={row} />
//       ),
//     },
//   ];

function Vacation() {
  return (
    <section>
      <Sidebar />

      <section className="scrollbar aside">
        {/* operations filter */}
        <div className="container">
          <NavigationButtons />

          {/* table and infobox */}
          <Row gutter={32}>
            <Col span={16} className="paddingBottom70">
              {/* <Table
                loading={isLoading}
                dataSource={invoiceList[tab]}
                columns={columns}
                rowKey={record => record.id}
                onRow={data => ({
                  onClick: () => {
                    fetchInvoiceInfo(data.id);
                  },
                })}
                footer={<TableFooter mebleg={overallPrice} />}
              /> */}
            </Col>
            <Col span={8}>fghfgh</Col>
          </Row>
        </div>
      </section>
    </section>
  );
}

const mapStateToProps = () => ({});

export default connect(
  mapStateToProps,
  {}
)(Vacation);
