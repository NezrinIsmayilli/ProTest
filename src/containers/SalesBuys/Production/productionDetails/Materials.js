import React, { useRef, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Table } from 'antd';
import { ProModal, DetailButton } from 'components/Lib';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import OperationsDetails from 'containers/SalesBuys/Operations/operationsDetails';
import { fetchMeasurements } from 'store/actions/measurements';
import { AddFormModal } from 'containers/Settings/#shared';
import styles from './styles.module.scss';
import MaterialDetail from './details/materialDetail';

const math = require('exact-math');

function Materials(props) {
  const componentRef = useRef();
  const {
    details,
    mainCurrencyCode,
    selectedProductionMaterial,
    materialInvoices,
    isLoading,
    fetchMeasurements,
    measurements,
  } = props;

  const { clientId, clientName } = details;
  const [visible, setVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [modalIsVisible, setModalIsVisible] = useState(false);
  useEffect(() => {
    if (measurements.length === 0) fetchMeasurements();
  }, []);

  const handleDetailsModal = row => {
    setVisible(!visible);
    setSelectedRow(row);
  };
  const getTotal = (data = []) => {
    const Total = math.add(
      selectedProductionMaterial.reduce(
        (total, { price, quantity }) =>
          math.add(total, math.mul(Number(price), Number(quantity)) || 0),
        0
      ),
      materialInvoices.reduce(
        (total, { amountInMainCurrency }) =>
          math.add(total, Number(amountInMainCurrency) || 0),
        0
      )
    );
    return selectedProductionMaterial.length > 0 || materialInvoices.length > 0
      ? [
          ...data,
          {
            isTotal: true,
            id: 'Total count',
            amountInMainCurrency: Total,
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
      dataIndex: 'operationDate',
      width: 140,
      key: 'operationDate',
      render: (value, row) => (row.isTotal ? null : value || '-'),
    },
    {
      title: 'Sənəd',
      dataIndex: 'invoiceNumber',
      width: 110,
      render: (value, row) => (row.isTotal ? null : value || 'Sənədsiz'),
    },
    {
      title: 'Məbləğ',
      dataIndex: 'amount',
      width: 120,
      align: 'right',
      render: (value, { isTotal, mainCurrencyCode }) =>
        isTotal
          ? null
          : `${formatNumberToLocale(
              defaultNumberFormat(value)
            )} ${mainCurrencyCode}`,
    },
    {
      title: `Məbləğ (${mainCurrencyCode})`,
      dataIndex: 'amountInMainCurrency',
      width: 120,
      align: 'right',
      render: value =>
        ` ${formatNumberToLocale(
          defaultNumberFormat(value)
        )} ${mainCurrencyCode}`,
    },
    {
      title: 'Satış meneceri',
      dataIndex: 'salesmanName',
      width: 150,
      render: (value, row) =>
        row.isTotal
          ? null
          : value
          ? `${value} ${row.salesmanLastName ? row.salesmanLastName : null}`
          : '-',
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
      <AddFormModal
        width={
          selectedRow.invoiceType !== 10 || selectedRow.statusOfOperation === 3
            ? activeTab === 0
              ? 760
              : 1200
            : 1400
        }
        withOutConfirm
        onCancel={handleDetailsModal}
        visible={visible}
      >
        <OperationsDetails
          row={selectedRow}
          mainCurrencyCode={mainCurrencyCode}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onCancel={handleDetailsModal}
          visible={visible}
          {...props}
        />
      </AddFormModal>

      <ProModal
        maskClosable
        padding
        width={1000}
        handleModal={() => setModalIsVisible(false)}
        isVisible={modalIsVisible}
      >
        <MaterialDetail
          visible={modalIsVisible}
          setVisible={setModalIsVisible}
          mainCurrencyCode={mainCurrencyCode}
          measurements={measurements}
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
          selectedProductionMaterial.length > 0
            ? getTotal([
                {
                  id: 'default',
                  amountInMainCurrency: selectedProductionMaterial.reduce(
                    (total, { price, quantity }) =>
                      math.add(
                        total,
                        math.mul(Number(price), Number(quantity)) || 0
                      ),
                    0
                  ),
                  amount: selectedProductionMaterial.reduce(
                    (total, { price, quantity }) =>
                      math.add(
                        total,
                        math.mul(Number(price), Number(quantity)) || 0
                      ),
                    0
                  ),
                  mainCurrencyCode,
                },
                ...materialInvoices,
              ])
            : getTotal(materialInvoices)
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
  measurementsLoading: state.loadings.fetchMeasurements,
  isLoading: state.loadings.fetchProductionMaterial,
  selectedProductionMaterial: state.salesOperation.selectedProductionMaterial,
  measurements: state.measurementsReducer.measurements,
  materialInvoices: state.salesOperation.materialList,
});

export default connect(
  mapStateToProps,
  { fetchMeasurements }
)(Materials);
