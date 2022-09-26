/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { ProModal, ProSelect, Table } from 'components/Lib';
import { Row, Col, Input, Button } from 'antd';
import { formatNumberToLocale, defaultNumberFormat, roundToDown } from 'utils';
import {
  clearInvoicesByProduct,
  setSelectedProducts,
} from 'store/actions/sales-operation';
import styles from '../../styles.module.scss';
import { QuantityInput } from '../components/QuantityInput';
import { toast } from 'react-toastify';

const math = require('exact-math');

const permissionsByOperationType = {
  sales: 'sales_operations_sales_from_invoices',
  returnFromCustomer: 'sales_operations_rfc_from_invoices',
  returnToSupplier: 'sales_operations_rts_from_invoices',
};
const FooterRow = ({ primary, quantity, secondary, color = '#7c7c7c' }) => (
  <div className={styles.opInvoiceContentFooter} style={{ color }}>
    <strong>{primary}</strong>
    <strong>{quantity}</strong>
    <strong style={{ marginRight: '8%' }}>{secondary}</strong>
  </div>
);

const InvoiceModalWithoutSNModal = props => {
  const {
    type,
    isVisible = false,
    product = {},
    toggleModal,
    invoicesByProduct,
    invoicesLoading,
    clearInvoicesByProduct,
    fetchProductInvoices,
    selectedProducts,
    setSelectedProducts,
    permissionsByKeyValue,
  } = props;
  const { id, name, invoiceQuantity, invoiceProducts } = product;

  const [selectedInvoiceProducts, setSelectedInvoiceProducts] = useState([]);
  const [filters, setFilters] = useState({
    counterparties: [],
    invoices: [],
  });

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
      title: 'Anbardakı say',
      dataIndex: 'quantity',
      align: 'center',
      render: value => `${formatNumberToLocale(defaultNumberFormat(value))}`,
    });

    columns.push({
      title: 'Seç',
      dataIndex: 'invoice_product_id',
      key: 'quantityInput',
      align: 'center',
      width: 150,
      render: (value, row) => (
        <QuantityInput
          onChange={handleQuantityChange}
          product={row}
          selectedProduct={invoiceProducts?.filter(item=> item?.invoice_product_id === row.invoice_product_id)}
          value={
            selectedInvoiceProducts.find(
              ({ invoice_product_id }) => invoice_product_id === value
            )?.invoiceQuantity
          }
        />
      ),
    });

    return columns;
  };

  const confirmModal = () => {
    if (selectedInvoiceProducts?.filter(invProducts=> Number(invProducts.invoiceQuantity)> 0)?.filter(item=> item.usedQuantity && item.usedQuantity > item.invoiceQuantity)?.length > 0 || (invoiceProducts?.filter(({usedQuantity})=> Number(usedQuantity) > 0)?.length > 0 && selectedInvoiceProducts?.filter(invProducts=> Number(invProducts.invoiceQuantity)> 0)?.filter(({usedQuantity})=> Number(usedQuantity) > 0)?.length < invoiceProducts?.filter(({usedQuantity})=> Number(usedQuantity) > 0)?.length)) {
      toast.error('Məhsul sayı düzgün qeyd olunmamışdır.')
    } else {
      updateProduct(id, selectedInvoiceProducts?.filter(invProducts=> Number(invProducts.invoiceQuantity)> 0));
      toggleModal();
    }

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

  const checkInvoiceIsSelected = invoiceProductId => {
    const searchedInvoice = selectedInvoiceProducts.find(
      selectedInvoice => selectedInvoice.invoice_product_id === invoiceProductId
    );
    return {
      isExists: !!searchedInvoice,
    };
  };

  const removeSelectedInvoiceProduct = invoiceProductId => {
    setSelectedInvoiceProducts(prevSelectedInvoiceProducts =>
      prevSelectedInvoiceProducts.filter(
        ({ invoice_product_id }) => invoice_product_id !== invoiceProductId
      )
    );
  };

  const addInvoiceProduct = invoiceProduct => {
    setSelectedInvoiceProducts(prevSelectedInvoiceProducts => [
      ...prevSelectedInvoiceProducts,
      invoiceProduct,
    ]);
  };

  const updateExistsInvoiceProduct = (invoiceProductId, newInvoiceProduct) => {
    setSelectedInvoiceProducts(prevSelectedInvoiceProducts =>
      prevSelectedInvoiceProducts.map(prevSelectedInvoiceProduct => {
        if (
          prevSelectedInvoiceProduct.invoice_product_id === invoiceProductId
        ) {
          return {
            ...prevSelectedInvoiceProduct,
            ...newInvoiceProduct,
          };
        }
        return prevSelectedInvoiceProduct;
      })
    );
  };

  const handleQuantityChange = (newQuantity, productInvoice) => {
    const { invoice_product_id, serial_number, price } = productInvoice;
    const { isExists } = checkInvoiceIsSelected(invoice_product_id);
    if (newQuantity) {
      if (isExists) {
        return updateExistsInvoiceProduct(invoice_product_id, {
          invoiceQuantity: newQuantity,
        });
      }
      return addInvoiceProduct({
        usedQuantity: invoiceProducts?.find(item=> item.invoice_product_id === invoice_product_id)?.usedQuantity,
        invoice_product_id,
        serial_number,
        price,
        invoiceQuantity: newQuantity,
      });
    }
    return removeSelectedInvoiceProduct(invoice_product_id);
  };

  const handleFilter = (type, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [type]: value,
    }));
  };

  const divideQuantityForInvoices = invoiceProducts => {
    const selectedInvoices = [];
    let totalQuantity = Number(invoiceQuantity);
    invoiceProducts.forEach(invoiceProduct => {
      if (Number(totalQuantity) === 0) {
        return;
      }
      if (totalQuantity >= Number(invoiceProduct.quantity)) {
        selectedInvoices.push({
          ...invoiceProduct,
          invoiceQuantity: Number(invoiceProduct.quantity),
        });
        totalQuantity -= Number(invoiceProduct.quantity);
      } else if (totalQuantity < Number(invoiceProduct.quantity)) {
        selectedInvoices.push({
          ...invoiceProduct,
          invoiceQuantity: totalQuantity,
        });
        totalQuantity = 0;
      }
    });
    setSelectedInvoiceProducts(selectedInvoices);
  };

  const clearModal = () => {
    clearInvoicesByProduct();
    setSelectedInvoiceProducts([]);
    setFilters({
      counterparties: [],
      invoices: [],
    });
  };

  const getFilteredInvoices = (
    productInvoices,
    { counterparties, invoices }
  ) => {
    if (counterparties.length > 0 || invoices.length > 0) {
      const newProductInvoices = productInvoices.filter(
        ({ counterparty, invoice_number }) => {
          if (
            (counterparties.length > 0
              ? counterparties.includes(counterparty)
              : true) &&
            (invoices.length > 0 ? invoices.includes(invoice_number) : true)
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

  const updateProduct = (productId, invoiceProducts) => {
    const totalQuantity = invoiceProducts.reduce(
      (totalValue, { invoiceQuantity }) =>
        math.add(totalValue, Number(invoiceQuantity) || 0),
      0
    );
        const totalPrice = invoiceProducts
            .filter(({ invoiceQuantity }) => Number(invoiceQuantity) > 0)
            .map(item => ({
                  ...item,
                  price: getFilteredInvoices(invoicesByProduct, filters).find(
                      ({ invoice_product_id }) =>
                          item.invoice_product_id === invoice_product_id
                  ).price,
              }))
            .reduce(
                (totalValue, { price }) =>
                    math.add(totalValue, Number(price) || 0),
                0
            );
    if(type === 'returnFromCustomer' || type === 'returnToSupplier'){
    const newSelectedProducts = selectedProducts.map(selectedProduct => {
      if (productId === selectedProduct.id) {
        return {
          ...selectedProduct,
          invoiceQuantity: totalQuantity,
          invoicePrice: Number(totalQuantity) === 0 ? 0: roundToDown(math.div(Number(totalPrice), invoiceProducts.filter(({invoiceQuantity})=>Number(invoiceQuantity) > 0).length || 1)),
          invoiceProducts,
        };
      }
      return selectedProduct;
    });

    setSelectedProducts({ newSelectedProducts });
  }
    else {
      const newSelectedProducts = selectedProducts.map(selectedProduct => {
        if (productId === selectedProduct.id) {
          return {
            ...selectedProduct,
            invoiceQuantity: totalQuantity,
            invoiceProducts,
          };
        }
        return selectedProduct;
      });
  
      setSelectedProducts({ newSelectedProducts });
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchProductInvoices(id, ({ data }) => {
        if (invoiceProducts) {
          setSelectedInvoiceProducts(invoiceProducts);
        } else if (invoiceQuantity) {
          divideQuantityForInvoices(Object.values(data));
        }
      });
    } else {
      clearModal();
    }
  }, [isVisible]);

  return (
    <ProModal
      maskClosable
      width={1200}
      isVisible={isVisible}
      handleModal={toggleModal}
      customStyles={styles.SelectFromInvoice}
    >
      <div className={`${styles.InvoiceModal} ${styles.InvoiceModalWithoutSN}`}>
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
            secondary={selectedInvoiceProducts?.reduce(
              (total, { invoiceQuantity }) =>
                math.add(total, Number(invoiceQuantity) || 0),
              0
            )}
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
  invoicesByProduct: state.salesOperation.invoicesByProduct,
  invoicesLoading: state.loadings.fetchInvoicesByProduct,
  selectedProducts: state.salesOperation.selectedProducts,
  permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
});
export const InvoiceModalWithoutSN = connect(
  mapStateToProps,
  {
    setSelectedProducts,
    clearInvoicesByProduct,
  }
)(InvoiceModalWithoutSNModal);
