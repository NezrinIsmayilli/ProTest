/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { FaPlus } from 'react-icons/fa';
import { DeleteTwoTone } from '@ant-design/icons';
import { Table, ProModal, DetailButton } from 'components/Lib';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import ButtonGreen from 'components/Lib/Buttons/ButtonGreen/ButtonGreen';
import { Row, Col } from 'antd';
import OpFinOpInvoiceMoreDetails from 'components/Lib/Modals/Details/opFinOpInvoiceMoreDetails';
import styles from '../../../styles.module.scss';
import ExpenseEmployeeAdd from './expenseEmployeeAdd';

const math = require('exact-math');

const FooterRow = ({ primary, quantity, secondary, color = '#7c7c7c' }) => (
  <div className={styles.opInvoiceContentFooter} style={{ color }}>
    <strong>{primary}</strong>
    <strong></strong>
    <strong></strong>
    <strong style={{ marginRight: '12%' }}>{quantity}</strong>
  </div>
);

const EmployeeExpenseTable = props => {
  const {
    mainCurrency,
    isLoading,
    productionExpensesListLoading,
    deleteFinanceOperationsLoading,
    selectedProductionEmployeeExpense,
    productionExpensesList,
    changeCost,
    setFinanceDeleteVisible,
    setSelectedRow,
    selectedRow,
    disabledDate,
    selectedYearandMonth,
    setselectedYearandMonth
  } = props;

  const [visible, setVisible] = useState(false);
  const [modalIsVisible, setModalIsVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSelectedRow(undefined);
    }
  }, [visible]);

  const handleDetailsModal = row => {
    setVisible(!visible);
    setSelectedRow(row);
  };

  const setFinanceDelete = row => {
    setFinanceDeleteVisible(true);
    setSelectedRow(row);
  };

  const columns = [
    {
      title: '№',
      width: 30,
      render: (val, row, index) => index + 1,
    },
    {
      title: 'Tarix',
      dataIndex: 'dateOfTransaction',
      key: 'dateOfTransaction',
      render: value => value || '-',
    },
    {
      title: 'Sənəd',
      dataIndex: 'documentNumber',
      render: value => value || 'Sənədsiz',
    },
    {
      title: 'Kateqoriya',
      dataIndex: 'categoryName',
    },
    {
      title: 'Qarşı tərəf',
      dataIndex: 'contactOrEmployee',
      render: value => value || '-',
    },
    {
      title: 'Məbləğ',
      dataIndex: 'amount',
      align: 'right',
      render: (value, { currencyCode }) =>
        `${formatNumberToLocale(defaultNumberFormat(value))} ${currencyCode}`,
    },
    {
      title: `Məbləğ (${mainCurrency?.code})`,
      dataIndex: 'amountConvertedToMainCurrency',
      align: 'right',
      render: value =>
        ` ${formatNumberToLocale(defaultNumberFormat(value))} ${
          mainCurrency?.code
        }`,
    },
    {
      title: 'Seç',
      align: 'center',
      render: row => (
        <div>
          <DetailButton
            style={
              productionExpensesList.length > 0 && row.id === 'default'
                ? { marginRight: '17px' }
                : {}
            }
            onClick={() =>
              row.id === 'default'
                ? setModalIsVisible(true)
                : handleDetailsModal(row)
            }
          />
          {row.id !== 'default' ? (
            <DeleteTwoTone
              style={{ fontSize: '16px', cursor: 'pointer' }}
              onClick={() => setFinanceDelete(row)}
              twoToneColor="#eb2f96"
            />
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <>
      <ProModal
        maskClosable
        padding
        width={1170}
        handleModal={() => setModalIsVisible(false)}
        isVisible={modalIsVisible}
      >
        <ExpenseEmployeeAdd
          visible={modalIsVisible}
          setVisible={setModalIsVisible}
          mainCurrency={mainCurrency}
          changeCost={changeCost}
          disabledDate={disabledDate}
          selectedYearandMonth={selectedYearandMonth}
          setselectedYearandMonth={setselectedYearandMonth}
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
          row={selectedRow || []}
        />
      </ProModal>
      <Row style={{ margin: '20px 0' }}>
        <Col span={24}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <ButtonGreen
              onClick={() => setModalIsVisible(true)}
              title="Əlavə et"
              styleAddOns={{ padding: '6px 16px' }}
              icon={
                <FaPlus
                  style={{ width: '10px', height: '10px', marginRight: '5px' }}
                />
              }
            />
          </div>
        </Col>
      </Row>
      <Table
        scroll={{ x: 'max-content' }}
        loading={
          isLoading ||
          productionExpensesListLoading ||
          deleteFinanceOperationsLoading
        }
        dataSource={
          selectedProductionEmployeeExpense.length > 0
            ? [
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
                  currencyCode: mainCurrency?.code,
                },
                ...productionExpensesList.filter(
                  item => item.transactionType === 6
                ),
              ]
            : productionExpensesList.filter(item => item.transactionType === 6)
        }
        rowKey={record => record.id}
        columns={columns}
      />{' '}
      <FooterRow
        primary="Toplam"
        quantity={`${formatNumberToLocale(
          defaultNumberFormat(
            math.add(
              selectedProductionEmployeeExpense.reduce(
                (total, { price, hours }) =>
                  math.add(
                    total,
                    math.mul(Number(price), Number(hours || 1)) || 0
                  ),
                0
              ),
              productionExpensesList
                .filter(item => item.transactionType === 6)
                .reduce(
                  (total, { amountConvertedToMainCurrency }) =>
                    math.add(total, Number(amountConvertedToMainCurrency) || 0),
                  0
                )
            )
          )
        )} ${mainCurrency?.code} `}
      />
    </>
  );
};

const mapStateToProps = state => ({
  isLoading: state.loadings.fetchProductionEmployeeExpense,
  selectedProductionEmployeeExpense:
    state.salesOperation.selectedProductionEmployeeExpense,
  productionExpensesList: state.salesOperation.productionExpensesList,
  productionExpensesListLoading: state.loadings.fetchProductionExpensesList,
  deleteFinanceOperationsLoading: state.loadings.deleteFinanceOperations,
});

export default connect(
  mapStateToProps,
  {}
)(EmployeeExpenseTable);
