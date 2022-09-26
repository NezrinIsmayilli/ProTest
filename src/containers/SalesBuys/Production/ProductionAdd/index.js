/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import onScan from 'onscan.js';
import { toast } from 'react-toastify';
import { connect, useDispatch } from 'react-redux';
import { ProWrapper } from 'components/Lib';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { Form, Tabs, Row, Col } from 'antd';
import { useHistory, Link } from 'react-router-dom';
import {
  editInvoice,
  createInvoice,
  createProductionExpense,
  createProductionEmployeeExpense,
  createProductionMaterialExpense,
  fetchProductionInfo,
  fetchProductionMaterialExpense,
  fetchProductionEmployeeExpense,
  fetchProductionExpense,
  setSelectedProductionEmployeeExpense,
  setSelectedProductionExpense,
  setSelectedProductionMaterial,
  setSelectedProducts,
  handleResetInvoiceFields,
  fetchMaterialList,
  fetchProductionExpensesList,
  fetchProductionProductOrder,
  createProductionProductOrder,
  editTransferProduction,
  editDateAndWarehouseTransfer,
  editProductionCost,
} from 'store/actions/sales-operation';
import {
  fetchSalesInvoiceList,
  fetchSalesInvoiceCount,
} from 'store/actions/salesAndBuys';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { fetchProducts, getProductComposition } from 'store/actions/product';
import moment from 'moment';
import { fetchStockStatics } from 'store/actions/stock';
import { fetchMainCurrency } from 'store/actions/settings/kassa';
import { messages, fullDateTimeWithSecond, round } from 'utils';
import { ActionButtons, SendToStock } from './invoice';
import styles from './styles.module.scss';
import {
  GeneralInfo,
  ProductionExpense,
  ProductionIndicators,
  ProductionContent,
  TransferredProduct,
} from './tabs';

const math = require('exact-math');
const roundTo = require('round-to');
const BigNumber = require('bignumber.js');

const { TabPane } = Tabs;
const returnUrl = `/sales/production`;
const summary_types = [
  {
    label: 'Cəmi',
    key: 1,
  },
  {
    label: 'Xərclər',
    key: 2,
  },
  {
    label: 'Materiallar',
    key: 3,
  },
  {
    label: 'İşçilik',
    key: 4,
  },
];

const AddProduction = props => {
  const {
    form,
    fetchProducts,
    fetchProductionInfo,
    fetchMaterialList,
    fetchProductionExpensesList,
    description,
    selectedProducts,
    editInvoice,
    createInvoice,
    createProductionExpense,
    createProductionEmployeeExpense,
    createProductionMaterialExpense,
    selectedProductionExpense,
    selectedProductionEmployeeExpense,
    selectedProductionMaterial,
    fetchProductionMaterialExpense,
    fetchProductionEmployeeExpense,
    fetchProductionExpense,
    setSelectedProductionEmployeeExpense,
    setSelectedProductionExpense,
    setSelectedProductionMaterial,
    setSelectedProducts,
    materialInvoices,
    productionExpensesList,
    stocks,
    fetchStockStatics,
    profile,
    fetchBusinessUnitList,
    businessUnits,
    fetchMainCurrency,
    fetchProductionProductOrder,
    createProductionProductOrder,
    editTransferProduction,
    editDateAndWarehouseTransfer,
    editProductionCost,
    editDateAndWarehouseLoading,
    productsIsLoading,
    mainCurrency,
  } = props;

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const id = urlParams.get('id');
  const history = useHistory();
  const productionStatus = urlParams.get('productionStatus');
  const isDeleted = urlParams.get('isDeleted');
  const dispatch = useDispatch();
  const [mergedInvoiceContent, setMergedInvoiceContent] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [productionInfo, setProductionInfo] = useState(undefined);
  const [tableDatas, setTableDatas] = useState([]);
  const [summaries, setSummaries] = useState(summary_types);
  const [stockModal, setStockModal] = useState(false);
  const [stockTo, setStockTo] = useState(undefined);
  const [productContents, setProductContents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedRow, setSelectedRow] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [newCreatedProduct, setNewCreatedProduct] = useState(null);
  const [selectedOrdersWithProduct, setSelectedOrdersWithProduct] = useState(
    []
  );
  const [selectedWritingOffProducts, setSelectedWritingOffProducts] = useState([]);  
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetchMainCurrency();
  }, []);
  const [modalIsVisible, setModalIsVisible] = useState(false);
  const { validateFields, getFieldValue, getFieldsValue } = form;

  const handleActiveTabChange = newTab => {
    setActiveTab(newTab);
  };
  const handleSendToStock = () => {
    setStockModal(prevStockModal => !prevStockModal);
  };

  const handleProductOrder = product => {
    if (
      product.filter(({ invoiceProductId }) => invoiceProductId !== undefined)
        .length > 0
    ) {
      fetchProductionProductOrder({
        filters: {
          invoiceProducts: product
            .filter(({ invoiceProductId }) => invoiceProductId !== undefined)
            .map(({ invoiceProductId }) => invoiceProductId),
        },
        onSuccessCallback: ({ data }) => {
          let tmp = {};
          if (data.length > 0) {
            data.forEach((value, index) => {
              if (tmp[value.productMaterialId]) {
                tmp = {
                  ...tmp,
                  [value.productMaterialId]: {
                    ...tmp[value.productMaterialId],
                    orders: value.orderId
                      ? [
                          ...tmp[value.productMaterialId].orders,
                          {
                            direction: value.orderDirection,
                            id: value.orderId,
                            serialNumber: value.orderSerialNumber,
                          },
                        ]
                      : [],
                  },
                };
              } else {
                tmp[value.productMaterialId] = {
                  productId: value.productMaterialId,
                  orders: [
                    {
                      direction: value.orderDirection,
                      id: value.orderId,
                      serialNumber: value.orderSerialNumber,
                    },
                  ],
                };
              }
            });

            let newChanged = [];
            if (selectedOrdersWithProduct.length > 0) {
              newChanged = selectedOrdersWithProduct;
            } else {
              newChanged = Object.values(tmp);
            }

            setSelectedOrdersWithProduct(newChanged);
          }
        },
      });
    }
  };
  useEffect(() => {
    if (selectedProducts) {
      if (selectedProducts.length > 0) {
        const allData = selectedProducts
          .filter(item => item.materials?.length > 0)
          .map(product => {
            return {
              ...product,
              invoiceQuantity: product.invoiceQuantity,
              productContent: product.materials.map(item => {
                return {
                  ...item,
                  idForFind: product.id,
                  selectedProductId: product.invoiceProductId,
                };
              }),
            };
          });
        setProductContents(allData);
        handleProductOrder(allData);
      } else {
        setProductContents([]);
      }
    }
  }, [selectedProducts]);

  useEffect(() => {
    fetchProducts({ filters: { isDeleted: 0} });
    fetchBusinessUnitList({
      filters: {
        isDeleted: 0,
        businessUnitIds: profile.businessUnits?.map(({ id }) => id),
      },
    });
  }, []);
  useEffect(() => {
    if (stockTo){
      fetchStockStatics({
        filters: {
          limit: 10000,
          invoiceTypes: [1, 3, 5, 7, 10, 11],
          stocks: stockTo ? [stockTo] : undefined,
        },
      });
    }
  }, [stockTo]);
  useEffect(() => {
    if (stockModal && stockTo) {
      setSelectedProducts({
        newSelectedProducts: selectedProducts?.map(product => {
          return {
            ...product,
            quantity: stocks
              ?.filter(item => item.product_id === product.id)
              .reduce(
                (total, current) =>
                  math.add(Number(total), Number(current.quantity)),
                0
              ),
          };
        }),
      });
    }
  }, [stocks, stockModal]);
  useEffect(() => {
    const totalExpencePrice = selectedProductionExpense.reduce(
      (total, { price }) => math.add(total || 0, Number(price) || 0),
      0
    );
    const totalEmployeePrice = selectedProductionEmployeeExpense.reduce(
      (total, { price, hours }) =>
        math.add(total || 0, math.mul(Number(price), Number(hours || 1)) || 0),
      0
    );
    const totalMaterialPrice = selectedProductionMaterial.reduce(
      (total, { price, quantity }) =>
        math.add(total || 0, math.mul(Number(price), Number(quantity)) || 0),
      0
    );
    const totaInvoicelMaterialPrice = materialInvoices?.reduce(
      (total, { amountInMainCurrency }) => math.add(total || 0, Number(amountInMainCurrency) || 0),
      0
    );
    const totalProductionEmployeeExpensesList = productionExpensesList
      ?.filter(item => item.transactionType === 6)
      .reduce(
        (total, { amountConvertedToMainCurrency }) =>
          math.add(
            total || 0,
            Number(amountConvertedToMainCurrency) || 0
          ),
        0
      );
    const totalProductionExpensesList = productionExpensesList
      ?.filter(item => item.transactionType === 8 || item.transactionType === 9)
      .reduce(
        (total, { amountConvertedToMainCurrency }) =>
          math.add(total || 0, Number(amountConvertedToMainCurrency) || 0),
        0
      );
    const totalAllExpense = math.add(
      totalExpencePrice,
      totalEmployeePrice,
      totalMaterialPrice,
      totaInvoicelMaterialPrice,
      totalProductionEmployeeExpensesList,
      totalProductionExpensesList
    );
    const expensePercent =
      totalAllExpense > 0
        ? math.mul(
            math.div(
              math.add(totalExpencePrice, totalProductionExpensesList),
              totalAllExpense
            ),
            100
          )
        : 0;
    const employeePercent =
      totalAllExpense > 0
        ? math.mul(
            math.div(
              math.add(totalEmployeePrice, totalProductionEmployeeExpensesList),
              totalAllExpense
            ),
            100
          )
        : 0;
    const materialPercent =
      totalAllExpense > 0
        ? math.mul(
            math.div(
              math.add(totalMaterialPrice, totaInvoicelMaterialPrice),
              totalAllExpense
            ),
            100
          )
        : 0;
    const totalPercent = totalAllExpense > 0 ? 100 : 0;
    const totals = [];
    summary_types.forEach(({ label, key }) =>
      totals.push({
        label,
        value:
          key === 2
            ? math.add(totalExpencePrice, totalProductionExpensesList)
            : key === 3
            ? math.add(totalMaterialPrice, totaInvoicelMaterialPrice)
            : key === 4
            ? math.add(totalEmployeePrice, totalProductionEmployeeExpensesList)
            : totalAllExpense || 0,
        percent:
          key === 2
            ? expensePercent
            : key === 3
            ? materialPercent
            : key === 4
            ? employeePercent
            : totalPercent || 0,
      })
    );
    setSummaries(totals);
  }, [
    selectedProductionExpense,
    selectedProductionEmployeeExpense,
    selectedProductionMaterial,
    materialInvoices,
    productionExpensesList,
  ]);
  useEffect(() => {
    if (id) {
      setActiveTab('1');
      fetchProductionInfo({
        id,
        onSuccess: ({ data }) => {
          setProductionInfo(data);
          if (data.invoiceProducts && data.invoiceProducts.content){ 
            setTableDatas([
              ...Object.keys(data.invoiceProducts.content).map(
                index => data.invoiceProducts.content[index]
              ),
            ]);
          }
          fetchProductionExpense({
            id,
            onSuccess: ({ data }) => {
              dispatch(
                setSelectedProductionExpense({
                  newSelectedProductionExpense: [...data],
                })
              );
            },
          });
          fetchMaterialList({
            filters: {
              isDeleted: 0,
              attachedInvoices: [id],
              invoiceTypes: [6],
              limit: 1000,
            },
          });
          fetchProductionExpensesList({
            filters: { invoices: [id], vat: 0, limit: 1000 },
          });
          fetchProductionMaterialExpense({
            id,
            onSuccess: ({ data }) => {
              dispatch(
                setSelectedProductionMaterial({
                  newSelectedProductionMaterial: [...data],
                })
              );
            },
          });
          fetchProductionEmployeeExpense({
            id,
            onSuccess: ({ data }) => {
              dispatch(
                setSelectedProductionEmployeeExpense({
                  newSelectedProductionEmployeeExpense: [...data],
                })
              );
            },
          });
        },
      });
    } else {
      setActiveTab('1');
    }
  }, [id]);

  const setCreateOrderPost = (allData, dataId = undefined) => {
    if (
      allData.filter(({ invoiceProductId }) => invoiceProductId !== undefined)
        .length > 0
    ) {
      if (
        selectedOrdersWithProduct.filter(
          selectedOrder => selectedOrder.orders.length > 0
        ).length > 0
      ) {
        selectedOrdersWithProduct
          .filter(selectedOrder => selectedOrder.orders.length > 0)
          .map((item, index) => {
            const newSelectedOrders = {
              orders_ul: item.orders.map(({ id }) => id),
              invoiceProduct: [
                ...[].concat(
                  ...allData.map(content =>
                    content.productContent.map(items => items)
                  )
                ),
              ].find(({ id }) => id === item.productId)?.selectedProductId,
              productMaterial: item.productId,
            };
            createProductionProductOrder({
              data: newSelectedOrders,
              onSuccessCallback: () => {
                if (
                  selectedOrdersWithProduct.filter(
                    selectedOrder => selectedOrder.orders.length > 0
                  ).length -
                    1 ===
                  index
                ) {
                  fetchProductionProductOrder({
                    filters: {
                      invoiceProducts: [
                        ...[].concat(
                          ...allData.map(item =>
                            item.productContent.map(
                              ({ selectedProductId }) => selectedProductId
                            )
                          )
                        ),
                      ],
                    },
                    onSuccessCallback: ({ data }) => {
                      let tmp = {};
                      if (data.length > 0) {
                        data.forEach((value, index) => {
                          if (tmp[value.productMaterialId]) {
                            tmp = {
                              ...tmp,
                              [value.productMaterialId]: {
                                ...tmp[value.productMaterialId],
                                orders: value.orderId
                                  ? [
                                      ...tmp[value.productMaterialId].orders,
                                      {
                                        direction: value.orderDirection,
                                        id: value.orderId,
                                        serialNumber: value.orderSerialNumber,
                                      },
                                    ]
                                  : [],
                              },
                            };
                          } else {
                            tmp[value.productMaterialId] = {
                              productId: value.productMaterialId,
                              orders: [
                                {
                                  direction: value.orderDirection,
                                  id: value.orderId,
                                  serialNumber: value.orderSerialNumber,
                                },
                              ],
                            };
                          }
                        });
                      }
                      setSelectedOrdersWithProduct(Object.values(tmp));
                    },
                  });
                  onCreateCallBack(dataId);
                }
              },
            });
          });
      } else {
        onCreateCallBack(dataId);
      }
    } else {
      onCreateCallBack(dataId);
    }
  };
  const changeCost = (data, notDefault = false) => {
    const totalQuantity = selectedProducts.reduce(
      (total_amount, { invoiceQuantity }) =>
        math.add(total_amount, Number(invoiceQuantity) || 0),
      0
    );
    const total = selectedProducts.reduce(
      (total_amount, { invoiceQuantity }) =>
        math.add(
          total_amount,
          math.mul(
            summaries.find(item => item.label === 'Cəmi').value ||
              data.price > 0
              ? math.div(
                  math.add(
                    Number(summaries.find(item => item.label === 'Cəmi').value),
                    Number(data.price) || 0
                  ) || 0,
                  Number(totalQuantity) || 1
                )
              : 0,
            Number(invoiceQuantity)
          ) || 0
        ),
      0
    );
    const cost =
      summaries.find(item => item.label === 'Cəmi').value || data.price > 0
        ? math.div(
            math.add(
              Number(summaries.find(item => item.label === 'Cəmi').value),
              Number(data.price) || 0
            ) || 0,
            Number(totalQuantity) || 1
          )
        : 0;
    const notRoundedCost =
      summaries.find(item => item.label === 'Cəmi').value || data.price > 0
        ? new BigNumber(summaries.find(item => item.label === 'Cəmi').value)
            .plus(new BigNumber(data.price || 0))
            .dividedBy(new BigNumber(totalQuantity || 1))
        : 0;
    const cost_percentage =
      cost > 0 ? math.div(math.mul(Number(cost), 100), Number(total) || 1) : 0;
    if (notDefault) {
      let newTransferData = {};
      newTransferData = {
        operationDate: productionInfo.operationDate,
        stock: productionInfo.stockToId,
        invoiceProducts_ul: productionInfo.invoiceProducts?.content.map(
          ({ planned_cost, planned_price, invoiceProductId }) => ({
            id: invoiceProductId,
            plannedCost: Number(planned_cost),
            plannedPrice: Number(planned_price),
            itemCost: cost === 0 ? 0 : roundTo(Number(cost), 2) || 0,
          })
        ),
      };
      if (productionInfo?.stockToId !== null) {
        editTransferProduction({
          data: newTransferData,
          id: Number(id),
        });
      } else {
        let newData = {};
        newData = {
          invoiceProducts_ul: productionInfo.invoiceProducts?.content.map(
            ({ invoiceProductId }) => ({
              id: invoiceProductId,
              itemCost: cost === 0 ? 0 : roundTo(Number(cost), 2) || 0,
            })
          ),
        };
        editProductionCost({ data: newData, id: Number(id) });
      }
      setSelectedProducts({
        newSelectedProducts: selectedProducts.map(selectedProduct => {
          return {
            ...selectedProduct,
            cost_percentage: roundTo(Number(cost_percentage), 2),
            cost: cost === 0 ? 0 : roundTo(Number(cost), 4) || undefined,
            total_price: Number(notRoundedCost),
          };
        }),
      });
    }
    setSelectedProducts({
      newSelectedProducts: selectedProducts.map(selectedProduct => {
        return {
          ...selectedProduct,
          cost_percentage: roundTo(Number(cost_percentage), 2),
          cost: cost === 0 ? 0 : roundTo(Number(cost), 4) || undefined,
          total_price: Number(notRoundedCost),
        };
      }),
    });
  };

  const handleCreateExpense = invoiceId => {
    const expense = {
      expenses_ul: selectedProductionExpense.map(({ name, date, price }) => ({
        name,
        date,
        price: Number(price),
      })),
      invoice: Number(invoiceId),
    };
    const employeeExpense = {
      expenses_ul: selectedProductionEmployeeExpense.map(
        ({ employeeName, date, price, type, hours, applyToSalary, staffEmployeeId }) => ({
          applyToSalary,
          employee: staffEmployeeId,
          employeeName,
          date,
          price: Number(price),
          hours: Number(hours) || null,
          type,
        })
      ),
      invoice: Number(invoiceId),
    };
    const material = {
      materials_ul: selectedProductionMaterial.map(
        ({ name, date, price, quantity, unitOfMeasurementId }) => ({
          name,
          date,
          price: Number(price),
          unitOfMeasurement: unitOfMeasurementId,
          quantity: Number(quantity),
        })
      ),
      invoice: Number(invoiceId),
    };
    createProductionExpense({
      data:
        selectedProductionExpense?.length > 0
          ? expense
          : {
              expenses_ul: [],
              invoice: Number(invoiceId),
            },
    });
    createProductionEmployeeExpense({
      data:
        selectedProductionEmployeeExpense?.length > 0
          ? employeeExpense
          : {
              expenses_ul: [],
              invoice: Number(invoiceId),
            },
      onFailureCallback: () => {
        fetchProductionInfo({
          id,
          onSuccess: ({ data }) => {
            setProductionInfo(data);
            if (data.invoiceProducts && data.invoiceProducts.content){ 
              setTableDatas([
                ...Object.keys(data.invoiceProducts.content).map(
                  index => data.invoiceProducts.content[index]
                ),
              ]);
            }
            fetchProductionExpense({
              id,
              onSuccess: ({ data }) => {
                dispatch(
                  setSelectedProductionExpense({
                    newSelectedProductionExpense: [...data],
                  })
                );
              },
            });
            fetchMaterialList({
              filters: {
                isDeleted: 0,
                attachedInvoices: [id],
                invoiceTypes: [6],
                limit: 1000,
              },
            });
            fetchProductionExpensesList({
              filters: { invoices: [id], vat: 0, limit: 1000 },
            });
            fetchProductionMaterialExpense({
              id,
              onSuccess: ({ data }) => {
                dispatch(
                  setSelectedProductionMaterial({
                    newSelectedProductionMaterial: [...data],
                  })
                );
              },
            });
            fetchProductionEmployeeExpense({
              id,
              onSuccess: ({ data }) => {
                dispatch(
                  setSelectedProductionEmployeeExpense({
                    newSelectedProductionEmployeeExpense: [...data],
                  })
                );
              },
            });
          },
        });
      }
    });
    createProductionMaterialExpense({
      data:
        selectedProductionMaterial?.length > 0
          ? material
          : {
              materials_ul: [],
              invoice: Number(invoiceId),
            },
    });
  };
  const onCreateCallBack = (dataId) => {
    if (id) {
      toast.success(messages.successText);
    } else {
      if(dataId){
        history.push(`/sales/production/edit?id=${dataId}&productionStatus=${productionStatus}&isDeleted=${isDeleted}`)
      }else{
        history.goBack();
      }    
      toast.success(messages.successText);
    }
  };

  // Create production invoice
  const handleCreateInvoice = values => {
    const { dateFrom, dateTo, currency, client, salesman, contract, stockTo, productionDate, productionMaterialsStock} = values;
    let newPurchaseInvoice = {};
    newPurchaseInvoice = {
      startDate: dateFrom.format(fullDateTimeWithSecond),
      endDate: dateTo ? dateTo.format(fullDateTimeWithSecond) : null,
      salesman,
      currency,
      client: client || null,
      contract: contract || null,
      description: description || null,
      invoiceProducts_ul: handleSelectedProducts(selectedProducts),
      productionMaterialsStock: productionMaterialsStock || null,
      operationDate: productionDate?.format(fullDateTimeWithSecond),
      stock: stockTo || null,
    };

    if (id) {        
      editInvoice({
          data: newPurchaseInvoice,
          type: 'production',
          id: Number(id),
          onSuccessCallback: () => {
            fetchProductionInfo({
              id,
              onSuccess: ({ data }) => {
                setProductionInfo(data);
                const invoiceContent = data.invoiceProducts;

                const { content } = invoiceContent;

                const selectedProducts = {};
                content
                  .filter(item => item.materials.length > 0)
                  .forEach(
                    ({
                      invoiceProductId,
                      productId,
                      productName,
                      quantity,
                      pricePerUnit,
                      unitOfMeasurementName,
                      serialNumber,
                      cost,
                      planned_cost,
                      planned_price,
                      materials,
                    }) => {
                      if (selectedProducts[productId]) {
                        selectedProducts[productId] = {
                          ...selectedProducts[productId],
                          invoiceQuantity: math.add(
                            round(quantity),
                            selectedProducts[productId].invoiceQuantity
                          ),
                        };
                      } else {
                        selectedProducts[productId] = {
                          id: productId,
                          invoiceProductId,
                          name: productName,
                          barcode: undefined,
                          unitOfMeasurementName,
                          serialNumbers: serialNumber
                            ? [serialNumber]
                            : undefined,
                          invoiceQuantity: round(quantity),
                          invoicePrice: round(pricePerUnit),
                          cost: roundTo(Number(cost), 4),
                          total_price: cost,
                          plannedCost: Number(planned_cost),
                          plannedPrice: Number(planned_price),
                          materials,
                        };
                      }
                    }
                  );
                handleCreateExpense(id);
                setCreateOrderPost(
                  Object.values(selectedProducts).map(product => {
                    return {
                      ...product,
                      productContent: product.materials.map(item => {
                        return {
                          ...item,
                          idForFind: product.id,
                          selectedProductId: product.invoiceProductId,
                          rootQuantity: roundTo(
                            Number(product.invoiceQuantity),
                            2
                          ),
                        };
                      }),
                    };
                  })
                );
              },
            });
          },
      });
    } else {
      setNewCreatedProduct(true)
      createInvoice({
        data: newPurchaseInvoice,
        type: 'production',
        onSuccessCallback: ({ data }) => {
          fetchProductionInfo({
            id: data.id,
            onSuccess: ({ data }) => {
              setProductionInfo(data);
              const invoiceContent = data.invoiceProducts;

              const { content } = invoiceContent;

              const selectedProducts = {};
              content
                .filter(item => item.materials.length > 0)
                .forEach(
                  ({
                    invoiceProductId,
                    productId,
                    productName,
                    quantity,
                    pricePerUnit,
                    unitOfMeasurementName,
                    serialNumber,
                    cost,
                    planned_cost,
                    planned_price,
                    materials,
                  }) => {
                    if (selectedProducts[productId]) {
                      selectedProducts[productId] = {
                        ...selectedProducts[productId],
                        invoiceQuantity: math.add(
                          round(quantity),
                          selectedProducts[productId].invoiceQuantity
                        ),
                      };
                    } else {
                      selectedProducts[productId] = {
                        id: productId,
                        invoiceProductId,
                        name: productName,
                        barcode: undefined,
                        unitOfMeasurementName,
                        serialNumbers: serialNumber
                          ? [serialNumber]
                          : undefined,
                        invoiceQuantity: round(quantity),
                        invoicePrice: round(pricePerUnit),
                        cost: roundTo(Number(cost), 4),
                        total_price: cost,
                        plannedCost: Number(planned_cost),
                        plannedPrice: Number(planned_price),
                        materials,
                      };
                    }
                  }
                );
              handleCreateExpense(data.id);
              setCreateOrderPost(
                Object.values(selectedProducts).map(product => {
                  return {
                    ...product,
                    productContent: product.materials.map(item => {
                      return {
                        ...item,
                        idForFind: product.id,
                        selectedProductId: product.invoiceProductId,
                        rootQuantity: roundTo(
                          Number(product.invoiceQuantity),
                          2
                        ),
                      };
                    }),
                  };
                }),
                data.id
              );
            },
          });
        },
      });
    }
  };
  const handleConfirmClick = () => {
    if (
      selectedOrdersWithProduct
        .map(item => item.productId)
        .includes(selectedRow.id)
    ) {
      const data = selectedOrdersWithProduct.map(item => {
        if (item.productId === selectedRow.id) {
          return {
            ...item,
            orders: [...item.orders, ...selectedOrders],
          };
        }
        return {
          ...item,
        };
      });
      setSelectedOrdersWithProduct(data);
    } else {
      const data = {
        productId: selectedRow.id,
        orders: [...selectedOrders],
      };
      setSelectedOrdersWithProduct([data, ...selectedOrdersWithProduct]);
    }
    setModalIsVisible(false);
  };
  
  // Manipulate selected products to api required form.
  const handleSelectedProducts = selectedProducts =>
    selectedProducts.map(
      ({
        plannedCost,
        plannedPrice,
        id,
        invoiceQuantity,
        serialNumbers,
        total_price,
      }) => ({
        product: id,
        quantity: Number(invoiceQuantity),
        plannedCost: Number(plannedCost),
        plannedPrice: Number(plannedPrice),
        itemCost: Number(total_price),
        serialNumber_ul: serialNumbers || [],
      })
    );

  const handleSelectedTransfer = selectedProducts =>
    selectedProducts.map(
      ({ cost, invoiceProductId, plannedCost, plannedPrice }) => ({
        plannedCost: Number(plannedCost),
        plannedPrice: Number(plannedPrice),
        id: invoiceProductId,
        itemCost: Number(cost),
      })
    );
  // Form Submit (Finally trying to create invoice)
  const handlePurchaseInvoice = () => {
    validateFields((errors, values) => {
      if (!errors) {
        const { isValid, errorMessage } = validateSelectedProducts(
          selectedProducts
        );
        if (!isValid) {
          if (errorMessage) {
            return toast.error(errorMessage);
          }
        } else {
          handleCreateInvoice(values);
        }
      } else {
        setActiveTab('1');
      }
    });
  };

  const validateSelectedProducts = selectedProducts => {
    let errorMessage = '';
    let isValid = true;
    // Is product is exists in invoice
    if (selectedProducts.length === 0) {
      errorMessage = 'Qaimədə məhsul mövcud deyil';
      isValid = false;
    }
    // Has price or quantity missed product
    else if (
      selectedProducts.some(
        ({ plannedPrice, plannedCost, invoiceQuantity }) =>
          plannedPrice === undefined ||
          plannedCost === undefined ||
          Number(invoiceQuantity || 0) === 0
      )
    ) {
      errorMessage =
        'İstehsalat tapşırığında say, maya dəyəri və ya satış qiyməti qeyd edilməyən məhsul mövcuddur.';
      isValid = false;
    } else if (
      selectedProducts.some(({ cost }) => cost === undefined || cost === null)
    ) {
      errorMessage = 'Əlavə xərc faizi məhsullar üzrə düzgün bölüşdürülməyib.';
      isValid = false;
    }
    return {
      isValid,
      errorMessage,
    };
  };

  const onScroll = e => setScrolled(true);

  return (
    <ProWrapper onScroll={onScroll}>
      <SendToStock
        edit={id}
        summaries={summaries}
        businessUnit={productionInfo?.businessUnitId}
        isVisible={stockModal}
        toggleModal={handleSendToStock}
        startDate={getFieldValue('dateFrom')}
        fields={getFieldsValue()}
        formValidate={form}
        description={description}
        setStockTo={setStockTo}
        setActiveTab={setActiveTab}
        businessUnits={businessUnits}
        selectedOrdersWithProduct={selectedOrdersWithProduct}
        setCreateOrderPost={setCreateOrderPost}
        newCreatedProduct={newCreatedProduct}
      />
      <div className={styles.newOperationContainer}>
        <Row>
          <Col span={17} offset={3}>
            <Form>
              
              {
                !newCreatedProduct?
                <a
                onClick={history.goBack}
                className={styles.returnBackButton}
              >
                <MdKeyboardArrowLeft size={24} style={{ marginRight: 4 }} />
                İstehsalat tapşırıqlarının siyahısı
              </a>:
               <Link
               to={`/sales/production?productionStatus=${productionStatus}&isDeleted=${isDeleted}`}
               className={styles.returnBackButton}
             >
               <MdKeyboardArrowLeft size={24} style={{ marginRight: 4 }} />
               İstehsalat tapşırıqlarının siyahısı
             </Link>}
              <h3 className={styles.title}>
                {id ? 'Düzəliş et' : 'Yeni istehsalat tapşırığı'}
              </h3>

              <Tabs
                className={styles.tabs}
                type="card"
                activeKey={activeTab}
                onTabClick={handleActiveTabChange}
              >
                <TabPane tab="Ümumi məlumat" key="1" forceRender>
                  <GeneralInfo
                    summaries={summaries}
                    form={form}
                    id={id}
                    returnUrl={returnUrl}
                    productionInfo={productionInfo}
                    setProductContents={setProductContents}
                    productContents={productContents}
                    selectedOrdersWithProduct={selectedOrdersWithProduct}
                    setSelectedOrdersWithProduct={setSelectedOrdersWithProduct}
                    onScan={onScan}
                    scrolled={scrolled}
                    setScrolled={setScrolled}
                  />
                </TabPane>
                <TabPane tab="Əlavə xərclər" key="2" forceRender>
                  <ProductionExpense
                    mergedInvoiceContent={mergedInvoiceContent}
                    setMergedInvoiceContent={setMergedInvoiceContent}
                    form={form}
                    id={id}
                    summaries={summaries}
                    returnUrl={returnUrl}
                    productionInfo={productionInfo}
                    changeCost={changeCost}
                  />
                </TabPane>
                <TabPane tab="Əsas göstəricilər" key="3" forceRender>
                  <ProductionIndicators
                    form={form}
                    id={id}
                    returnUrl={returnUrl}
                    productionInfo={productionInfo}
                  />
                </TabPane>
                {productContents.filter(
                  content => content.productContent?.length > 0
                )?.length > 0 ? (
                  <TabPane
                    disabled={productsIsLoading}
                    tab="Tərkib"
                    key="4"
                    forceRender
                  >
                    <ProductionContent
                      form={form}
                      mergedInvoiceContent={mergedInvoiceContent}
                      setMergedInvoiceContent={setMergedInvoiceContent}
                      mainCurrency={mainCurrency}
                      id={id}
                      productionInfo={productionInfo}
                      productContents={productContents}
                      setProductContents={setProductContents}
                      handleConfirmClick={handleConfirmClick}
                      setSelectedRow={setSelectedRow}
                      selectedRow={selectedRow}
                      orders={orders}
                      setOrders={setOrders}
                      selectedOrders={selectedOrders}
                      setSelectedOrders={setSelectedOrders}
                      setModalIsVisible={setModalIsVisible}
                      modalIsVisible={modalIsVisible}
                      selectedOrdersWithProduct={selectedOrdersWithProduct}
                      setSelectedOrdersWithProduct={
                        setSelectedOrdersWithProduct
                      }
                      setSelectedWritingOffProducts={setSelectedWritingOffProducts}
                      selectedWritingOffProducts={selectedWritingOffProducts}
                      changeCost={changeCost}
                    />
                  </TabPane>
                ) : null}
                {productionInfo && productionInfo.stockToId !== null ? (
                  <TabPane tab="Transfer olunmuş məhsullar" key="5" forceRender>
                    <TransferredProduct
                      form={form}
                      restInvoiceData={productionInfo}
                      tableDatas={tableDatas}
                    />
                </TabPane>
                ) : null}
              </Tabs>
              <ActionButtons
                url={`/sales/production?productionStatus=${productionStatus}&isDeleted=${isDeleted}`}
                disabled={productionInfo && productionInfo.stockToId !== null}
                edit={id}
                form={form}
                handleNewInvoice={handlePurchaseInvoice}
                handleSendToStock={handleSendToStock}
              />
            </Form>
          </Col>
        </Row>
      </div>
    </ProWrapper>
  );
};

const mapStateToProps = state => ({
  permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
  description: state.salesOperation.description,
  selectedProducts: state.salesOperation.selectedProducts,
  selectedProductionExpense: state.salesOperation.selectedProductionExpense,
  selectedProductionEmployeeExpense:
    state.salesOperation.selectedProductionEmployeeExpense,
  selectedProductionMaterial: state.salesOperation.selectedProductionMaterial,
  materialInvoices: state.salesOperation.materialList,
  productionExpensesList: state.salesOperation.productionExpensesList,
  stocks: state.stockReducer.stocksStatics,
  profile: state.profileReducer.profile,
  businessUnits: state.businessUnitReducer.businessUnits,
  productsLoading: state.loadings.products,
  productsIsLoading: state.productReducer.isLoading,
  materialsLoading: state.loadings.fetchMaterialList,
  productionExpensesListLoading: state.loadings.fetchProductionExpensesList,
  selectedMaterialLoading: state.loadings.fetchProductionMaterialExpense,
  selectedEmployeeExpenseLoading: state.loadings.fetchProductionEmployeeExpense,
  selectedExpenseLoading: state.loadings.fetchProductionExpense,
  mainCurrency: state.kassaReducer.mainCurrency,
});

export default connect(
  mapStateToProps,
  {
    createProductionExpense,
    createProductionEmployeeExpense,
    createProductionMaterialExpense,
    editInvoice,
    createInvoice,
    fetchProductionInfo,
    fetchProductionMaterialExpense,
    fetchProductionEmployeeExpense,
    fetchProductionExpense,
    setSelectedProductionEmployeeExpense,
    setSelectedProductionExpense,
    setSelectedProductionMaterial,
    setSelectedProducts,
    fetchStockStatics,
    fetchMaterialList,
    fetchProductionExpensesList,
    fetchProducts,
    handleResetInvoiceFields,
    fetchBusinessUnitList,
    getProductComposition,
    createProductionProductOrder,
    fetchProductionProductOrder,
    editTransferProduction,
    editProductionCost,
    fetchSalesInvoiceList,
    fetchSalesInvoiceCount,
    fetchMainCurrency,
    editDateAndWarehouseTransfer,
  }
)(
  Form.create({
    name: 'GeneralInfoForm',
  })(AddProduction)
);
