/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { connect, useDispatch } from 'react-redux';
import { cookies } from 'utils/cookies';
// import onScan from 'onscan.js';
import { useHistory } from 'react-router-dom';
import { Form } from 'antd';
import { fetchContacts, fetchClients } from 'store/actions/contacts-new';
import { createOperationInvoice } from 'store/actions/finance/initialBalance';
import { fetchStocks } from 'store/actions/stock';
import {
  createInvoice,
  editInvoice,
  fetchWritingOffProductsByName,
  fetchWritingOffBarcodesByName,
  fetchWritingOffCatalogs,
  fetchWritingOffProductsFromCatalog,
  clearProductsByName,
  handleQuantityChange,
  setSelectedProducts,
  handlePriceChange,
  handleResetInvoiceFields,
  fetchWritingOffInvoicesByProduct,
  handleEditInvoice,
  fetchProductionInfo,
  fetchProductionMaterialExpense,
  fetchProductionEmployeeExpense,
  fetchProductionExpense,
  setSelectedProductionEmployeeExpense,
  setSelectedProductionExpense,
  setSelectedProductionMaterial,
  fetchMaterialList,
  fetchProductionExpensesList,
  editTransferProduction,
  editProductionCost,
  createProductionProductOrder,
  fetchProductionProductOrder,
} from 'store/actions/sales-operation';
import { fetchFilteredContracts } from 'store/actions/contracts';
import { fetchSalesInvoiceList } from 'store/actions/salesAndBuys';
import { deleteInvoice } from 'store/actions/operations';
import moment from 'moment';
import { toast } from 'react-toastify';
import {
  defaultNumberFormat,
  formatNumberToLocale,
  fullDateTimeWithSecond,
  messages,
  roundToDown,
} from 'utils';
import { fields } from './fields';
import GeneralInformation from '../../general-fields';
import {
  Invoice,
  Quantity,
  Trash,
  SelectFromInvoice,
  AddFromCatalog,
  SerialNumbers,
  InvoiceModalWithSN,
  InvoiceModalWithoutSN,
} from '../../invoice';

const math = require('exact-math');
const BigNumber = require('bignumber.js');
const roundTo = require('round-to');

const WritingOffOperation = props => {
  const {
    onScan,
    id,
    type = 'writingOff',
    invoiceInfo,
    description,
    form,
    profile,
    invoiceType,
    // Fetch actions
    handleQuantityChange,
    handleResetInvoiceFields,
    handleEditInvoice,
    createInvoice,
    setSelectedProducts,
    selectedProducts,
    clearProductsByName,
    editInvoice,
    deleteInvoice,
    fetchProductionInfo,
    fetchProductionMaterialExpense,
    fetchProductionEmployeeExpense,
    fetchProductionExpense,
    setSelectedProductionEmployeeExpense,
    setSelectedProductionExpense,
    setSelectedProductionMaterial,
    fetchMaterialList,
    fetchProductionExpensesList,
    editTransferProduction,
    editProductionCost,
    // Loadings
    productsListByNameLoading,
    materialsLoading,
    productionExpensesListLoading,
    selectedMaterialLoading,
    selectedEmployeeExpenseLoading,
    selectedExpenseLoading,
    // DATAS
    stocks,
    selectedProductionExpense,
    selectedProductionEmployeeExpense,
    selectedProductionMaterial,
    materialInvoices,
    productionExpensesList,
    createProductionProductOrder,
    fetchProductionProductOrder,
    // API
    fetchStocks,
    fetchWritingOffCatalogs,
    fetchWritingOffProductsFromCatalog,
    fetchWritingOffInvoicesByProduct,
    fetchWritingOffProductsByName,
    fetchWritingOffBarcodesByName,
    fetchSalesInvoiceList,
    fetchFilteredContracts,
  } = props;

  const dispatch = useDispatch();
  const history = useHistory();
  const newProductNameRef = useRef(null);
  const [loader, setLoader] = useState(false);
  const { setFieldsValue, getFieldValue, validateFields, setFields } = form;
  const [barcodeInput, setBarcodeInput] = useState(null);
  const [selectedRow, setSelectedRow] = useState(undefined);
  const [isDraft, setIsDraft] = useState(false);
  const [invoiceModalWithSN, setInvoiceModalWithSN] = useState(false);
  const [invoiceModalWithoutSN, setInvoiceModalWithoutSN] = useState(false);
  const [catalogModalIsVisible, setCatalogModalIsVisible] = useState(false);
  const [productionId, setProductionId] = useState(undefined);
  const [datetime, setDatetime] = useState(invoiceInfo?.operationDate);
  const [productionInfo, setProductionInfo] = useState(undefined);
  const [summaries, setSummaries] = useState(undefined);
  const [productionOrders, setProductionOrders] = useState([]);
  const [allProductionData, setAllProductionData] = useState([]);
  const [catalogs, setCatalogs] = useState({ root: [], children: {} });
  const [selectedCatalog, setSelectedCatalog] = useState(undefined);
  const [productWithCatalog, setProductsWithCatalog] = useState([]);

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 80,
      render: (_, row, index) => index + 1,
    },
    {
      title: 'Məhsul adı',
      dataIndex: 'name',
      width: 150,
      align: 'left', 
      ellipsis: true,
      render: value => value,
    },
    {
      title: 'Say',
      dataIndex: 'invoiceQuantity',
      align: 'center',
      width: 150,
      render: (value, row) => (
        <Quantity
          row={row}
          value={value}
          limit={row.quantity}
          handleQuantityChange={handleQuantityChange}
        />
      ),
    },
    {
      title: 'Anbardakı miqdar',
      dataIndex: 'quantity',
      width: 150,
      align: 'center',
      render: (value, { unitOfMeasurementName }) =>
        `${formatNumberToLocale(defaultNumberFormat(value))} ${
          unitOfMeasurementName ? unitOfMeasurementName.toLowerCase() : ''
        }`,
    },
    {
      title: 'Qaimədən seç',
      key: 'addFromInvoice',
      width: 120,
      align: 'center',
      render: (value, row) => (
        <SelectFromInvoice
          disabled={row.catalog?.isServiceType}
          handleClick={() => handleModalClick(row)}
        />
      ),
    },
    {
      title: 'Seriya nömrələri',
      dataIndex: 'serialNumbers',
      width: 150,
      align: 'center',
      render: value => <SerialNumbers serialNumbers={value || []} />,
    },

    {
      title: 'Sil',
      dataIndex: 'id',
      key: 'trashIcon',
      align: 'center',
      width: 80,
      render: value => (
        <Trash value={value} handleProductRemove={handleProductRemove} />
      ),
    },
  ];
  useEffect(() => {
    onScan.attachTo(document, {
      onScan(sCode, iQty) {
        if (document.activeElement) {
          document.activeElement.blur();
        }
        if (getFieldValue('stockFrom')) {
          fetchWritingOffBarcodesByName({
            label: 'fetchProductsListByBarcode',
            stockId: getFieldValue('stockFrom'),
            filters: {
              q: sCode,
              only_products: 1,
              datetime,
            },
            onSuccessCallback: ({ data }) => {
              if (data && data.length !== 0) {
                const hasProduct = selectedProducts?.find(
                  product => product.id === data.id
                );
                if (hasProduct) {
                  if (data?.catalog?.isWithoutSerialNumber) {
                    if (Number(hasProduct.invoiceQuantity) + 1 <= Number(data.quantity)) {
                      handleQuantityChange(
                        data.id,
                        Number(hasProduct.invoiceQuantity) + 1,
                        -1
                      );
                    }
                  }
                } else if (data?.catalog?.isWithoutSerialNumber) {
                  dispatch(
                    setSelectedProducts({
                      newSelectedProducts: [
                        ...selectedProducts,
                        { ...data, invoiceQuantity: 1 },
                      ],
                    })
                  );
                } else {
                  dispatch(
                    setSelectedProducts({
                      newSelectedProducts: [...selectedProducts, { ...data }],
                    })
                  );
                }
              }
              setBarcodeInput(null);
            },
          });
        } else {
          setFields({
            stockFrom: {
              value: getFieldValue('stockFrom'),
              errors: [new Error('Skan etməmişdən öncə Anbar dəyərini seçin!')],
            },
          });
        }
      },
    });
    return () => {
      onScan.detachFrom(document);
    };
  }, [selectedProducts]);

  const handleProductRemove = productId => {
    const newSelectedProducts = selectedProducts.filter(
      selectedProduct => selectedProduct.id !== productId
    );
    dispatch(setSelectedProducts({ newSelectedProducts }));
  };

  // Add From Invoice Modal Click
  const handleModalClick = row => {
    setSelectedRow(row);
    if (row.catalog.isWithoutSerialNumber) {
      toggleInvoiceModalWithoutSN();
    } else {
      toggleInvoiceModalWithSN();
    }
  };

  // Toggle Product Invoices Modal with Serial Numbers
  const toggleInvoiceModalWithSN = () => {
    setInvoiceModalWithSN(wasVisible => !wasVisible);
  };

  // Toggle Product Invoices Modal without Serial Numbers
  const toggleInvoiceModalWithoutSN = () => {
    setInvoiceModalWithoutSN(wasVisible => !wasVisible);
  };

  // Toggle Add Catalog modal
  const toggleCatalogModal = () => {
    setCatalogModalIsVisible(
      prevCatalogModalIsVisible => !prevCatalogModalIsVisible
    );
  };

  // Fetch products searched by name
  const handleProductNameChange = productName => {
    clearTimeout(newProductNameRef.current);
    if (productName.length > 2) {
      newProductNameRef.current = setTimeout(
        () =>
          fetchWritingOffProductsByName({
            label: 'fetchProductsListByName',
            stockId: getFieldValue('stockFrom'),
            filters: {
              q: productName,
              only_products: 1,
              datetime,
            },
          }),
        600
      );
    } else {
      dispatch(clearProductsByName());
    }
  };
  // Fetch products by product barcode
  const handleChangeSearch = productBarcode => {
    setBarcodeInput(productBarcode);
  };
  const handleProductBarcodeChange = productBarcode => {
    setBarcodeInput(productBarcode);
    fetchWritingOffBarcodesByName({
      label: 'fetchProductsListByBarcode',
      stockId: getFieldValue('stockFrom'),
      filters: {
        q: productBarcode,
        only_products: 1,
        datetime,
      },
      onSuccessCallback: ({ data }) => {
        if (data && data.length !== 0) {
          const hasProduct = selectedProducts?.find(
            product => product.id === data.id
          );
          if (hasProduct) {
            if (data?.catalog?.isWithoutSerialNumber) {
              if (Number(hasProduct.invoiceQuantity) + 1 <= Number(data.quantity)) {
                handleQuantityChange(
                  data.id,
                  Number(hasProduct.invoiceQuantity) + 1,
                  -1
                );
              }
            }
          } else if (data?.catalog?.isWithoutSerialNumber) {
            dispatch(
              setSelectedProducts({
                newSelectedProducts: [
                  ...selectedProducts,
                  { ...data, invoiceQuantity: 1 },
                ],
              })
            );
          } else {
            dispatch(
              setSelectedProducts({
                newSelectedProducts: [...selectedProducts, { ...data }],
              })
            );
          }
        }
        setBarcodeInput(null);
      },
    });
  };
  // Fetch Product Invoices by product Id
  const fetchProductInvoices = (productId, onSuccessCallback) => {
    fetchWritingOffInvoicesByProduct({
      label: 'fetchInvoicesByProduct',
      filters:
        id || !isDraft
          ? {
              invoiceId: id,
              datetime,
            }
          : {
              datetime,
            },
      stockId: getFieldValue('stockFrom'),
      onSuccessCallback,
      productId,
    });
  };

  // Fetch sales catalogs by stock Id
  const fetchCatalogs = (
    page = 1,
    limit = 20,
    search = '',
    stateReset = 0,
    onSuccessCallback
  ) => {
    const defaultFilters = { limit, page, name: search };
      fetchWritingOffCatalogs({ 
        filters: {
          ...defaultFilters,
          only_products: 1,
          datetime,
        },
        label: 'fetchCatalogsByInvoiceType',
        stockId: getFieldValue('stockFrom'),
        onSuccessCallback: data => {
            let appendList = {};
            if (data.data) {
                appendList = data.data;
            }
            if (onSuccessCallback !== undefined) {
                onSuccessCallback(!Object.keys(appendList).length);
            }
            if (stateReset) {
                setCatalogs(appendList);
            } else {
                setCatalogs({
                    ...appendList,
                    root: catalogs.root.concat(appendList.root),
                });
            }
          },
      });
  };

  const fetchProductFromCatalogs = (
    catalogId,
    page = 1,
    limit = 20,
    search = '',
    stateReset = 0,
    onSuccessCallback
  ) => {
    const defaultFilters = { limit, page, name: search };
    fetchWritingOffProductsFromCatalog({
      label: 'fetchProductsFromCatalog',
      stockId: getFieldValue('stockFrom'),
      filters: {
          catalog: catalogId || selectedCatalog,
          datetime,
          ...defaultFilters,
        },
      onSuccessCallback: data => {
          let appendList = [];
          if (data.data) {
            data.data.forEach(element => {
              appendList.push({
                  id: element.id,
                  name: element.name,
                  quantityLabel:
                      Number(element.quantity || 0) > 0
                        ? ` (${formatNumberToLocale(
                            defaultNumberFormat(element.quantity)
                          )} ${
                            element.unitOfMeasurementName
                              ? element.unitOfMeasurementName.toLowerCase()
                              : ''
                          })`
                        : '',
                  ...element,
              });
            });
          }
          if (onSuccessCallback !== undefined) {
              onSuccessCallback(!appendList.length);
          }
          if (stateReset) {
              setProductsWithCatalog(appendList);
          } else {
            setProductsWithCatalog(productWithCatalog.concat(appendList));
          }
        },
      });
  };

  // Fetch sales products by catalog id
  const fetchProductsFromCatalog = catalogId => {
    fetchWritingOffProductsFromCatalog({
      label: 'fetchProductsFromCatalog',
      stockId: getFieldValue('stockFrom'),
      filters: {
        catalog: catalogId,
        datetime,
      },
    });
  };

  // Handle writing off draft invoice
  const handleWritingOffDraftInvoice = () => {
    validateFields((errors, values) => {
      if (!errors) {
        const { isValid, errorMessage } = validateSelectedProducts(
          selectedProducts
        );

        if (!isValid) {
          return toast.error(errorMessage);
        }
        createDraftInvoice(values);
      }
    });
  };

  // Create sales draft invoice
  const createDraftInvoice = values => {
    const { date, salesman, stockFrom, expenseType, expense } = values;

    const newDraftWritingOffInvoice = {
      salesman,
      currency: null,
      draftType: 6,
      stock: stockFrom,
      description: description || null,
      operator: profile.id,
      operationDate: date.format(fullDateTimeWithSecond),
      contract: expenseType === 1 ? null : expense === 0 ? null : expense,
      invoice: expenseType === 1 ? expense : null,
      invoiceProducts_ul: handleSelectedProducts(selectedProducts, true),
    };

    if (id) {
      editInvoice({
        data: newDraftWritingOffInvoice,
        type: 'draft',
        id: Number(id),
        onSuccessCallback: () => {
          toast.success(messages.successText);
          history.goBack();
        },
        onFailureCallback: ({ error }) => {
          const errorData = error?.response?.data?.error;

          if (errorData?.errors?.key === 'out_of_stock') {
            let errorArr = {};
            errorData.errors.data.forEach(
              ({
                productId,
                productName,
                serialNumber,
              }) => {
                if (errorArr[productId]) {
                  errorArr[productId] = {
                    ...errorArr[productId],
                    serialNumbers: serialNumber
                      ? [
                          ...errorArr[productId].serialNumbers,
                          serialNumber,
                        ]
                      : undefined,
                  };
                } else {
                  errorArr[productId] = {
                    productId,
                    productName,
                    serialNumbers: serialNumber ? [serialNumber] : undefined,
                  };
                }
              }
            );
            return toast.error(<div>Seçilmiş tarixdə, qaimədə qeyd olunan {errorData?.errors?.data?.length > 1 ? 'sətirlərdəki məhsullar' : 'sətirdəki məhsul' } <strong>{stocks?.find(item=> item.id === stockFrom)?.name}</strong> anbarında kifayət qədər yoxdur. <div style={{display: 'flex', flexDirection: 'column'}}>{Object.values(errorArr).map(({productId, productName, serialNumbers})=> (<span>{selectedProducts?.findIndex(({id})=> id === productId) + 1}. {productName} {serialNumbers && serialNumbers !== null && serialNumbers.length>0 ? '/ Seriya nömrəsi:' + serialNumbers?.toString() :''} </span>)
                        )}</div></div>,
                        { autoClose: 8000 }
                        );
          }
          else  {
            return toast.error(errorData?.message);
          }
        },
      });
    } else {
      createInvoice({
        data: newDraftWritingOffInvoice,
        type: 'draft',
        onSuccessCallback: () => {
          toast.success(messages.successText);
          history.push(`/sales/operations`);
        },
        onFailureCallback: ({ error }) => {
          const errorData = error?.response?.data?.error;

          if (errorData?.errors?.key === 'out_of_stock') {
            let errorArr = {};
            errorData.errors.data.forEach(
              ({
                productId,
                productName,
                serialNumber,
              }) => {
                if (errorArr[productId]) {
                  errorArr[productId] = {
                    ...errorArr[productId],
                    serialNumbers: serialNumber
                      ? [
                          ...errorArr[productId].serialNumbers,
                          serialNumber,
                        ]
                      : undefined,
                  };
                } else {
                  errorArr[productId] = {
                    productId,
                    productName,
                    serialNumbers: serialNumber ? [serialNumber] : undefined,
                  };
                }
              }
            );
            return toast.error(<div>Seçilmiş tarixdə, qaimədə qeyd olunan {errorData?.errors?.data?.length > 1 ? 'sətirlərdəki məhsullar' : 'sətirdəki məhsul' } <strong>{stocks?.find(item=> item.id === stockFrom)?.name}</strong> anbarında kifayət qədər yoxdur. <div style={{display: 'flex', flexDirection: 'column'}}>{Object.values(errorArr).map(({productId, productName, serialNumbers})=> (<span>{selectedProducts?.findIndex(({id})=> id === productId) + 1}. {productName} {serialNumbers && serialNumbers !== null && serialNumbers.length>0 ? '/ Seriya nömrəsi:' + serialNumbers?.toString() :''} </span>)
            )}</div></div>,
            { autoClose: 8000 }
            );
          }
          else  {
            return toast.error(errorData?.message);
          }
        },
        showError: false,
      });
    }
  };

  // Manipulate selected products to api required form.
  const handleSelectedProducts = (selectedProducts, isDraft) => {
    const tmp = {};
    selectedProducts.forEach(({ invoiceProducts, id, invoiceQuantity }) => {
      tmp[id] = {
        product: id,
        price: 10,
        quantity: Number(invoiceQuantity),
        serialNumber_ul: [],
        invoiceProductsExtended_ul: invoiceProducts
          ? invoiceProducts.map(({ invoice_product_id, invoiceQuantity }) => ({
              invoice_product_id,
              quantity: Number(invoiceQuantity),
            }))
          : [],
        discountAmount: isDraft ? null : undefined,
      };
    });
    return tmp;
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
        ({ invoiceQuantity }) => Number(invoiceQuantity || 0) === 0
      )
    ) {
      errorMessage =
        'Qaimədə say və ya qiyməti qeyd edilməyən məhsul mövcuddur.';
      isValid = false;
    }
    return {
      isValid,
      errorMessage,
    };
  };

  const handleWritingOffInvoice = () => {
    validateFields((errors, values) => {
      if (!errors) {
        const { isValid, errorMessage } = validateSelectedProducts(
          selectedProducts
        );
        if (!isValid) {
          return toast.error(errorMessage);
        }
        handleCreateInvoice(values);
      }
    });
  };

  const handleCreateInvoice = values => {
    const { date, salesman, stockFrom, expenseType, expense } = values;
    setProductionId(expense);
    const newWritingOffInvoice = {
      salesman,
      stock: stockFrom,
      contract: expenseType === 1 ? null : expense === 0 ? null : expense,
      description: description || null,
      operationDate: date.format(fullDateTimeWithSecond),
      operator: profile.id,
      invoice: expenseType === 1 ? expense : null,
      invoiceProducts_ul: handleSelectedProducts(selectedProducts),
    };

    if (id) {
      if (isDraft) {
        deleteInvoice({
          id,
          attribute: {},
          onSuccess: () => {
            createInvoice({
              data: newWritingOffInvoice,
              type: 'writingOff',
              onSuccessCallback: () => {
                if (expenseType === 1) {
                  fetchProductionInfo({
                    id: expense,
                    onSuccess: ({ data }) => {
                      setProductionInfo(data);
                      let allData = data.invoiceProducts.content
                        .filter(item => item.materials?.length > 0)
                        .map(product => {
                          return {
                            ...product,
                            name: product.productName,
                            invoiceQuantity: product.quantity,
                            productContent: product.materials.map(item => {
                              return {
                                ...item,
                                idForFind: product.id,
                                selectedProductId: product.invoiceProductId,
                              };
                            }),
                          };
                        });

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
                                          ...tmp[value.productMaterialId]
                                            .orders,
                                          {
                                            direction: value.orderDirection,
                                            id: value.orderId,
                                            serialNumber:
                                              value.orderSerialNumber,
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
                          
                          setProductionOrders(Object.values(tmp));
                          setAllProductionData(allData);
                        },
                      });
                      fetchProductionExpense({
                        id: expense,
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
                          attachedInvoices: [expense],
                          invoiceTypes: [6],
                          limit: 1000,
                        },
                      });
                      fetchProductionExpensesList({
                        filters: { invoices: [expense], vat: 0, limit: 1000  },
                      });
                      fetchProductionMaterialExpense({
                        id: expense,
                        onSuccess: ({ data }) => {
                          dispatch(
                            setSelectedProductionMaterial({
                              newSelectedProductionMaterial: [...data],
                            })
                          );
                        },
                      });
                      fetchProductionEmployeeExpense({
                        id: expense,
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
                  toast.success(messages.successText);
                  history.goBack();
                }
              },
              onFailureCallback: ({ error }) => {
                const errorData = error?.response?.data?.error;
      
                if (errorData?.errors?.key === 'out_of_stock') {
                  let errorArr = {};
                    errorData.errors.data.forEach(
                      ({
                        productId,
                        productName,
                        serialNumber,
                      }) => {
                        if (errorArr[productId]) {
                          errorArr[productId] = {
                            ...errorArr[productId],
                            serialNumbers: serialNumber
                              ? [
                                  ...errorArr[productId].serialNumbers,
                                  serialNumber,
                                ]
                              : undefined,
                          };
                        } else {
                          errorArr[productId] = {
                            productId,
                            productName,
                            serialNumbers: serialNumber ? [serialNumber] : undefined,
                          };
                        }
                      }
                    );
                    return toast.error(<div>Seçilmiş tarixdə, qaimədə qeyd olunan {errorData?.errors?.data?.length > 1 ? 'sətirlərdəki məhsullar' : 'sətirdəki məhsul' } <strong>{stocks?.find(item=> item.id === stockFrom)?.name}</strong> anbarında kifayət qədər yoxdur. <div style={{display: 'flex', flexDirection: 'column'}}>{Object.values(errorArr).map(({productId, productName, serialNumbers})=> (<span>{selectedProducts?.findIndex(({id})=> id === productId) + 1}. {productName} {serialNumbers && serialNumbers !== null && serialNumbers.length>0 ? '/ Seriya nömrəsi:' + serialNumbers?.toString() :''} </span>)
                    )}</div></div>,
                    { autoClose: 8000 }
                    );
                }
                else  {
                  return toast.error(errorData?.message);
                }
              },
              showError: false,
            });
          },
        });
      } else {
        editInvoice({
          data: newWritingOffInvoice,
          type: 'writingOff',
          id: Number(id),
          onSuccessCallback: () => {
            if(invoiceInfo.attachedInvoice !== null && invoiceInfo.attachedInvoice !== expense){
              fetchProductionInfo({
                id: Number(invoiceInfo.attachedInvoice),
                onSuccess: ({ data }) => {
                  const totalQuantity = data?.invoiceProducts?.content.reduce(
                    (total_amount, { quantity }) =>
                      math.add(total_amount, Number(quantity) || 0),
                    0
                  );
                  const cost =
                  data.cost > 0
                    ? math.div(
                        math.sub(
                          Number(data.cost),
                          Number(invoiceInfo.endPrice) || 0
                        ) || 0,
                        Number(totalQuantity) || 1
                      )
                    : 0;
                    let newTransferData = {};
                    newTransferData = {
                      operationDate: data.operationDate,
                      stock: data.stockToId,
                      invoiceProducts_ul: data.invoiceProducts?.content.map(
                        ({ planned_cost, planned_price, invoiceProductId }) => ({
                          id: invoiceProductId,
                          plannedCost: Number(planned_cost),
                          plannedPrice: Number(planned_price),
                          itemCost: cost === 0 ? 0 : roundTo(Number(cost), 2) || 0,
                        })
                      ),
                    };
                  if (data?.stockToId !== null) {
                    editTransferProduction({
                      data: newTransferData,
                      id: Number(invoiceInfo.attachedInvoice),
                    });
                  } else {
                    let newData = {};
                    newData = {
                      invoiceProducts_ul: data.invoiceProducts?.content.map(
                        ({ invoiceProductId }) => ({
                          id: invoiceProductId,
                          itemCost: cost === 0 ? 0 : roundTo(Number(cost), 2) || 0,
                        })
                      ),
                    };
                    editProductionCost({ data: newData, id: Number(invoiceInfo.attachedInvoice) });
                  }
                  if (expenseType === 1){
                    fetchProductionInfo({
                      id: expense,
                      onSuccess: ({ data }) => {
                        setProductionInfo(data);
                        let allData = data.invoiceProducts.content
                          .filter(item => item.materials?.length > 0)
                          .map(product => {
                            return {
                              ...product,
                              name: product.productName,
                              invoiceQuantity: product.quantity,
                              productContent: product.materials.map(item => {
                                return {
                                  ...item,
                                  idForFind: product.id,
                                  selectedProductId: product.invoiceProductId,
                                };
                              }),
                            };
                          });
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
                            
                            setProductionOrders(Object.values(tmp));
                            setAllProductionData(allData);
                          },
                        });
                        fetchProductionExpense({
                          id: expense,
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
                            attachedInvoices: [expense],
                            invoiceTypes: [6],
                            limit: 1000,
                          },
                        });
                        fetchProductionExpensesList({
                          filters: { invoices: [expense], vat: 0, limit: 1000  },
                        });
                        fetchProductionMaterialExpense({
                          id: expense,
                          onSuccess: ({ data }) => {
                            dispatch(
                              setSelectedProductionMaterial({
                                newSelectedProductionMaterial: [...data],
                              })
                            );
                          },
                        });
                        fetchProductionEmployeeExpense({
                          id: expense,
                          onSuccess: ({ data }) => {
                            dispatch(
                              setSelectedProductionEmployeeExpense({
                                newSelectedProductionEmployeeExpense: [...data],
                              })
                            );
                          },
                        });
                      },
                    })
                  } else {
                    toast.success(messages.successText);
                    history.goBack();
                  };
                },
              });
            }
            else if (expenseType === 1) {
              fetchProductionInfo({
                id: expense,
                onSuccess: ({ data }) => {
                  setProductionInfo(data);
                  let allData = data.invoiceProducts.content
                    .filter(item => item.materials?.length > 0)
                    .map(product => {
                      return {
                        ...product,
                        name: product.productName,
                        invoiceQuantity: product.quantity,
                        productContent: product.materials.map(item => {
                          return {
                            ...item,
                            idForFind: product.id,
                            selectedProductId: product.invoiceProductId,
                          };
                        }),
                      };
                    });
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
                      
                      setProductionOrders(Object.values(tmp));
                      setAllProductionData(allData);
                    },
                  });
                  fetchProductionExpense({
                    id: expense,
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
                      attachedInvoices: [expense],
                      invoiceTypes: [6],
                      limit: 1000,
                    },
                  });
                  fetchProductionExpensesList({
                    filters: { invoices: [expense], vat: 0, limit: 1000  },
                  });
                  fetchProductionMaterialExpense({
                    id: expense,
                    onSuccess: ({ data }) => {
                      dispatch(
                        setSelectedProductionMaterial({
                          newSelectedProductionMaterial: [...data],
                        })
                      );
                    },
                  });
                  fetchProductionEmployeeExpense({
                    id: expense,
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
              toast.success(messages.successText);
              history.goBack();
            }
          },
          onFailureCallback: ({ error }) => {
            const errorData = error?.response?.data?.error;
  
            if (errorData?.errors?.key === 'out_of_stock') {
              let errorArr = {};
              errorData.errors.data.forEach(
                ({
                  productId,
                  productName,
                  serialNumber,
                }) => {
                  if (errorArr[productId]) {
                    errorArr[productId] = {
                      ...errorArr[productId],
                      serialNumbers: serialNumber
                        ? [
                            ...errorArr[productId].serialNumbers,
                            serialNumber,
                          ]
                        : undefined,
                    };
                  } else {
                    errorArr[productId] = {
                      productId,
                      productName,
                      serialNumbers: serialNumber ? [serialNumber] : undefined,
                    };
                  }
                }
              );
              return toast.error(<div>Seçilmiş tarixdə, qaimədə qeyd olunan {errorData?.errors?.data?.length > 1 ? 'sətirlərdəki məhsullar' : 'sətirdəki məhsul' } <strong>{stocks?.find(item=> item.id === stockFrom)?.name}</strong> anbarında kifayət qədər yoxdur. <div style={{display: 'flex', flexDirection: 'column'}}>{Object.values(errorArr).map(({productId, productName, serialNumbers})=> (<span>{selectedProducts?.findIndex(({id})=> id === productId) + 1}. {productName} {serialNumbers && serialNumbers !== null && serialNumbers.length>0 ? '/ Seriya nömrəsi:' + serialNumbers?.toString() :''} </span>)
                        )}</div></div>,
                        { autoClose: 8000 }
                        );
            }
            else  {
              return toast.error(errorData?.message);
            }
          },
        });
      }
    } else {
      createInvoice({
        data: newWritingOffInvoice,
        type: 'writingOff',
        onSuccessCallback: () => {
          if (expenseType === 1) {
            fetchProductionInfo({
              id: expense,
              onSuccess: ({ data }) => {
                setProductionInfo(data);
                let allData = data.invoiceProducts.content
                  .filter(item => item.materials?.length > 0)
                  .map(product => {
                    return {
                      ...product,
                      name: product.productName,
                      invoiceQuantity: product.quantity,
                      productContent: product.materials.map(item => {
                        return {
                          ...item,
                          idForFind: product.id,
                          selectedProductId: product.invoiceProductId,
                        };
                      }),
                    };
                  });
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
                    setProductionOrders(Object.values(tmp));
                    setAllProductionData(allData);
                  },
                });
                fetchProductionExpense({
                  id: expense,
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
                    attachedInvoices: [expense],
                    invoiceTypes: [6],
                    limit: 1000,
                  },
                });
                fetchProductionExpensesList({
                  filters: { invoices: [expense], vat: 0, limit: 1000  },
                });
                fetchProductionMaterialExpense({
                  id: expense,
                  onSuccess: ({ data }) => {
                    dispatch(
                      setSelectedProductionMaterial({
                        newSelectedProductionMaterial: [...data],
                      })
                    );
                  },
                });
                fetchProductionEmployeeExpense({
                  id: expense,
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
            toast.success(messages.successText);
            history.push(`/sales/operations`);
          }
        },
        onFailureCallback: ({ error }) => {
          const errorData = error?.response?.data?.error;

          if (errorData?.errors?.key === 'out_of_stock') {
            let errorArr = {};
            errorData.errors.data.forEach(
              ({
                productId,
                productName,
                serialNumber,
              }) => {
                if (errorArr[productId]) {
                  errorArr[productId] = {
                    ...errorArr[productId],
                    serialNumbers: serialNumber
                      ? [
                          ...errorArr[productId].serialNumbers,
                          serialNumber,
                        ]
                      : undefined,
                  };
                } else {
                  errorArr[productId] = {
                    productId,
                    productName,
                    serialNumbers: serialNumber ? [serialNumber] : undefined,
                  };
                }
              }
            );
            return toast.error(<div>Seçilmiş tarixdə, qaimədə qeyd olunan {errorData?.errors?.data?.length > 1 ? 'sətirlərdəki məhsullar' : 'sətirdəki məhsul' } <strong>{stocks?.find(item=> item.id === stockFrom)?.name}</strong> anbarında kifayət qədər yoxdur. <div style={{display: 'flex', flexDirection: 'column'}}>{Object.values(errorArr).map(({productId, productName, serialNumbers})=> (<span>{selectedProducts?.findIndex(({id})=> id === productId) + 1}. {productName} {serialNumbers && serialNumbers !== null && serialNumbers.length>0 ? '/ Seriya nömrəsi:' + serialNumbers?.toString() :''} </span>)
                        )}</div></div>,
                        { autoClose: 8000 }
                        );
          }
          else  {
            return toast.error(errorData?.message);
          }
        },
        showError: false,
      });
    }
  };
  useEffect(() => {
    if (
      !materialsLoading &&
      !selectedMaterialLoading &&
      !selectedEmployeeExpenseLoading &&
      !selectedExpenseLoading &&
      !productionExpensesListLoading
    ) {
      const totalExpencePrice = selectedProductionExpense.reduce(
        (total, { price }) => total + Number(price),
        0
      );
      const totalEmployeePrice = selectedProductionEmployeeExpense.reduce(
        (total, { price, hours }) =>
          total + math.mul(Number(price), Number(hours || 1)),
        0
      );
      const totalMaterialPrice = selectedProductionMaterial.reduce(
        (total, { price, quantity }) =>
          total + math.mul(Number(price), Number(quantity)),
        0
      );
      const totaInvoicelMaterialPrice = materialInvoices?.reduce(
        (total, { amountInMainCurrency }) =>
          total + Number(amountInMainCurrency),
        0
      );
      const totalProductionEmployeeExpensesList = productionExpensesList
        ?.filter(item => item.transactionType === 6)
        .reduce(
          (total, { amountConvertedToMainCurrency }) =>
            total + Number(amountConvertedToMainCurrency),
          0
        );
      const totalProductionExpensesList = productionExpensesList
        ?.filter(item => item.transactionType === 8 || item.transactionType === 9)
        .reduce(
          (total, { amountConvertedToMainCurrency }) =>
            total + Number(amountConvertedToMainCurrency),
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
      setSummaries(totalAllExpense);
    }
  }, [
    selectedProductionExpense,
    selectedProductionEmployeeExpense,
    selectedProductionMaterial,
    materialInvoices,
    productionExpensesList,
    productionExpensesListLoading,
    selectedExpenseLoading,
    materialsLoading,
    selectedMaterialLoading,
    selectedEmployeeExpenseLoading,
  ]);
  useEffect(() => {
    if (summaries) {
      if (
        !materialsLoading &&
        !selectedMaterialLoading &&
        !selectedEmployeeExpenseLoading &&
        !selectedExpenseLoading &&
        !productionExpensesListLoading &&
        productionInfo
      ) {
        setLoader(true);
        const totalQuantity = productionInfo.invoiceProducts?.content.reduce(
          (total_amount, { quantity }) =>
            math.add(total_amount, Number(quantity) || 0),
          0
        );

        const cost =
        Number(summaries) > 0
            ? roundToDown(
                  math.div(
                      Number(
                          summaries
                      ) || 0,
                      Number(totalQuantity) || 1
                  )
              )
            : 0;
    
            const newSelectedProducts = [...productionInfo.invoiceProducts?.content];
    
            const totalExpenseWithoutLastRow = newSelectedProducts
                .slice(0, -1)
                .reduce(
                    (total_amount, { quantity }) =>
                        math.add(
                            total_amount,
                            math.mul(Number(quantity), cost) || 0
                        ),
                    0
                );
                
            
            const costForLastRow = math.div(
                math.sub(
                    Number(summaries),
                    Number(totalExpenseWithoutLastRow)
                ),
                Number(newSelectedProducts.pop().quantity || totalQuantity)
            );
    
        const positiveCost = toFixed(cost) < 0 || toFixed(cost) === -0 ? 0 : toFixed(cost);
        if (productionInfo?.stockToId !== null) {
          let newTransferData = {};
          newTransferData = {
            operationDate: productionInfo.operationDate,
            stock: productionInfo.stockToId,
            invoiceProducts_ul: handleSelectedTransfer(
              productionInfo.invoiceProducts?.content, costForLastRow, roundToDown(positiveCost)
            ),
          };
          editTransferProduction({
            data: newTransferData,
            id: Number(productionId),
            onSuccessCallback: () => {
              if (
                allProductionData.filter(
                  ({ invoiceProductId }) => invoiceProductId !== undefined
                ).length > 0
              ) {
                if (
                  productionOrders.filter(
                    selectedOrder => selectedOrder.orders.length > 0
                  ).length > 0
                ) {
                  productionOrders
                    .filter(selectedOrder => selectedOrder.orders.length > 0)
                    .map((item, index) => {
                      const newSelectedOrders = {
                        orders_ul: item.orders.map(({ id }) => id),
                        invoiceProduct: [
                          ...[].concat(
                            ...allProductionData.map(content =>
                              content.productContent.map(items => items)
                            )
                          ),
                        ].find(({ id }) => id === item.productId)
                          ?.selectedProductId,
                        productMaterial: item.productId,
                      };
                      createProductionProductOrder({
                        data: newSelectedOrders,
                      });
                    });
                }
              }
              if(history?.action === 'POP'){history.push('/sales/operations')}else{history.goBack()};
            },
          });
        } else {
          let newData = {};
          newData = {
            invoiceProducts_ul: handleSelectedProductionProducts(
              productionInfo.invoiceProducts?.content, costForLastRow, roundToDown(positiveCost)
            ),
          };
          editProductionCost({
            data: newData,
            id: Number(productionId),
            onSuccessCallback: () => {
              if (
                allProductionData.filter(
                  ({ invoiceProductId }) => invoiceProductId !== undefined
                ).length > 0
              ) {
                if (
                  productionOrders.filter(
                    selectedOrder => selectedOrder.orders.length > 0
                  ).length > 0
                ) {
                  productionOrders
                    .filter(selectedOrder => selectedOrder.orders.length > 0)
                    .map((item, index) => {
                      const newSelectedOrders = {
                        orders_ul: item.orders.map(({ id }) => id),
                        invoiceProduct: [
                          ...[].concat(
                            ...allProductionData.map(content =>
                              content.productContent.map(items => items)
                            )
                          ),
                        ].find(({ id }) => id === item.productId)
                          ?.selectedProductId,
                        productMaterial: item.productId,
                      };
                      createProductionProductOrder({
                        data: newSelectedOrders,
                      });
                    });
                }
              }
              if(history?.action === 'POP'){history.push('/sales/operations')}else{history.goBack()};
            },
          });
        }
      }
    }
  }, [summaries]);

  function toFixed(x) {
    if (Math.abs(x) < 1.0) {
      var e = parseInt(x.toString().split('e-')[1]);
      if (e) {
        x *= Math.pow(10, e - 1);
        x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
      }
    } else {
      var e = parseInt(x.toString().split('+')[1]);
      if (e > 20) {
        e -= 20;
        x /= Math.pow(10, e);
        x += (new Array(e + 1)).join('0');
      }
    }
    return x;
  }
  // Manipulate selected products to api required form.
  const handleSelectedTransfer = (selectedProducts, costForLastRow, positiveCost) => {
    return selectedProducts.map(
      ({ planned_cost, planned_price, invoiceProductId }, index) => {
        if(index === selectedProducts.length-1) {
          return {
            id: invoiceProductId,
            plannedCost: Number(planned_cost),
            plannedPrice: Number(planned_price),
            itemCost: toFixed(costForLastRow) === 0 ? 0 : toFixed(costForLastRow) || 0,
          }
        }
        return {
          id: invoiceProductId,
            plannedCost: Number(planned_cost),
            plannedPrice: Number(planned_price),
            itemCost: positiveCost === 0 ? 0 : positiveCost || 0,
        }
      }
    );
  };
  const handleSelectedProductionProducts = (selectedProducts, costForLastRow, positiveCost) => {
    return selectedProducts.map(({ invoiceProductId }, index) => {
      if(index === selectedProducts.length-1) {
        return {
          id: invoiceProductId,
          itemCost: toFixed(costForLastRow) === 0 ? 0 : toFixed(costForLastRow) || 0,
        }
      }
      return {
          id: invoiceProductId,
          itemCost: positiveCost === 0 ? 0 : positiveCost || 0,
      }
    });
  };
  const updateEditInvoice = isDraft => {
    const {
      attachedInvoice,
      salesmanId,
      operationDate,
      stockFromId,
      invoiceProducts,
      contractId,
    } = invoiceInfo;
    const { content } = invoiceProducts;
    const selectedProducts = {};
    const selectedProductIds = content.map(({ productId }) => productId);
    fetchWritingOffProductsFromCatalog({
      label: 'fetchEditProductsFromCatalog',
      setState: false,
      stockId: stockFromId,
      filters: {
        invoiceId: id,
        product: selectedProductIds,
        datetime: operationDate,
      },
      onSuccessCallback: ({ data }) => {
        content.forEach(
          ({
            productId,
            productName,
            quantity,
            serialNumber,
            unitOfMeasurementName,
            attachedInvoiceProductId,
            draftRootInvoiceProductId,
            isServiceType,
            catalogId,
            catalogName,
          }) => {
            if (selectedProducts[productId]) {
              selectedProducts[productId] = {
                ...selectedProducts[productId],
                serialNumbers: serialNumber
                  ? [...selectedProducts[productId].serialNumbers, serialNumber]
                  : undefined,
                invoiceQuantity: math.add(
                  roundToDown(quantity),
                  selectedProducts[productId].invoiceQuantity
                ),
                invoiceProducts: [
                  ...selectedProducts[productId].invoiceProducts,
                  {
                    invoice_product_id: isDraft
                      ? draftRootInvoiceProductId
                      : attachedInvoiceProductId,
                    invoiceQuantity: Number(quantity),
                  },
                ],
              };
            } else {
              const productDetails = data.find(
                product => product.id === productId
              );
              selectedProducts[productId] = {
                id: productId,
                name: productName,
                barcode: undefined,
                unitOfMeasurementName,
                serialNumbers: serialNumber ? [serialNumber] : undefined,
                invoiceQuantity: roundToDown(quantity),
                quantity: Number(productDetails?.quantity || 0),
                invoiceProducts: [
                  {
                    invoice_product_id: isDraft
                      ? draftRootInvoiceProductId
                      : attachedInvoiceProductId,
                    invoiceQuantity: Number(quantity),
                  },
                ],
                catalog: {
                  id: catalogId,
                  name: catalogName,
                  isWithoutSerialNumber: !serialNumber,
                  isServiceType,
                },
              };
            }
          }
        );
        handleEditInvoice({
          selectedProducts: Object.values(selectedProducts),
        });
      },
    });
    setFieldsValue({
      date: moment(operationDate, fullDateTimeWithSecond),
      salesman: salesmanId,
      stockFrom: stockFromId,
      expenseType: attachedInvoice === null ? contractId === null? 2 : 0: 1,
      expense:
        attachedInvoice === null
          ? contractId === null
            ? 0
            : contractId
          : attachedInvoice,
    });
  };

  useEffect(() => {
    if (invoiceInfo) {
      const { invoiceType } = invoiceInfo;
      if (invoiceType === 8) {
        setIsDraft(true);
      }
      updateEditInvoice(invoiceType === 8);
    }
  }, [invoiceInfo]);

  useEffect(() => {
    setDatetime(getFieldValue('date')?.format(fullDateTimeWithSecond));
  }, [getFieldValue('date')]);

  useEffect(() => {
    setFieldsValue({ date: moment(), expenseType: 2, expense: 0 });

    return () => {
      handleResetInvoiceFields();
    };
  }, []);
  useEffect(() => {
    if (id) {
      if (invoiceInfo) {
        fetchStocks({
          limit: 1000,
          businessUnitIds:
            invoiceInfo?.businessUnitId === null
              ? [0]
              : [invoiceInfo?.businessUnitId],
        });
        fetchFilteredContracts({
          limit: 1000,
          directions: [2],
          status: 1,
          businessUnitIds:
            invoiceInfo?.businessUnitId === null
              ? [0]
              : [invoiceInfo?.businessUnitId],
        });
        fetchSalesInvoiceList({
          filters: {
            invoiceTypes: [11],
            allProduction: 1,
            isDeleted: 0,
            limit: 10000,
            businessUnitIds:
              invoiceInfo?.businessUnitId === null
                ? [0]
                : [invoiceInfo?.businessUnitId],
          },
        });
      }
    } else if (cookies.get('_TKN_UNIT_')) {
      fetchStocks({ limit: 1000, businessUnitIds: [cookies.get('_TKN_UNIT_')] });
      fetchFilteredContracts({
        limit: 1000,
        directions: [2],
        status: 1,
        businessUnitIds: [cookies.get('_TKN_UNIT_')],
      });
      fetchSalesInvoiceList({
        filters: {
          invoiceTypes: [11],
          allProduction: 1,
          isDeleted: 0,
          limit: 10000,
          businessUnitIds: [cookies.get('_TKN_UNIT_')],
        },
      });
    } else {
      fetchStocks({ limit: 1000 });
      fetchFilteredContracts({ limit: 1000, directions: [2], status: 1 });
      fetchSalesInvoiceList({
        filters: {
          invoiceTypes: [11],
          allProduction: 1,
          isDeleted: 0,
          limit: 10000,
        },
      });
    }
  }, [cookies.get('_TKN_UNIT_'), id, invoiceInfo]);
  return (
    <>
      <InvoiceModalWithSN
        product={selectedRow}
        isVisible={invoiceModalWithSN}
        fetchProductInvoices={fetchProductInvoices}
        toggleModal={toggleInvoiceModalWithSN}
      />
      <InvoiceModalWithoutSN
        product={selectedRow}
        isVisible={invoiceModalWithoutSN}
        toggleModal={toggleInvoiceModalWithoutSN}
        fetchProductInvoices={fetchProductInvoices}
      />
      <AddFromCatalog
        isVisible={catalogModalIsVisible}
        toggleModal={toggleCatalogModal}
        fetchProducts={fetchProductsFromCatalog}
        fetchCatalogs={fetchCatalogs}
        catalogs={catalogs}
        setSelectedCatalog={setSelectedCatalog}
        filteredProducts={productWithCatalog}
        fetchProductFromCatalogs={fetchProductFromCatalogs}
      />
      <Form>
        <GeneralInformation
          invoiceInfo={invoiceInfo}
          fields={Object.values(fields)}
          form={form}
          writingOff
        />
        <Invoice
          type={type}
          form={form}
          isDraft={isDraft}
          columns={columns}
          invoiceType={invoiceType}
          catalogModalIsDisabled={!getFieldValue('stockFrom')}
          selectProductIsDisabled={!getFieldValue('stockFrom')}
          toggleCatalogModal={toggleCatalogModal}
          productSelectLoading={productsListByNameLoading}
          handleProductBarcodeChange={handleProductBarcodeChange}
          handleChangeSearch={handleChangeSearch}
          setBarcodeInput={setBarcodeInput}
          barcodeInput={barcodeInput}
          handleProductNameChange={handleProductNameChange}
          handleNewInvoice={handleWritingOffInvoice}
          handleDraftInvoice={handleWritingOffDraftInvoice}
          loader={loader}
        />
      </Form>
    </>
  );
};

const mapStateToProps = state => ({
  users: state.usersReducer.users,
  stocks: state.stockReducer.stocks,
  description: state.salesOperation.description,
  products: state.salesOperation.productsByName,
  profile: state.profileReducer.profile, // used for operator id
  productsListByNameLoading: state.loadings.fetchWritingOffProductsByName,
  selectedProducts: state.salesOperation.selectedProducts,
  selectedProductionExpense: state.salesOperation.selectedProductionExpense,
  selectedProductionEmployeeExpense:
    state.salesOperation.selectedProductionEmployeeExpense,
  selectedProductionMaterial: state.salesOperation.selectedProductionMaterial,
  materialInvoices: state.salesOperation.materialList,
  productionExpensesList: state.salesOperation.productionExpensesList,
  materialsLoading: state.loadings.fetchMaterialList,
  productionExpensesListLoading: state.loadings.fetchProductionExpensesList,
  selectedMaterialLoading: state.loadings.fetchProductionMaterialExpense,
  selectedEmployeeExpenseLoading: state.loadings.fetchProductionEmployeeExpense,
  selectedExpenseLoading: state.loadings.fetchProductionExpense,
});

export const WritingOff = Form.create({
  name: 'TransferForm',
})(
  connect(
    mapStateToProps,
    {
      createInvoice,
      fetchContacts,
      fetchStocks,
      fetchFilteredContracts,
      setSelectedProducts,
      fetchClients,
      fetchWritingOffProductsByName,
      fetchWritingOffBarcodesByName,
      fetchWritingOffCatalogs,
      fetchWritingOffProductsFromCatalog,
      fetchWritingOffInvoicesByProduct,
      clearProductsByName,
      handleQuantityChange,
      handlePriceChange,
      handleResetInvoiceFields,
      createOperationInvoice,
      handleEditInvoice,
      editInvoice,
      deleteInvoice,
      fetchSalesInvoiceList,
      fetchProductionInfo,
      fetchProductionMaterialExpense,
      fetchProductionEmployeeExpense,
      fetchProductionExpense,
      setSelectedProductionEmployeeExpense,
      setSelectedProductionExpense,
      setSelectedProductionMaterial,
      fetchMaterialList,
      fetchProductionExpensesList,
      editTransferProduction,
      editProductionCost,
      createProductionProductOrder,
      fetchProductionProductOrder,
    }
  )(WritingOffOperation)
);
