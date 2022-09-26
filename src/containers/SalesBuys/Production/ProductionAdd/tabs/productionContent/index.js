/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { fetchSalesInvoiceInfo, fetchSalesInvoiceList } from 'store/actions/salesAndBuys';
import {
  IoIosArrowDropdownCircle,
  IoIosArrowDroprightCircle,
  FaPlus,
} from 'react-icons/all';
import { Collapse, Button, Tooltip, Checkbox } from 'antd';
import { defaultNumberFormat, formatNumberToLocale } from 'utils';
import { cookies } from 'utils/cookies';
import {
  handleResetInvoiceFields,
  fetchProductionProductOrder,
  createProductionProductOrder,
  updateInvoiceCurrencyCode,
} from 'store/actions/sales-operation';
import axios from 'axios';
import {
  ProStage,
  ProDots,
  ProDotsItem,
  ProModal,
  ProSelect,
  DetailButton,
  Table,
  ProButton,
} from 'components/Lib';
import moment from 'moment';
import { fetchUsers } from 'store/actions/users';
import { AddFormModal } from 'containers/Settings/#shared';
import { fetchOrders } from 'store/actions/orders';
import { fetchStockStatics, fetchStocks } from 'store/actions/stock';

import SalesReportDetails from '../../../../../Orders/Reports/salesReportDetails';
import SelectWarehouse from './selectWarehouse';
import styles from '../../styles.module.scss';

const { Panel } = Collapse;
const math = require('exact-math');
const roundTo = require('round-to');
const BigNumber = require('bignumber.js');

const Content = props => {
  const {
    id,
    form,
    productionInfo,
    allStocks,
    fetchStocks,
    stocksLoading,
    selectedOrdersWithProduct,
    setSelectedOrdersWithProduct,
    handleResetInvoiceFields,
    productContents,
    materialInvoices,
    updateInvoiceCurrencyCode,
    productionProductOrder,
    stocks,
    handleConfirmClick,
    selectedRow,
    setSelectedRow,
    orders,
    setOrders,
    setSelectedOrders,
    selectedOrders,
    modalIsVisible,
    setModalIsVisible,
    createProductionProductOrder,
    fetchSalesInvoiceInfo,
    fetchStockStatics,
    fetchProductionProductOrder,
    fetchOrders,
    isLoading,
    mainCurrency,
    mergedInvoiceContent,
    setMergedInvoiceContent,
    fetchMaterialListLoading,
    fetchSalesInvoiceList,
    selectedWritingOffProducts,
    setSelectedWritingOffProducts,
    fetchUsers,
    changeCost,
  } = props;

    const {
        getFieldDecorator,
        getFieldError,
        setFieldsValue,
        getFieldValue,
    } = form;

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const BUSINESS_TKN_UNIT = urlParams.get('tkn_unit');

  const [selectedDirection, setSelectedDirection] = useState(undefined);
  const [filter, setFilter] = useState({});
  const [warehouseModal, setWarehouseModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(false);
  const [selectedOrderRow, setSelectedOrderRow] = useState({});
  const [remainingCount, setRemainingCount] = useState(undefined);
  const [isLast, setIsLast] = useState(false);
  const [allDataMerged, setAllDataMerged] = useState(false);
  const [productionInvoice, setProductionInvoice] = useState([]);
  const [checkList, setCheckList] = useState({
    checkedListAll: [],
    ItemsChecked: false,
  });

  const [collapseData, setCollapseData] = useState(undefined);

  const handleCheckbox = (checked, index) => {
    let collection = [];

    if (checked) {
      collection = getAllItems(index);
    }
    setCheckList({
      checkedListAll: collection,
      ItemsChecked: checked,
      parentId: collapseData[index]?.id,
    });
  };
  const getAllItems = index => {
    const collection = [];

    for (const item of collapseData[index]?.productContent) {
      if (
        item.id !== 'isFooter' &&
        stocks
          ?.filter(stock => stock.product_id === item.product.id)
          .reduce(
            (total, current) =>
              math.add(Number(total), Number(current.quantity)),
            0
          ) > 0
      ) {
        collection.push(item.id);
      }
    }

    return collection;
  };

  const handleCheckboxes = (row, e) => {
    const { checked } = e.target;

    if (checked) {
      const collection = collapseData.filter(({ id }) => id === row?.idForFind);
      setCheckList(prevState => ({
        checkedListAll:
          row?.idForFind !== prevState.parentId
            ? [row.id * 1]
            : [...prevState.checkedListAll, row.id * 1],
        ItemsChecked:
          collection[0]?.productContent.length === 1 ||
          collection[0]?.productContent.length ===
            prevState.checkedListAll.length + 1,
        parentId: row?.idForFind,
      }));
    } else {
      setCheckList(prevState => ({
        checkedListAll: prevState.checkedListAll.filter(
          item => item !== row.id
        ),
        ItemsChecked: false,
        parentId: row?.idForFind,
      }));
    }
  };

  useEffect(() => {
    if (!modalIsVisible) {
      setSelectedDirection(undefined);
      setSelectedOrders([]);
    }
  }, [modalIsVisible]);

  useEffect(() => {
    if (!warehouseModal) {
      setCheckList({
        checkedListAll: [],
        ItemsChecked: false,
      });
    }
  }, [warehouseModal]);

  useEffect(() => {
    setCollapseData(getUsedCount(productContents));
  }, [productContents, remainingCount]);

  const handleDetailsModal = row => {
    setOrderDetails(!orderDetails);
    setSelectedOrderRow(row);
    const orderFilter = {
      statusGroup: 4,
      direction: 2,
      limit: 1000,
      page: 1,
    };
    setFilter(orderFilter);
  };

  const remainingRef = React.useRef([]);
  const moreThanEnought = React.useRef([]);

  const getUsedCount = data => {
    if (remainingRef.current !== undefined && allDataMerged && isLast) {
      remainingRef.current = remainingCount;

      return data.map((product, index) => {
        if (
          product &&
          product.productContent &&
          product.productContent.length
        ) {
          const productContent = product.productContent.map(item => {
            const materialProduct = remainingRef.current?.find(
              count => count.product === item.product.id
            );
            if (materialProduct) {
              let itemQuantity = 0;
              if (
                product.invoiceQuantity &&
                Number(product.invoiceQuantity) > 1
              ) {
                itemQuantity =
                  Number(item.quantity) * Number(product.invoiceQuantity);
              } else {
                itemQuantity = Number(item.quantity);
              }
              if (Number(materialProduct?.quantity) >= itemQuantity) {
                const sub = remainingRef.current.map(quantity => {
                  if (quantity.product === item.product.id) {
                    const sum = math.sub(Number(quantity.quantity), itemQuantity);
                    return {
                      ...quantity,
                      quantity: sum,
                      info: item.product,
                    };
                  }
                  return quantity;
                });
                remainingRef.current = sub;
                return { ...item, usedCount: itemQuantity };
              }
              if (Number(materialProduct?.quantity) < itemQuantity) {
                const sub = remainingRef.current.map(quantity => {
                  if (quantity.product === item.product.id) {
                    return {
                      ...quantity,
                      quantity: 0,
                      info: item.product,
                    };
                  }
                  return quantity;
                });
                remainingRef.current = sub;
                return {
                  ...item,
                  usedCount: Number(materialProduct?.quantity),
                };
              }
            }

            return { ...item, usedCount: 0 };
          });

          if (data.length === index + 1) {
            const moreThan = remainingRef.current.filter(
              itm => Number(itm.quantity) > 0
            );

            if (moreThan) {
              moreThanEnought.current = [
                {
                  barcode: undefined,
                  catalog: null,
                  cost: 0,
                  cost_percentage: 0,
                  id: 0,
                  invoicePrice: 0,
                  invoiceProductId: 0,
                  invoiceQuantity: 0,
                  name: 'Tərkibdən kənar materiallar',
                  plannedCost: 0,
                  plannedPrice: 0,
                  productContent: [...moreThan],
                  quantity: 0,
                  serialNumbers: undefined,
                  unitOfMeasurementName: undefined,
                },
              ];
            }
          }

          return { ...product, productContent };
        }

        return product;
      });
    }
    return data;
  };
  const columnsForMoreThan = [
    {
      title: '№',
      width: 70,
      render: (val, row, index) => index + 1,
    },
    {
      title: 'Məhsul adı',
      dataIndex: 'info',
      width: 200,
      render: val => val?.name,
    },
    {
      title: 'Ölçü vahidi',
      dataIndex: 'info',
      align: 'center',
      width: 100,
      render: val => val?.unitOfMeasurement?.name,
    },
    {
      title: 'Say',
      dataIndex: 'quantity',
      width: 140,
      align: 'center',
      render: value => value,
    },
  ];
  const columns = [
    {
      title: '',
      width: 46,
      dataIndex: 'id',
      render(val, row) {
        return (
          <Checkbox
            disabled={
              stocks
                ?.filter(item => item.product_id === row.product.id)
                .reduce(
                  (total, current) =>
                    math.add(Number(total), Number(current.quantity)),
                  0
                ) <= 0 || !id
            }
            checked={checkList.checkedListAll.includes(val)}
            onChange={event => handleCheckboxes(row, event)}
          />
        );
      },
    },
    {
      title: '№',
      width: 50,
      render: (val, row, index) => index + 1,
    },
    {
      title: 'Məhsul adı',
      dataIndex: 'product',
      width: 200,
      render: (val, row) => val?.name,
    },
    {
      title: 'Ölçü vahidi',
      dataIndex: 'product',
      align: 'center',
      width: 100,
      render: (val, row) => val?.unitOfMeasurement?.name,
    },
    {
      title: 'Tərkibi, say',
      dataIndex: 'quantity',
      align: 'center',
      width: 120,
      render: (value, row) => {
        if (row.selectedProductId) {
          return formatNumberToLocale(
            defaultNumberFormat(
              math.mul(
                Number(
                  collapseData?.find(
                    ({ invoiceProductId }) =>
                      row.selectedProductId === invoiceProductId
                  )?.invoiceQuantity
                ) || 0,
                Number(value) || 0
              )
            )
          );
        } else {
          return formatNumberToLocale(
            defaultNumberFormat(
              math.mul(
                Number(
                  collapseData?.find(({ id }) => row.idForFind === id)
                    ?.invoiceQuantity
                ) || 0,
                Number(value) || 0
              )
            )
          );
        }
      },
    },
    {
      title: 'Sərf olunan, say',
      dataIndex: 'usedCount',
      width: 140,
      align: 'center',
      render: value => formatNumberToLocale(defaultNumberFormat(value || 0)),
    },
    {
      title: 'Fərq, say',
      dataIndex: 'product',
      align: 'center',
      width: 120,
      render: (value, row) =>
        formatNumberToLocale(
          defaultNumberFormat(
            math.sub(
              Number(
                math.mul(
                  Number(
                    collapseData?.find(
                      ({ invoiceProductId }) =>
                        row.selectedProductId === invoiceProductId
                    ).invoiceQuantity || 0
                  ),
                  Number(row.quantity || 0)
                )
              ),
              Number(row.usedCount || 0)
            )
          )
        ),
    },
    {
      title: 'Anbar, say',
      dataIndex: 'product',
      width: 120,
      align: 'center',
      render: value =>
        formatNumberToLocale(
          defaultNumberFormat(
            stocks
              ?.filter(item => item.product_id === value.id)
              .reduce(
                (total, current) =>
                  math.add(Number(total), Number(current.quantity)),
                0
              )
          )
        ),
    },
    {
      title: 'Status',
      dataIndex: 'product',
      width: 150,
      align: 'center',
      render: (value, row) => {
        const stockQuantity = stocks
          ?.filter(item => item.product_id === value.id)
          .reduce(
            (total, current) =>
              math.add(Number(total), Number(current.quantity)),
            0
          );
        const subQuantity = math.sub(
          Number(
            math.mul(
              Number(
                collapseData?.find(
                  ({ invoiceProductId }) =>
                    row.selectedProductId === invoiceProductId
                ).invoiceQuantity || 0
              ),
              Number(row.quantity || 0)
            )
          ),
          Number(row.usedCount || 0)
        );
        const product = selectedOrdersWithProduct?.filter(
          item => item.productId === row.id
        );
        const orderProduct = orders?.filter(order =>
          product[0]?.orders?.map(({ id }) => id)?.includes(order?.id)
        );
        return (
          <ProStage
            disabled
            visualStage={
              orderProduct.length > 0
                ? { id: 1, name: 'delivery' }
                : stockQuantity !== 0 && stockQuantity >= subQuantity
                ? { id: 2, name: 'going' }
                : { id: 3, name: 'new' }
            }
            statuses={[
              {
                id: 1,
                label: 'Sifariş olunub',
                color: '#2980b9',
              },
              {
                id: 2,
                label: 'Anbarda var',
                color: '#f39c12',
              },
              {
                id: 3,
                label: 'Anbarda yoxdur',
                color: '#3b4557',
              },
            ]}
          />
        );
      },
    },
    {
      title: 'Sifariş',
      dataIndex: 'id',
      width: 120,
      align: 'center',
      render: (value, row) => {
        const product = selectedOrdersWithProduct?.filter(
          item => item.productId === value
        );
        const orderProduct = orders?.filter(order =>
          product[0]?.orders?.map(({ id }) => id)?.includes(order?.id)
        );
        return orderProduct && orderProduct.length > 0 ? (
          <div className={styles.detailbtn}>
            <span className={styles.rowNumbers}>
              {`SFX${moment(
                orderProduct[0].createdAt.replace(
                  /(\d\d)-(\d\d)-(\d{4})/,
                  '$3'
                ),
                'YYYY'
              ).format('YYYY')}/${orderProduct[0].serialNumber}`}
            </span>
            <Tooltip
              title={
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                  }}
                >
                  {orderProduct.map(item => (
                    <span>
                      SFX
                      {moment(
                        item.createdAt.replace(/(\d\d)-(\d\d)-(\d{4})/, '$3'),
                        'YYYY'
                      ).format('YYYY')}
                      /{item.serialNumber}
                    </span>
                  ))}
                </div>
              }
              placement="right"
            >
              <DetailButton
                className={styles.detailButton}
                onClick={() => handleDetailsModal(row)}
              />
            </Tooltip>
          </div>
        ) : (
          '-'
        );
      },
    },
    {
      title: 'Seç',
      width: 60,
      align: 'right',
      render: row => (
        <ProDots>
          <ProDotsItem
            label="Sifariş et"
            icon="shoppingCart"
            onClick={() => handleOrderModal(row)}
          />
        </ProDots>
      ),
    },
  ];

  useEffect(() => {
    if (id) {
      fetchSalesInvoiceList({
        filters: {
          invoiceTypes: [11],
          allProduction: 1,
          limit: 10000,
        },
        onSuccess: res => {
          setProductionInvoice(res.data);
        },
      });
      if (productionInfo) {
        fetchStockStatics({
          filters: {
            limit: 10000,
            invoiceTypes: [1, 3, 5, 7, 10, 11],
            stocks: undefined,
            businessUnitIds:
              productionInfo?.businessUnitId === null
                ? [0]
                : [productionInfo?.businessUnitId],
          },
        });
        fetchStocks({
          limit: 1000,
          businessUnitIds:
            productionInfo?.businessUnitId === null
              ? [0]
              : [productionInfo?.businessUnitId],
        });
        fetchUsers({
          filters: {
            businessUnitIds:
              productionInfo?.businessUnitId === null
                ? [0]
                : [productionInfo?.businessUnitId],
          },
        });
      }
    } else if (BUSINESS_TKN_UNIT) {
      fetchStockStatics({
        filters: {
          limit: 10000,
          invoiceTypes: [1, 3, 5, 7, 10, 11],
          stocks: undefined,
          businessUnitIds: [BUSINESS_TKN_UNIT],
        },
      });
      fetchStocks({ limit: 1000, businessUnitIds: [BUSINESS_TKN_UNIT] });
      fetchUsers({
        filters: { businessUnitIds: [BUSINESS_TKN_UNIT] },
      });
    } else {
      fetchStockStatics({
        filters: {
          limit: 10000,
          invoiceTypes: [1, 3, 5, 7, 10, 11],
          stocks: undefined,
        },
      });
      fetchStocks({ limit: 1000 });
      fetchUsers({});
    }
  }, [BUSINESS_TKN_UNIT, id, productionInfo]);
  useEffect(() => {
    fetchOrders(
      {
        limit: 10000,
        direction: 2,
        statusGroup: 1,
        visualStages: [2, 3, 4, 8, 9, 10, 11, 12, 13],
      },
      ({ data }) => {
        setOrders(data);
      },
      false
    );
    fetchSalesInvoiceList({
      filters: {
        invoiceTypes: [11],
        allProduction: 1,
        limit: 10000,
      },
      onSuccess: res => {
        setProductionInvoice(res.data);
      },
    });
    return () => {
      updateInvoiceCurrencyCode(mainCurrency.code);
    };
  }, []);

  useEffect(() => {
    let tmp = {};
    if (!fetchMaterialListLoading) {
      if (materialInvoices?.length > 0) {
        Promise.all(
          materialInvoices.map(async (item, indexMaterial) => {
            try {
              const { data } = await axios.get(
                `/sales/invoices/invoice/${item.id}`
              );
              if (
                data.data.invoiceProducts &&
                data.data.invoiceProducts.content
              )
                data.data.invoiceProducts.content.forEach((value, index) => {
                  if (tmp[value.productId]) {
                    tmp = {
                      ...tmp,
                      [value.productId]: {
                        ...tmp[value.productId],
                        quantity:
                          math.add(tmp[value.productId].quantity,
                          Number(value.quantity)),
                      },
                    };
                  } else {
                    tmp[value.productId] = {
                      id: index + 1,
                      invoiceProductId: value.invoiceProductId,
                      materialId: item.id,
                      product: value.productId,
                      productName: value.productName,
                      catalogName: value.catalogName,
                      quantity: roundTo(Number(value.quantity), 2),
                      pricePerUnit: roundTo(Number(value.pricePerUnit), 2),
                      unitsOfMeasurementName: value.unitOfMeasurementName,
                    };
                  }
                });
            } catch (error) {}
          })
        ).then(results => {
          setMergedInvoiceContent(Object.values(tmp));
          setAllDataMerged(Object.values(tmp));
        });
      } else {
        setAllDataMerged(true);
        setMergedInvoiceContent([]);
        setIsLast(true);
        setRemainingCount([]);
      }
    }
  }, [materialInvoices, fetchMaterialListLoading]);
  const handleDirectionSelect = selectedDirectionId => {
    setSelectedDirection(selectedDirectionId);
  };
  const handleSelectOrder = orderIds => {
    const [orderId] = orderIds;
    const newOrders = orders.find(order => order.id === orderId);
    setSelectedOrders(prevSelectedOrders => [
      ...prevSelectedOrders,
      { ...newOrders, isFrontData: true },
    ]);
  };
  const handleSelectedOrderChange = selectedOrderIds => {
    const newOrders = selectedOrders.filter(order =>
      selectedOrderIds.includes(order.id)
    );
    setSelectedOrders(newOrders);
  };
  const handleOrderModal = row => {
    setSelectedRow(row);
    setModalIsVisible(true);
  };
  useEffect(() => {
    if (mergedInvoiceContent.length > 0) {
      const newRemainingCount = mergedInvoiceContent.map((item, index) => {
        if (mergedInvoiceContent.length - 1 === index) {
          setIsLast(true);
        }
        return {
          product: item.product,
          quantity: item.quantity,
          info: {
            name: item.productName,
            unitOfMeasurement: { name: item.unitsOfMeasurementName },
          },
        };
      });
      setRemainingCount(newRemainingCount);
    } else {
      setRemainingCount([]);
      setIsLast(true);
    }
  }, [mergedInvoiceContent]);

  return (
    <>
      <div className={styles.parentBox}>
        <AddFormModal
          width={1300}
          withOutConfirm
          onCancel={handleDetailsModal}
          visible={orderDetails}
        >
          <SalesReportDetails
            filters={filter}
            // type={filters.type}
            row={selectedOrderRow}
            orders={orders}
            onCancel={handleDetailsModal}
            visible={orderDetails}
            fromProduction
            selectedOrdersWithProduct={selectedOrdersWithProduct}
            setSelectedOrdersWithProduct={setSelectedOrdersWithProduct}
          />
        </AddFormModal>
        <ProModal
          maskClosable
          width={400}
          isVisible={modalIsVisible}
          customStyles={styles.AddSerialNumbersModal}
          handleModal={() => setModalIsVisible(false)}
        >
          <div className={styles.AddFromCatalog}>
            <h2>Sifariş seç</h2>
            <div className={styles.selectBox}>
              <span className={styles.selectLabel}>İstiqamət</span>
              <ProSelect
                allowClear={false}
                data={[
                  { id: 1, name: 'Xaric olan' },
                  { id: 2, name: 'Daxili' },
                ]}
                value={selectedDirection}
                onChange={handleDirectionSelect}
              />
            </div>
            <div>
              <span className={styles.selectLabel}>Sənəd</span>
              <ProSelect
                mode="multiple"
                value={[]}
                loading={isLoading}
                className={styles.selectBox}
                onChange={handleSelectOrder}
                data={
                  selectedDirection && selectedDirection === 1
                    ? [
                        ...orders.map(order => ({
                          ...order,
                          name:
                            order.direction === 1
                              ? `SFD${moment(
                                  order.createdAt.replace(
                                    /(\d\d)-(\d\d)-(\d{4})/,
                                    '$3'
                                  ),
                                  'YYYY'
                                ).format('YYYY')}/${order.serialNumber}`
                              : `SFX${moment(
                                  order.createdAt.replace(
                                    /(\d\d)-(\d\d)-(\d{4})/,
                                    '$3'
                                  ),
                                  'YYYY'
                                ).format('YYYY')}/${order.serialNumber}`,
                        })),
                      ].filter(
                        order =>
                          ![
                            ...selectedOrders.map(
                              selectedOrder => selectedOrder.id
                            ),
                            ...[].concat(
                              ...selectedOrdersWithProduct
                                .filter(
                                  item => item.productId === selectedRow.id
                                )
                                ?.map(selectedOrder =>
                                  selectedOrder.orders.map(({ id }) => id)
                                )
                            ),
                          ].includes(order.id)
                      )
                    : []
                }
              />
            </div>
            <div>
              <span className={styles.selectLabel}>Seçilmiş sənədlər</span>
              <ProSelect
                className={styles.selectBox}
                mode="multiple"
                onChange={handleSelectedOrderChange}
                value={selectedOrders.map(selected => selected.id)}
                data={[
                  ...selectedOrders.map(order => ({
                    ...order,
                    name:
                      order.direction === 1
                        ? `SFD${moment(
                            order.createdAt.replace(
                              /(\d\d)-(\d\d)-(\d{4})/,
                              '$3'
                            ),
                            'YYYY'
                          ).format('YYYY')}/${order.serialNumber}`
                        : `SFX${moment(
                            order.createdAt.replace(
                              /(\d\d)-(\d\d)-(\d{4})/,
                              '$3'
                            ),
                            'YYYY'
                          ).format('YYYY')}/${order.serialNumber}`,
                  })),
                ]}
              />
            </div>
            <div className={styles.button}>
              <Button
                type="primary"
                className={styles.confirmButton}
                onClick={handleConfirmClick}
              >
                Təsdiq et
              </Button>
              <Button
                className={styles.cancelButton}
                type="danger"
                onClick={() => setModalIsVisible(false)}
              >
                Sıfırla
              </Button>
            </div>
          </div>
        </ProModal>
        <ProModal
          maskClosable
          width={700}
          isVisible={warehouseModal}
          customStyles={styles.AddSerialNumbersModal}
          handleModal={() => setWarehouseModal(false)}
        >
          <SelectWarehouse
            id={id}
            stocks={allStocks}
            stocksLoading={stocksLoading}
            collapseData={collapseData}
            checkList={checkList}
            productionInvoice={productionInvoice}
            selectedProducts={selectedWritingOffProducts}
            setSelectedProducts={setSelectedWritingOffProducts}
            changeCost={changeCost}
            warehouseModal={warehouseModal}
            setWarehouseModal={setWarehouseModal}
            productionMaterialsStock={getFieldValue('productionMaterialsStock')}
          />
        </ProModal>
        <Collapse
          style={{ backgroundColor: 'transparent' }}
          expandIconPosition="right"
          bordered={false}
          defaultActiveKey={['1']}
          expandIcon={({ isActive }) =>
            isActive ? (
              <IoIosArrowDropdownCircle style={{ fontSize: '24px' }} />
            ) : (
              <IoIosArrowDroprightCircle style={{ fontSize: '24px' }} />
            )
          }
        >
          {collapseData?.map((content, index) => (
            <Panel
              header={
                <>
                  <div
                    style={{
                      fontWeight: 'bold',
                      fontSize: '22px',
                    }}
                  >
                    {`${content?.name} (${Number(content.invoiceQuantity)} ${
                      content.unitOfMeasurementName
                    })`}
                  </div>
                </>
              }
              key={`${index + 1}`}
              className={styles.collapse}
            >
              <div style={{ padding: '0 0 12px 20px' }}>
                <Checkbox
                  onChange={event =>
                    handleCheckbox(event.target.checked, index)
                  }
                  checked={
                    checkList.ItemsChecked && content.id === checkList.parentId
                  }
                  className={styles.checkBoxArchive}
                  disabled={!id || stocks
                    ?.filter(item => content?.productContent?.map(({product})=>product?.id).includes(item.product_id))
                    .reduce(
                      (total, current) =>
                        math.add(Number(total), Number(current.quantity)),
                      0
                    ) <= 0}
                />
                <ProButton
                  style={{ padding: '6px 16px', marginLeft: '20px' }}
                  disabled={
                    checkList.checkedListAll.length === 0 ||
                    content.id !== checkList.parentId || !id
                  }
                  icon="plus"
                  onClick={() => setWarehouseModal(true)}
                >
                  Silinmə
                </ProButton>
              </div>
              <Table
                scroll={{ x: 'max-content', y: 500 }}
                dataSource={content?.productContent}
                //   loading={dataLoading}
                columns={columns}
                pagination={false}
                rowKey={record => record.id}
              />
            </Panel>
          ))}
          {moreThanEnought.current &&
          moreThanEnought.current.length > 0 &&
          moreThanEnought.current[0].productContent.length > 0 ? (
            <Panel
              header={
                <div
                  style={{
                    fontWeight: 'bold',
                    fontSize: '22px',
                  }}
                >
                  {`${moreThanEnought.current[0].name}`}
                </div>
              }
              key={`${121212}`}
              className={styles.collapse}
            >
              <Table
                scroll={{ x: 'max-content', y: 500 }}
                dataSource={moreThanEnought.current[0].productContent}
                columns={columnsForMoreThan}
                pagination={false}
                rowKey={121212}
              />
            </Panel>
          ) : null}
        </Collapse>
      </div>
    </>
  );
};

const mapStateToProps = state => ({
  materialInvoices: state.salesOperation.materialList,
  productionProductOrder: state.salesOperation.productionProductOrder,
  stocks: state.stockReducer.stocksStatics,
  isLoading: state.ordersReducer.isLoading,
  fetchMaterialListLoading: state.loadings.fetchMaterialList,
  allStocks: state.stockReducer.stocks,
  stocksLoading: state.loadings.fetchStocks,
});

export const ProductionContent = connect(
  mapStateToProps,
  {
    fetchSalesInvoiceInfo,
    handleResetInvoiceFields,
    fetchStockStatics,
    fetchStocks,
    fetchOrders,
    fetchProductionProductOrder,
    updateInvoiceCurrencyCode,
    fetchSalesInvoiceList,
    fetchUsers,
  }
)(Content);
