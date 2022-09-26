/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { FaPlus } from 'react-icons/fa';
import { DeleteTwoTone } from '@ant-design/icons';
import swal from '@sweetalert/with-react';
import { deleteInvoice } from 'store/actions/operations';
import { fetchMaterialList } from 'store/actions/sales-operation';
import { Table, ProModal, DetailButton } from 'components/Lib';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import ButtonGreen from 'components/Lib/Buttons/ButtonGreen/ButtonGreen';
import { Row, Col } from 'antd';
import OperationsDetails from 'containers/SalesBuys/Operations/operationsDetails';
import { AddFormModal } from 'containers/Settings/#shared';
import { fetchMeasurements } from 'store/actions/measurements';
import styles from '../../../styles.module.scss';
import MaterialAdd from './materialAdd';

const math = require('exact-math');

const FooterRow = ({ primary, quantity, secondary, color = '#7c7c7c' }) => (
  <div className={styles.opInvoiceContentFooter} style={{ color }}>
    <strong>{primary}</strong>
    <strong></strong>
    <strong style={{ marginRight: '5%' }}>{quantity}</strong>
    <strong>{secondary}</strong>
  </div>
);

const MaterialTable = props => {
  const {
    id,
    fetchMaterialList,
    deleteInvoice,
    selectedProductionMaterial,
    materialInvoices,
    mainCurrency,
    isLoading,
    materialsLoading,
    fetchMeasurements,
    measurements,
    changeCost,
    mergedInvoiceContent,
    setMergedInvoiceContent,
    disabledDate,
  } = props;
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedRow, setSelectedRow] = useState({});
  const [modalIsVisible, setModalIsVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSelectedRow({});
    }
  }, [visible]);

  const handleDetailsModal = row => {
    setVisible(!visible);
    setSelectedRow(row);
  };

  useEffect(() => {
    if (measurements.length === 0) fetchMeasurements();
  }, []);
  const onRemoveProduct = row => {
    swal({
      title: 'Diqqət!',
      text: 'Əməliyyatı silmək istədiyinizə əminsiniz?',
      buttons: ['İmtina', 'Sil'],
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) {
        const selectedMaterial = materialInvoices.filter(
          selectedProduct => selectedProduct.id === row.id
        );
        deleteInvoice({
          id: row.id,
          attribute: {},
          onSuccess: () => {
            fetchMaterialList({
              filters: {
                isDeleted: 0,
                attachedInvoices: [id],
                invoiceTypes: [6],
                limit: 1000,
              },
            });
            changeCost(
              {
                price: math.mul(
                  Number(selectedMaterial[0]?.amountInMainCurrency || 0),
                  -1
                ),
              },
              true
            );
            setMergedInvoiceContent(
              mergedInvoiceContent.filter(
                content => content.materialId !== row.id
              )
            );
           
          },
        });
      }
    });
  };
  const columns = [
    {
      title: '№',
      width: 30,
      render: (val, row, index) => index + 1,
    },
    {
      title: 'Sənəd',
      dataIndex: 'invoiceNumber',
      render: value => value || 'Sənədsiz',
    },
    {
      title: 'Tarix',
      dataIndex: 'operationDate',
      key: 'operationDate',
      render: value => value || '-',
    },
    {
      title: 'Məbləğ',
      dataIndex: 'amount',
      align: 'right',
      render: (value, { mainCurrencyCode }) =>
        `${formatNumberToLocale(
          defaultNumberFormat(value)
        )} ${mainCurrencyCode}`,
    },
    {
      title: `Məbləğ (${mainCurrency?.code})`,
      dataIndex: 'amountInMainCurrency',
      align: 'right',
      render: value =>
        ` ${formatNumberToLocale(defaultNumberFormat(value))} ${
          mainCurrency?.code
        }`,
    },
    {
      title: 'Satış meneceri',
      dataIndex: 'salesmanName',
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
      render: row => (
        <div>
          <DetailButton
            style={
              materialInvoices.length > 0 && row.id === 'default'
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
              onClick={() => onRemoveProduct(row)}
              twoToneColor="#eb2f96"
            />
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <>
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
          mainCurrencyCode={mainCurrency}
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
        <MaterialAdd
          visible={modalIsVisible}
          setVisible={setModalIsVisible}
          mainCurrency={mainCurrency}
          measurements={measurements}
          changeCost={changeCost}
          disabledDate={disabledDate}
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
        loading={isLoading || materialsLoading}
        dataSource={
          selectedProductionMaterial.length > 0
            ? [
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
                  mainCurrencyCode: mainCurrency?.code,
                },
                ...materialInvoices,
              ]
            : materialInvoices
        }
        rowKey={record => record.id}
        columns={columns}
      />
      <FooterRow
        primary="Toplam"
        quantity={`${formatNumberToLocale(
          defaultNumberFormat(
            math.add(
              selectedProductionMaterial.reduce(
                (total, { price, quantity }) =>
                  math.add(
                    total,
                    math.mul(Number(price), Number(quantity)) || 0
                  ),
                0
              ),
              materialInvoices.reduce(
                (total, { amountInMainCurrency }) =>
                  math.add(total, Number(amountInMainCurrency) || 0),
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
  measurementsLoading: state.loadings.fetchMeasurements,
  isLoading: state.loadings.fetchProductionMaterial,
  selectedProductionMaterial: state.salesOperation.selectedProductionMaterial,
  measurements: state.measurementsReducer.measurements,
  materialInvoices: state.salesOperation.materialList,
  materialsLoading: state.loadings.fetchMaterialList,
});

export default connect(
  mapStateToProps,
  { fetchMeasurements, deleteInvoice, fetchMaterialList }
)(MaterialTable);
