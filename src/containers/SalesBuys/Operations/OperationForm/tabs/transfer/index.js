/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { connect, useDispatch } from 'react-redux';
import { cookies } from 'utils/cookies';
// import { onScan } from 'onscan.js';
import { useHistory } from 'react-router-dom';
import { Form } from 'antd';
import { fetchClients } from 'store/actions/contacts-new';
import { createOperationInvoice } from 'store/actions/finance/initialBalance';
import { fetchStocks } from 'store/actions/stock';
import { fetchUnitStock } from 'store/actions/businessUnit';
import {
  createInvoice,
  editInvoice,
  fetchTransferProductsByName,
  fetchTransferBarcodesByName,
  fetchTransferCatalogs,
  fetchTransferProductsFromCatalog,
  clearProductsByName,
  handleResetInvoiceFields,
  handleQuantityChange,
  setSelectedProducts,
  fetchTransferInvoicesByProduct,
  handleEditInvoice,
} from 'store/actions/sales-operation';
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

const TransferOperation = props => {
  const {
    // States
    id,
    description,
    invoiceInfo,
    invoiceType,
    form,
    profile,
    onScan,
    // Actions
    editInvoice,
    deleteInvoice,
    handleResetInvoiceFields,
    handleEditInvoice,
    createInvoice,
    setSelectedProducts,
    selectedProducts,
    handleQuantityChange,
    clearProductsByName,
    // Loadings
    productsListByNameLoading,

    // DATAS
    users,
    stocks,
    // API
    fetchStocks,
    fetchUnitStock,
    fetchTransferCatalogs,
    fetchTransferProductsFromCatalog,
    fetchTransferInvoicesByProduct,
    fetchTransferProductsByName,
    fetchTransferBarcodesByName,
  } = props;

  const dispatch = useDispatch();
  const history = useHistory();
  const newProductNameRef = useRef(null);
  const { setFieldsValue, getFieldValue, validateFields, setFields } = form;
  const [barcodeInput, setBarcodeInput] = useState(null);
  const [selectedRow, setSelectedRow] = useState(undefined);
  const [isDraft, setIsDraft] = useState(false);
  const [unitStock, setUnitStock] = useState(undefined);
  const [invoiceModalWithSN, setInvoiceModalWithSN] = useState(false);
  const [invoiceModalWithoutSN, setInvoiceModalWithoutSN] = useState(false);
  const [catalogModalIsVisible, setCatalogModalIsVisible] = useState(false);
  const [catalogs, setCatalogs] = useState({ root: [], children: {} });
  const [datetime, setDatetime] = useState(invoiceInfo?.operationDate);
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
          selectedProducts={selectedProducts}
          invoiceInfo={invoiceInfo}
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
      render: row => (
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
      render: (value, row) => (
        Number(row.usedQuantity) === 0 || row.usedQuantity === undefined ? <Trash value={value} handleProductRemove={handleProductRemove} />: null
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
          fetchTransferBarcodesByName({
            label: 'fetchProductsListByBarcode',
            stockId: getFieldValue('stockFrom'),
            clientId: getFieldValue('client'),
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
          fetchTransferProductsByName({
            label: 'fetchProductsListByName',
            stockId: getFieldValue('stockFrom'),
            clientId: getFieldValue('client'),
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
    fetchTransferBarcodesByName({
      label: 'fetchProductsListByBarcode',
      stockId: getFieldValue('stockFrom'),
      clientId: getFieldValue('client'),
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
    fetchTransferInvoicesByProduct({
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
    fetchTransferCatalogs({ 
        filters: {
          ...defaultFilters,
          only_products: 1,
          datetime
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
    fetchTransferProductsFromCatalog({
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
    fetchTransferProductsFromCatalog({
      label: 'fetchProductsFromCatalog',
      stockId: getFieldValue('stockFrom'),
      filters: {
        catalog: catalogId,
        datetime,
      },
    });
  };

  const getAllProducts = () => {
    fetchTransferProductsFromCatalog({
      label: 'fetchProductsFromCatalog',
      stockId: getFieldValue('stockFrom'),
      filters: {
        datetime,
        type: 'product',
      },
    });
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
    // quantity missed product
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

  const handleTransferInvoice = () => {
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
    const { date, salesman, stockTo, stockFrom } = values;

    const newSalesInvoice = {
      salesman,
      stockTo,
      stock: stockFrom,
      description: description || null,
      operationDate: date.format(fullDateTimeWithSecond),
      operator: profile.id,
      invoiceProducts_ul: handleSelectedProducts(selectedProducts),
    };

    if (id) {
      if (isDraft) {
        deleteInvoice({
          id,
          attribute: {},
          onSuccess: () => {
            createInvoice({
              data: newSalesInvoice,
              type: 'transfer',
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
              showError: false,
            });
          },
        });
      } else {
        editInvoice({
          data: newSalesInvoice,
          type: 'transfer',
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
      }
    } else {
      createInvoice({
        data: newSalesInvoice,
        type: 'transfer',
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

  const updateEditInvoice = isDraft => {
    const {
      operationDate,
      salesmanId,
      stockFromId,
      stockToId,
      invoiceProducts,
      description,
    } = invoiceInfo;
    const { content } = invoiceProducts;
    const selectedProducts = {};
    const selectedProductIds = content.map(({ productId }) => productId);
    fetchTransferProductsFromCatalog({
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
            catalogId,
            catalogName,
            isServiceType,
            usedQuantity
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
                usedQuantity: roundToDown(math.add(Number(usedQuantity || 0), Number(selectedProducts[productId].usedQuantity))),
                invoiceProducts: [
                  ...selectedProducts[productId].invoiceProducts,
                  {
                    invoice_product_id: isDraft
                      ? draftRootInvoiceProductId
                      : attachedInvoiceProductId,
                    invoiceQuantity: Number(quantity),
                    usedQuantity: roundToDown(usedQuantity),
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
                    usedQuantity: roundToDown(usedQuantity),
                  },
                ],
                usedQuantity: roundToDown(usedQuantity),
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
          description: description || null,
          selectedProducts: Object.values(selectedProducts),
        });
      },
    });
    setFieldsValue({
      date: moment(operationDate, fullDateTimeWithSecond),
      salesman: salesmanId,
      stockFrom: stockFromId,
      stockTo: stockToId,
    });
  };

  // Handle sales draft invoice
  const handleTransferDraftInvoice = () => {
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
    const { date, salesman, stockFrom, stockTo } = values;

    const newDraftSalesInvoice = {
      salesman,
      draftType: 5,
      stock: stockFrom,
      stockTo,
      description: description || null,
      operator: profile.id,
      operationDate: date.format(fullDateTimeWithSecond),
      invoiceProducts_ul: handleSelectedProducts(selectedProducts, true),
    };

    if (id) {
      editInvoice({
        data: newDraftSalesInvoice,
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
        data: newDraftSalesInvoice,
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
    setFieldsValue({ date: moment() });
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
        fetchUnitStock({
          id:
            invoiceInfo?.businessUnitId === null
              ? [0]
              : [invoiceInfo?.businessUnitId],
          onSuccess: ({ data }) => {
            setUnitStock(
              data.map(item => {
                return {
                  ...item,
                  transferStocks: item.transferStocks.map(stock => {
                    return {
                      ...stock,
                      id: stock.stockId,
                      name: stock.stockName,
                    };
                  }),
                };
              })
            );
          },
        });
      }
    } else if (profile.businessUnits.length === 1) {
      fetchUnitStock({
        id: [profile.businessUnits?.[0].id],
        onSuccess: ({ data }) => {
          setUnitStock(
            data.map(item => {
              return {
                ...item,
                transferStocks: item.transferStocks.map(stock => {
                  return {
                    ...stock,
                    id: stock.stockId,
                    name: stock.stockName,
                  };
                }),
              };
            })
          );
        },
      });
      fetchStocks({limit: 1000});
    } else if (cookies.get('_TKN_UNIT_')) {
      fetchStocks({ limit: 1000, businessUnitIds: [cookies.get('_TKN_UNIT_')] });
      fetchUnitStock({
        id: [cookies.get('_TKN_UNIT_')],
        onSuccess: ({ data }) => {
          setUnitStock(
            data.map(item => {
              return {
                ...item,
                transferStocks: item.transferStocks.map(stock => {
                  return {
                    ...stock,
                    id: stock.stockId,
                    name: stock.stockName,
                  };
                }),
              };
            })
          );
        },
      });
    } else {
      fetchStocks({ limit: 1000 });
      setUnitStock(undefined);
    }
  }, [cookies.get('_TKN_UNIT_'), id, invoiceInfo, profile]);
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
        getAllProducts={getAllProducts}
        fetchCatalogs={fetchCatalogs}
        type='transfer'
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
          unitStock={unitStock}
          setUnitStock={setUnitStock}
        />
        <Invoice
          form={form}
          columns={columns}
          type="transfer"
          isDraft={isDraft}
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
          handleNewInvoice={handleTransferInvoice}
          handleDraftInvoice={handleTransferDraftInvoice}
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
  productsListByNameLoading: state.loadings.fetchTransferProductsByName,
  selectedProducts: state.salesOperation.selectedProducts,
});

export const Transfer = Form.create({
  name: 'TransferForm',
})(
  connect(
    mapStateToProps,
    {
      createInvoice,
      fetchStocks,
      fetchUnitStock,
      fetchClients,
      fetchTransferProductsByName,
      fetchTransferBarcodesByName,
      fetchTransferCatalogs,
      fetchTransferProductsFromCatalog,
      fetchTransferInvoicesByProduct,
      setSelectedProducts,
      clearProductsByName,
      handleQuantityChange,
      handleResetInvoiceFields,
      createOperationInvoice,
      handleEditInvoice,
      editInvoice,
      deleteInvoice,
    }
  )(TransferOperation)
);
