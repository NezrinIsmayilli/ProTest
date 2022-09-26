import React, { useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Table } from 'antd';
import { ProModal, DetailButton } from 'components/Lib';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import OpFinOpInvoiceMoreDetails from 'components/Lib/Modals/Details/opFinOpInvoiceMoreDetails';
import styles from './styles.module.scss';
import ExpenseEmployeeDetail from './details/expenseEmloyeeDetail';

const math = require('exact-math');

function EmployeeExpenses(props) {
  const componentRef = useRef();
  const {
    details,
    mainCurrencyCode,
    isLoading,
    selectedProductionEmployeeExpense,
    productionExpensesList,
  } = props;

  const { clientId, clientName } = details;
  const [visible, setVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const handleDetailsModal = row => {
    setVisible(!visible);
    setSelectedRow(row);
  };
  const getTotal = (data = []) => {
    const Total = math.add(
      selectedProductionEmployeeExpense.reduce(
        (total, { price, hours }) =>
          math.add(total, math.mul(Number(price), Number(hours || 1)) || 0),
        0
      ),
      productionExpensesList
        .filter(item => item.transactionType === 6)
        .reduce(
          (total, { amountConvertedToMainCurrency }) =>
            math.add(total, Number(amountConvertedToMainCurrency) || 0),
          0
        )
    );
    return selectedProductionEmployeeExpense.length > 0 ||
      productionExpensesList.filter(item => item.transactionType === 6).length >
        0
      ? [
          ...data,
          {
            isTotal: true,
            id: 'Total count',
            amountConvertedToMainCurrency: Total,
          },
        ]
      : data;
  };
  const columns = [
    {
      title: '№',
      width: 80,
      render: (val, row, index) => (row.isTotal ? 'Toplam' : index + 1),
    },
    {
      title: 'Tarix',
      dataIndex: 'dateOfTransaction',
      width: 140,
      key: 'dateOfTransaction',
      render: (value, row) => (row.isTotal ? null : value || '-'),
    },
    {
      title: 'Sənəd',
      dataIndex: 'documentNumber',
      width: 110,
      render: (value, row) => (row.isTotal ? null : value || 'Sənədsiz'),
    },
    {
      title: 'Kateqoriya',
      width: 120,
      dataIndex: 'categoryName',
      render: (value, row) => (row.isTotal ? null : value || '-'),
    },
    {
      title: 'Qarşı tərəf',
      width: 120,
      dataIndex: 'contactOrEmployee',
      render: (value, row) => (row.isTotal ? null : value || '-'),
    },
    {
      title: 'Məbləğ',
      dataIndex: 'amount',
      width: 100,
      align: 'right',
      render: (value, { isTotal, currencyCode }) =>
        isTotal
          ? null
          : `${formatNumberToLocale(
              defaultNumberFormat(value)
            )} ${currencyCode}`,
    },
    {
      title: `Məbləğ (${mainCurrencyCode})`,
      dataIndex: 'amountConvertedToMainCurrency',
      width: 120,
      align: 'right',
      render: value =>
        ` ${formatNumberToLocale(
          defaultNumberFormat(value)
        )} ${mainCurrencyCode}`,
    },
    {
      title: 'Seç',
      align: 'center',
      width: 80,
      render: row =>
        row.isTotal ? null : (
          <DetailButton
            onClick={() =>
              row.id === 'default'
                ? setModalIsVisible(true)
                : handleDetailsModal(row)
            }
          />
        ),
    },
  ];

  return (
    <div style={{ width: '100%' }} ref={componentRef}>
      <ProModal
        maskClosable
        padding
        width={1125}
        handleModal={() => setModalIsVisible(false)}
        isVisible={modalIsVisible}
      >
        <ExpenseEmployeeDetail
          visible={modalIsVisible}
          setVisible={setModalIsVisible}
          mainCurrencyCode={mainCurrencyCode}
        />
      </ProModal>
      <ProModal
        maskClosable
        padding
        width={800}
        handleModal={handleDetailsModal}
        isVisible={visible}
      >
        <OpFinOpInvoiceMoreDetails
          onCancel={handleDetailsModal}
          visible={visible}
          row={selectedRow}
        />
      </ProModal>
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
              {clientId ? clientName : 'Daxili sifariş'}
            </label>
          </div>
        </div>
      </div>

      <Table
        scroll={{ x: 'max-content', y: 500 }}
        dataSource={
          selectedProductionEmployeeExpense.length > 0
            ? getTotal([
                {
                  id: 'default',
                  amountConvertedToMainCurrency: selectedProductionEmployeeExpense.reduce(
                    (total, { price, hours }) =>
                      math.add(
                        total,
                        math.mul(Number(price), Number(hours || 1)) || 0 || 0
                      ),
                    0
                  ),
                  amount: selectedProductionEmployeeExpense.reduce(
                    (total, { price, hours }) =>
                      math.add(
                        total,
                        math.mul(Number(price), Number(hours || 1)) || 0 || 0
                      ),
                    0
                  ),
                  currencyCode: mainCurrencyCode,
                },
                ...productionExpensesList.filter(
                  item => item.transactionType === 6
                ),
              ])
            : getTotal(
                productionExpensesList.filter(
                  item => item.transactionType === 6
                )
              )
        }
        className={styles.invoiceTable}
        columns={columns}
        pagination={false}
        rowKey={record => record.id}
        rowClassName={styles.row}
      />
    </div>
  );
}

const mapStateToProps = state => ({
  isLoading: state.loadings.fetchProductionEmployeeExpense,
  selectedProductionEmployeeExpense:
    state.salesOperation.selectedProductionEmployeeExpense,
  productionExpensesList: state.salesOperation.productionExpensesList,
});

export default connect(
  mapStateToProps,
  {}
)(EmployeeExpenses);
