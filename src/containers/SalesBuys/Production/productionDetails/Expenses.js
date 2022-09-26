import React, { useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Table } from 'antd';
import { ProModal, DetailButton } from 'components/Lib';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import OpFinOpInvoiceMoreDetails from 'components/Lib/Modals/Details/opFinOpInvoiceMoreDetails';
import styles from './styles.module.scss';
import ExpenseDetail from './details/expenseDetail';

const math = require('exact-math');

function Expenses(props) {
    const componentRef = useRef();
    const {
        details,
        selectedProductionExpense,
        mainCurrencyCode,
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
            selectedProductionExpense.reduce(
                (total, { price }) => math.add(total, Number(price) || 0),
                0
            ),
            productionExpensesList
                .filter(
                    item =>
                        item.transactionType === 8 || item.transactionType === 9
                )
                .reduce(
                    (total, { amountConvertedToMainCurrency }) =>
                        math.add(
                            total,
                            Number(amountConvertedToMainCurrency) || 0
                        ),
                    0
                )
        );
        return selectedProductionExpense.length > 0 ||
            productionExpensesList.length > 0
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
            title: 'Xərc maddəsi',
            dataIndex: 'categoryName',
            width: 120,
            render: (value, row) =>
                row.isTotal
                    ? null
                    : row.transactionCatalogName &&
                      row.transactionCatalogName !== null
                    ? row.transactionCatalogName
                    : value || '-',
        },
        {
            title: 'Xərcin adı',
            dataIndex: 'subCategoryName',
            width: 120,
            render: (value, row) =>
                row.isTotal
                    ? null
                    : row.transactionCatalogName &&
                      row.transactionCatalogName !== null
                    ? row.transactionItemName
                    : value || '-',
        },
        {
            title: 'Qarşı tərəf',
            dataIndex: 'contactOrEmployee',
            width: 120,
            render: (value, row) =>
                row.isTotal
                    ? null
                    : row.transactionCatalogName &&
                      row.transactionCatalogName !== null
                    ? `${row.employeeName} ${row.employeeSurname || ''}`
                    : value || '-',
        },
        {
            title: 'Məbləğ',
            dataIndex: 'amount',
            width: 100,
            align: 'right',
            render: (value, { currencyCode, isTotal }) =>
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
            align: 'center',
            render: value =>
                ` ${formatNumberToLocale(
                    defaultNumberFormat(value)
                )} ${mainCurrencyCode}`,
        },
        {
            title: 'Seç',
            width: 80,
            align: 'center',
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
                width={1000}
                handleModal={() => setModalIsVisible(false)}
                isVisible={modalIsVisible}
            >
                <ExpenseDetail
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
                scroll={{ x: 'max-content', y: 780 }}
                dataSource={
                    selectedProductionExpense.length > 0
                        ? getTotal([
                              {
                                  id: 'default',
                                  amount: selectedProductionExpense.reduce(
                                      (total, { price }) =>
                                          math.add(total, Number(price) || 0),
                                      0
                                  ),
                                  amountConvertedToMainCurrency: selectedProductionExpense.reduce(
                                      (total, { price }) =>
                                          math.add(total, Number(price) || 0),
                                      0
                                  ),
                                  currencyCode: mainCurrencyCode,
                              },
                              ...productionExpensesList.filter(
                                  item =>
                                      item.transactionType === 8 ||
                                      item.transactionType === 9
                              ),
                          ])
                        : getTotal(
                              productionExpensesList.filter(
                                  item =>
                                      item.transactionType === 8 ||
                                      item.transactionType === 9
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
    productionExpensesList: state.salesOperation.productionExpensesList,
    selectedProductionExpense: state.salesOperation.selectedProductionExpense,
});

export default connect(
    mapStateToProps,
    {}
)(Expenses);
