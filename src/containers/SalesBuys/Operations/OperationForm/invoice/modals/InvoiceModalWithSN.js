/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { ProModal, ProSelect, Table } from 'components/Lib';
import { Row, Col, Input, Button, Checkbox, Tooltip } from 'antd';
import {
  clearInvoicesByProduct,
  setSelectedProducts,
} from 'store/actions/sales-operation';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import { ReactComponent as ExclamationIcon } from 'assets/img/icons/exclamation.svg';
import styles from '../../styles.module.scss';

const permissionsByOperationType = {
  sales: 'sales_operations_sales_from_invoices',
  returnFromCustomer: 'sales_operations_rfc_from_invoices',
  returnToSupplier: 'sales_operations_rts_from_invoices',
};
const FooterRow = ({ primary, quantity, secondary, color = '#7c7c7c' }) => (
  <div className={styles.opInvoiceContentFooter} style={{ color }}>
    <strong>{primary}</strong>
    <strong>{quantity}</strong>
    <strong style={{ marginRight: '4%' }}>{secondary}</strong>
  </div>
);

const InvoiceModalWithSNModal = props => {
  const {
    type,
    isVisible = false,
    product = {},
    selectedProducts,
    fetchProductInvoices,
    invoicesByProduct,
    invoicesLoading,
    clearInvoicesByProduct,
    setSelectedProducts,
    toggleModal,
    permissionsByKeyValue,
  } = props;
  const dispatch = useDispatch();
  const { id, name, invoiceProducts } = product;

  const [selectedInvoiceProducts, setSelectedInvoiceProducts] = useState([]);
  const [filters, setFilters] = useState({
    counterparties: [],
    invoices: [],
    serialNumbers: [],
  });
  const confirmModal = () => {
    updateProduct(id, selectedInvoiceProducts);
    toggleModal();
  };

  const getColumns = () => {
    const columns = [
      {
        title: '№',
        dataIndex: 'id',
        width: 60,
        render: (value, row, index) => index + 1,
      },
      {
        title: 'Qarşı tərəf',
        dataIndex: 'counterparty',
        render: (value, row) =>
                    row.invoice_type === 11
                        ? 'İSTEHSALAT'
                        : row.invoice_type === 7
                        ? 'İlkin qalıq'
                        : value,
      },
      {
        title: 'Tarix',
        dataIndex: 'operation_date',
        render: value => value.split(' ')[0],
      },
      {
        title: 'Qaimə',
        dataIndex: 'invoice_number',
      },
    ];

    if (
      permissionsByOperationType[type] &&
      permissionsByKeyValue[permissionsByOperationType[type]].permission !== 0
    ) {
      columns.push({
        title: 'Qiymət',
        dataIndex: 'price',
        align: 'right',
        render: (value, { currency_code }) =>
          `${formatNumberToLocale(
            defaultNumberFormat(value)
          )} ${currency_code}`,
      });
    } else if (!permissionsByOperationType[type]) {
      columns.push({
        title: 'Qiymət',
        dataIndex: 'price',
        align: 'right',
        render: (value, { currency_code }) =>
          `${formatNumberToLocale(
            defaultNumberFormat(value)
          )} ${currency_code}`,
      });
    }

    columns.push({
      title: 'Seriya nömrə',
      dataIndex: 'serial_number',
    });

    columns.push({
      title: 'Seç',
      dataIndex: 'invoice_product_id',
      key: 'checkbox',
      width: 60,
      render: (value, row) => (
        selectedInvoiceProducts.find(
          selectedInvoiceProduct =>
            selectedInvoiceProduct.invoice_product_id === value
        )?.usedQuantity === 1 ?
          <Tooltip
              placement="right"
              title="İstifadə olunmuş seriya nömrələrini silmək mümkün deyil."
          >
          <Checkbox
            disabled={selectedInvoiceProducts.find(
              selectedInvoiceProduct =>
                selectedInvoiceProduct.invoice_product_id === value
            )?.usedQuantity === 1}
            checked={selectedInvoiceProducts.some(
              selectedInvoiceProduct =>
                selectedInvoiceProduct.invoice_product_id === value
            )}
            onChange={event => handleInvoiceProduct(event.target.checked, row)}
          />
          </Tooltip>
        : <Checkbox
          disabled={selectedInvoiceProducts.find(
            selectedInvoiceProduct =>
              selectedInvoiceProduct.invoice_product_id === value
          )?.usedQuantity === 1}
          checked={selectedInvoiceProducts.some(
            selectedInvoiceProduct =>
              selectedInvoiceProduct.invoice_product_id === value
          )}
          onChange={event => handleInvoiceProduct(event.target.checked, row)}
        />
      ),
    });

    return columns;
  };

  const handleInvoiceProduct = (checked, productInvoice) => {
    const { invoice_product_id } = productInvoice;
    if (checked) {
      setSelectedInvoiceProducts(prevSelectedInvoiceProducts => [
        ...prevSelectedInvoiceProducts,
        {
          ...productInvoice,
          invoiceQuantity: 1,
        },
      ]);
    } else {
      setSelectedInvoiceProducts(
        selectedInvoiceProducts.filter(
          selectedInvoiceProduct =>
            selectedInvoiceProduct.invoice_product_id !== invoice_product_id
        )
      );
    }
  };

  const clearModal = () => {
    clearInvoicesByProduct();
    setFilters({
      counterparties: [],
      invoices: [],
      serialNumbers: [],
    });
  };
  useEffect(() => {
    if (isVisible) {
      fetchProductInvoices(id);
      setSelectedInvoiceProducts(Object.values(invoiceProducts || []));
    } else {
      clearModal();
    }
  }, [isVisible]);

  const getFilteredInvoices = (
    productInvoices,
    { counterparties, invoices, serialNumbers }
  ) => {
    if (
      counterparties.length > 0 ||
      invoices.length > 0 ||
      serialNumbers.length > 0
    ) {
      const newProductInvoices = productInvoices.filter(
        ({ counterparty, invoice_number, serial_number }) => {
          if (
            (counterparties.length > 0
              ? counterparties.includes(counterparty)
              : true) &&
            (invoices.length > 0 ? invoices.includes(invoice_number) : true) &&
            (serialNumbers.length > 0
              ? serialNumbers.includes(serial_number)
              : true)
          ) {
            return true;
          }
          return false;
        }
      );
      return newProductInvoices;
    }
    return productInvoices;
  };

  const filterDuplicates = (invoicesByProduct, field) => {
    const data = [];
    return invoicesByProduct.reduce((total, current) => {
      if (data.includes(current[field])) {
        return total;
      }
      data.push(current[field]);
      return [...total, { name: current[field] }];
    }, []);
  };

  const handleFilter = (type, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [type]: value,
    }));
  };

  const updateProduct = (productId, invoiceProducts) => {
    const serialNumbers = Object.values(invoiceProducts).map(
            ({ serial_number, invoice_product_id }) =>
                serial_number === undefined
                    ? invoicesByProduct.find(
                          invoiceByProduct =>
                              invoice_product_id ===
                              invoiceByProduct.invoice_product_id
                      )?.serial_number
                    : serial_number
        );

    const newSelectedProducts = selectedProducts.map(prevSelectedProduct => {
      if (productId === prevSelectedProduct.id) {
        return {
          ...prevSelectedProduct,
          serialNumbers,
          invoiceQuantity: serialNumbers.length,
          invoiceProducts,
        };
      }
      return prevSelectedProduct;
    });

    dispatch(setSelectedProducts({ newSelectedProducts }));
  };

  return (
    <ProModal
      maskClosable
      width={1200}
      isVisible={isVisible}
      customStyles={styles.SelectFromInvoice}
      handleModal={toggleModal}
    >
      <div className={`${styles.InvoiceModal} ${styles.InvoiceModalWithSN}`}>
        <Row type="flex" style={{ alignItems: 'center', marginBottom: '40px' }}>
          <Col span={24}>
            <span className={styles.header}>{name}</span>
          </Col>
        </Row>
        <Row
          type="flex"
          gutter={16}
          style={{ alignItems: 'center', marginBottom: '40px' }}
        >
          <Col span={6}>
            <Input.Group>
              <span className={styles.filterName}>Qarşı tərəf</span>
              <ProSelect
                mode="multiple"
                id={false}
                value={filters.counterparties}
                data={filterDuplicates(invoicesByProduct, 'counterparty')}
                onChange={values => handleFilter('counterparties', values)}
              />
            </Input.Group>
          </Col>
          <Col span={6}>
            <Input.Group>
              <span className={styles.filterName}>Qaimə</span>
              <ProSelect
                mode="multiple"
                id={false}
                value={filters.invoices}
                data={filterDuplicates(invoicesByProduct, 'invoice_number')}
                onChange={values => handleFilter('invoices', values)}
              />
            </Input.Group>
          </Col>
          <Col span={6}>
            <Input.Group>
              <span className={styles.filterName}>Seriya nömrə</span>
              <ProSelect
                mode="multiple"
                id={false}
                value={filters.serialNumbers}
                data={Object.values(invoicesByProduct).map(
                  ({ serial_number }) => ({ name: serial_number })
                )}
                onChange={values => handleFilter('serialNumbers', values)}
              />
            </Input.Group>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Table
              loading={invoicesLoading}
              scroll={{ x: false, y: 400 }}
              dataSource={getFilteredInvoices(invoicesByProduct, filters)}
              columns={getColumns()}
            />
          </Col>
        </Row>
        <Row>
          <FooterRow
            primary="Toplam"
            secondary={selectedInvoiceProducts?.length}
          />
        </Row>
        <Row style={{ marginTop: '40px' }}>
          <Col span={12}>
            <Button type="primary" onClick={confirmModal}>
              Təsdiq et
            </Button>
          </Col>
        </Row>
      </div>
    </ProModal>
  );
};

const mapStateToProps = state => ({
  selectedProducts: state.salesOperation.selectedProducts,
  invoicesByProduct: state.salesOperation.invoicesByProduct,
  invoicesLoading: state.loadings.fetchInvoicesByProduct,
  permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
});
export const InvoiceModalWithSN = connect(
  mapStateToProps,
  {
    setSelectedProducts,
    clearInvoicesByProduct,
  }
)(InvoiceModalWithSNModal);
