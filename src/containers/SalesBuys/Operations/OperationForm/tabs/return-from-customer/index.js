/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { connect, useDispatch } from 'react-redux';
import { cookies } from 'utils/cookies';
// import { onScan } from 'onscan.js';
import { useHistory } from 'react-router-dom';
import { Form } from 'antd';
import { fetchContacts, fetchClients } from 'store/actions/contacts-new';
import { createOperationInvoice } from 'store/actions/finance/initialBalance';
import { fetchContracts } from 'store/actions/contracts';
import { fetchStocks } from 'store/actions/stock';
import {
  fetchCurrencies,
  fetchMainCurrency,
} from 'store/actions/settings/kassa';
import {
  createInvoice,
  editInvoice,
  fetchReturnFromCustomerProductsByName,
  fetchReturnFromCustomerBarcodesByName,
  fetchReturnFromCustomerCatalogs,
  fetchReturnFromCustomerProductsFromCatalog,
  clearProductsByName,
  handleQuantityChange,
  handlePriceChange,
  handleResetInvoiceFields,
  setSelectedProducts,
  fetchReturnFromCustomerInvoicesByProduct,
  handleEditInvoice,
  updateInvoiceCurrencyCode,
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
  Price,
  Trash,
  SelectFromInvoice,
  AddFromCatalog,
  SerialNumbers,
  InvoiceModalWithSN,
  InvoiceModalWithoutSN,
} from '../../invoice';
import { Payment } from '../../payment';

const math = require('exact-math');
const roundTo = require('round-to');

const ReturnFromCustomerOperation = props => {
  const {
    onScan,
    id,
    invoiceInfo,
    form,
    type = 'returnFromCustomer',
    invoiceType,
    // Fetch actions
    description,
    discount,
    vat,
    endPrice,
    fetchContacts,
    fetchContracts,
    fetchStocks,
    fetchCurrencies,
    fetchClients,
    activePayments,
    profile,
    handleResetInvoiceFields,
    handleEditInvoice,
    createInvoice,
    invoiceCurrencyCode,
    productsListByNameLoading,
    fetchReturnFromCustomerCatalogs,
    fetchReturnFromCustomerProductsFromCatalog,
    fetchReturnFromCustomerInvoicesByProduct,
    setSelectedProducts,
    selectedProducts,

    // DATAS
    contacts,
    stocks,
    clients,
    contracts,
    mainCurrency,
    currencies,
    totalPrice,

    // Fetch actions
    fetchReturnFromCustomerBarcodesByName,
    fetchMainCurrency,
    updateInvoiceCurrencyCode,
    fetchReturnFromCustomerProductsByName,
    clearProductsByName,
    handleQuantityChange,
    handlePriceChange,
    createOperationInvoice,
    editInvoice,
    contractDetails,
    deleteInvoice,
    invoicePaymentDetails,
    vatPaymentDetails
  } = props;

  const dispatch = useDispatch();
  const history = useHistory();
  const newProductNameRef = useRef(null);
  const { setFieldsValue, getFieldValue, validateFields, setFields } = form;
  const [barcodeInput, setBarcodeInput] = useState(null);
  const [isDraft, setIsDraft] = useState(false);
  const [selectedRow, setSelectedRow] = useState(undefined);
  const [invoiceModalWithSN, setInvoiceModalWithSN] = useState(false);
  const [invoiceModalWithoutSN, setInvoiceModalWithoutSN] = useState(false);
  const [catalogModalIsVisible, setCatalogModalIsVisible] = useState(false);
  const [datetime, setDatetime] = useState(invoiceInfo?.operationDate);
  const [catalogs, setCatalogs] = useState({ root: [], children: {} });
  const [selectedCatalog, setSelectedCatalog] = useState(undefined);
  const [productWithCatalog, setProductsWithCatalog] = useState([]);
  const { rate: invoicePaymentRate } = invoicePaymentDetails;
  const { rate: vatPaymentRate } = vatPaymentDetails;
  const {
    isContractSelected,
    contractAmount,
    contractBalance,
  } = contractDetails;

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
      title: 'Qiymət',
      dataIndex: 'invoicePrice',
      align: 'center',
      width: 150,
      render: (value, row) => (
        <Price row={row} value={value} handlePriceChange={handlePriceChange} />
      ),
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
      title: 'Toplam',
      dataIndex: 'total',
      width: 100,
      align: 'right',
      render: (_, row) => `${handleProductPrice(row)} ${invoiceCurrencyCode}`,
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
        if (getFieldValue('stockTo') && getFieldValue('client')) {
          fetchReturnFromCustomerBarcodesByName({
            label: 'fetchProductsListByBarcode',
            clientId: getFieldValue('client'),
            filters: {
              q: sCode,
              datetime: getFieldValue('date').format(fullDateTimeWithSecond),
              contract: getFieldValue('contract'),
              businessUnitIds: invoiceInfo
                ? invoiceInfo?.businessUnitId === null
                    ? [0]
                    : [invoiceInfo?.businessUnitId]
                : cookies.get('_TKN_UNIT_')
                ? [cookies.get('_TKN_UNIT_')]
                : undefined,
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
          if (!getFieldValue('client')) {
            setFields({
              client: {
                value: getFieldValue('client'),
                errors: [
                  new Error('Skan etməmişdən öncə Qarşı tərəf dəyərini seçin!'),
                ],
              },
            });
          }
          if (!getFieldValue('stockTo')) {
            setFields({
              stockTo: {
                value: getFieldValue('stockTo'),
                errors: [
                  new Error('Skan etməmişdən öncə Anbar dəyərini seçin!'),
                ],
              },
            });
          }
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

  // Handle product's total price
  const handleProductPrice = product => {
    const { invoiceQuantity, invoicePrice } = product;
    return formatNumberToLocale(
      defaultNumberFormat(
        math.mul(Number(invoiceQuantity) || 0, Number(invoicePrice) || 0)
      )
    );
  };

  // Fetch products searched by name
  const handleProductNameChange = productName => {
    clearTimeout(newProductNameRef.current);
    if (productName.length > 2) {
      newProductNameRef.current = setTimeout(
        () =>
          fetchReturnFromCustomerProductsByName({
            label: 'fetchProductsListByName',
            clientId: getFieldValue('client'),
            filters: {
              q: productName,
              datetime: getFieldValue('date').format(fullDateTimeWithSecond),
              contract: getFieldValue('contract'),
              businessUnitIds: invoiceInfo
                ? invoiceInfo?.businessUnitId === null
                    ? [0]
                    : [invoiceInfo?.businessUnitId]
                : cookies.get('_TKN_UNIT_')
                ? [cookies.get('_TKN_UNIT_')]
                : undefined,
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
    fetchReturnFromCustomerBarcodesByName({
      label: 'fetchProductsListByBarcode',
      clientId: getFieldValue('client'),
      filters: {
        q: productBarcode,
        datetime: getFieldValue('date').format(fullDateTimeWithSecond),
        contract: getFieldValue('contract'),
        businessUnitIds: invoiceInfo
          ? invoiceInfo?.businessUnitId === null
              ? [0]
              : [invoiceInfo?.businessUnitId]
          : cookies.get('_TKN_UNIT_')
          ? [cookies.get('_TKN_UNIT_')]
          : undefined,
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
    fetchReturnFromCustomerInvoicesByProduct({
      label: 'fetchInvoicesByProduct',
      filters:
        id || !isDraft
          ? {
              invoiceId: id,
              datetime: getFieldValue('date').format(fullDateTimeWithSecond),
              contract: getFieldValue('contract'),
              businessUnitIds: invoiceInfo
                  ? invoiceInfo?.businessUnitId === null
                      ? [0]
                      : [invoiceInfo?.businessUnitId]
                  : cookies.get('_TKN_UNIT_')
                  ? [cookies.get('_TKN_UNIT_')]
                  : undefined,
            }
          : {
              datetime: getFieldValue('date').format(fullDateTimeWithSecond),
              contract: getFieldValue('contract'),
              businessUnitIds: invoiceInfo
                  ? invoiceInfo?.businessUnitId === null
                      ? [0]
                      : [invoiceInfo?.businessUnitId]
                  : cookies.get('_TKN_UNIT_')
                  ? [cookies.get('_TKN_UNIT_')]
                  : undefined,
            },
      stockId: getFieldValue('stockTo'),
      clientId: getFieldValue('client'),
      onSuccessCallback,
      productId,
    });
  };

  // Fetch return from customer catalogs by stock Id
  const fetchCatalogs =
  (
    page = 1,
    limit = 20,
    search = '',
    stateReset = 0,
    onSuccessCallback
  ) => {
    const defaultFilters = { limit, page, name: search };
    fetchReturnFromCustomerCatalogs({
      filters: {
        ...defaultFilters,
        datetime,
        contract: getFieldValue('contract'),
        businessUnitIds: invoiceInfo
          ? invoiceInfo?.businessUnitId === null
              ? [0]
              : [invoiceInfo?.businessUnitId]
          : cookies.get('_TKN_UNIT_')
          ? [cookies.get('_TKN_UNIT_')]
          : undefined,
      },
      clientId: getFieldValue('client'),
      label: 'fetchCatalogsByInvoiceType',
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
    fetchReturnFromCustomerProductsFromCatalog({
      label: 'fetchProductsFromCatalog',
      clientId: getFieldValue('client'),
      filters: {
        catalog: catalogId || selectedCatalog,
        datetime: getFieldValue('date').format(fullDateTimeWithSecond),
        contract: getFieldValue('contract'),
        businessUnitIds: id
          ? invoiceInfo?.businessUnitId === null
            ? [0]
            : [invoiceInfo?.businessUnitId]
          : cookies.get('_TKN_UNIT_')
          ? [cookies.get('_TKN_UNIT_')]
          : undefined, ...defaultFilters},
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

  // Fetch return from customer products by catalog id
  const fetchProductsFromCatalog = catalogId => {
    fetchReturnFromCustomerProductsFromCatalog({
      label: 'fetchProductsFromCatalog',
      clientId: getFieldValue('client'),
      filters: {
        catalog: catalogId,
        datetime: getFieldValue('date').format(fullDateTimeWithSecond),
        contract: getFieldValue('contract'),
        businessUnitIds: invoiceInfo
          ? invoiceInfo?.businessUnitId === null
              ? [0]
              : [invoiceInfo?.businessUnitId]
          : cookies.get('_TKN_UNIT_')
          ? [cookies.get('_TKN_UNIT_')]
          : undefined,
      },
    });
  };

  // Manipulate selected products to api required form.
  const handleSelectedProducts = selectedProducts => {
    const tmp = {};
    selectedProducts.forEach(
      ({ invoicePrice, invoiceProducts, id, invoiceQuantity }) => {
        tmp[id] = {
          product: id,
          price: Number(invoicePrice),
          quantity: Number(invoiceQuantity),
          serialNumber_ul: [],
          invoiceProductsExtended_ul: invoiceProducts
            ? invoiceProducts.map(
                ({ invoice_product_id, invoiceQuantity }) => ({
                  invoice_product_id,
                  quantity: Number(invoiceQuantity),
                })
              )
            : [],
          discountAmount: discount.amount
            ? math.div(
                math.mul(
                  Number(invoicePrice),
                  math.div(
                    math.mul(Number(discount.amount), 100),
                    Number(totalPrice || 0)
                  )
                ),
                100
              )
            : null,
        };
      }
    );
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
        ({ invoicePrice, invoiceQuantity }) =>
          Number(invoicePrice || 0) === 0 || Number(invoiceQuantity || 0) === 0
      )
    ) {
      errorMessage =
        'Qaimədə say və ya qiyməti qeyd edilməyən məhsul mövcuddur.';
      isValid = false;
    } else if (
      isContractSelected &&
      contractAmount !== 0 &&
      math.add(Number(endPrice), contractBalance) > contractAmount
    ) {
      errorMessage = `Qiymət (${math.sub(
        contractAmount,
        contractBalance
      )})-dən böyük ola bilməz bilməz.`;
      isValid = false;
    }
    return {
      isValid,
      errorMessage,
    };
  };

  const handleReturnFromCustomerInvoice = () => {
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

  // Create sales draft invoice
  const createDraftInvoice = values => {
    const {
      date,
      currency,
      client,
      salesman,
      contract,
      description,
      stockTo,
    } = values;

    const newDraftReturnFromCustomerInvoice = {
      salesman,
      currency,
      client,
      draftType: 3,
      stock: stockTo,
      description: description || null,
      taxCurrency: currency || null,
      operationDate: date.format(fullDateTimeWithSecond),
      operator: profile.id,
      contract: contract || null,
      discount: Number(discount.amount) || null,
      tax: Number(vat.amount) || null,
      invoiceProducts_ul: handleSelectedProducts(selectedProducts, true),
    };

    if (id) {
      editInvoice({
        data: newDraftReturnFromCustomerInvoice,
        type: 'draft',
        id: Number(id),
        onSuccessCallback: () => {
          toast.success(messages.successText);
          history.goBack();
        },
      });
    } else {
      createInvoice({
        data: newDraftReturnFromCustomerInvoice,
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
                    return toast.error(<div>Seçilmiş tarixdə, qaimədə qeyd olunan {errorData?.errors?.data?.length > 1 ? 'sətirlərdəki məhsullar' : 'sətirdəki məhsul' } <strong>{stocks?.find(item=> item.id === stockTo)?.name}</strong> anbarında kifayət qədər yoxdur. <div style={{display: 'flex', flexDirection: 'column'}}>{Object.values(errorArr).map(({productId, productName, serialNumbers})=> (<span>{selectedProducts?.findIndex(({id})=> id === productId) + 1}. {productName} {serialNumbers && serialNumbers !== null && serialNumbers.length>0 ? '/ Seriya nömrəsi:' + serialNumbers?.toString() :''} </span>)
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

  const handleCreateInvoice = values => {
    const { date, currency, client, salesman, contract, stockTo } = values;

    const newSalesInvoice = {
      salesman,
      currency,
      client,
      stock: stockTo,
      description: description || null,
      operationDate: date.format(fullDateTimeWithSecond),
      taxCurrency: currency || null,
      operator: profile.id,
      contract: contract || null,
      discount: Number(discount.amount) || null,
      tax: Number(vat.amount) || null,
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
              type: 'returnFromCustomer',
              onSuccessCallback: ({ data }) => {
                const { id } = data;
                if (activePayments.length > 0) {
                  handleInvoicePayment(values, id);
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
                    return toast.error(<div>Seçilmiş tarixdə, qaimədə qeyd olunan {errorData?.errors?.data?.length > 1 ? 'sətirlərdəki məhsullar' : 'sətirdəki məhsul' } <strong>{stocks?.find(item=> item.id === stockTo)?.name}</strong> anbarında kifayət qədər yoxdur. <div style={{display: 'flex', flexDirection: 'column'}}>{Object.values(errorArr).map(({productId, productName, serialNumbers})=> (<span>{selectedProducts?.findIndex(({id})=> id === productId) + 1}. {productName} {serialNumbers && serialNumbers !== null && serialNumbers.length>0 ? '/ Seriya nömrəsi:' + serialNumbers?.toString() :''} </span>)
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
          type: 'returnFromCustomer',
          id: Number(id),
          onSuccessCallback: () => {
            if (activePayments.length > 0) {
              handleInvoicePayment(values, Number(id));
            } else {
              toast.success(messages.successText);
              history.goBack();
            }
          },
          onFailureCallback: ({error}) => {
            const errorData = error?.response?.data?.error;
            if (errorData?.errors?.key === "wrong_end_price") {
              return toast.error(
                `Son qiymət ${roundToDown(
                  errorData?.errors?.paidAmount
              )} ${invoiceCurrencyCode} məbləğindən az ola bilməz.`,
                { autoClose: 8000 }
              );
            }
            if (errorData?.message === "Wrong tax amount") {
              return toast.error(
                `ƏDV ${Number(invoiceInfo.paidTaxAmount || 0)} ${invoiceCurrencyCode} məbləğindən az ola bilməz.`,
                { autoClose: 8000 }
              );
            }
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
              return toast.error(<div>Seçilmiş tarixdə, qaimədə qeyd olunan {errorData?.errors?.data?.length > 1 ? 'sətirlərdəki məhsullar' : 'sətirdəki məhsul' } <strong>{stocks?.find(item=> item.id === stockTo)?.name}</strong> anbarında kifayət qədər yoxdur. <div style={{display: 'flex', flexDirection: 'column'}}>{Object.values(errorArr).map(({productId, productName, serialNumbers})=> (<span>{selectedProducts?.findIndex(({id})=> id === productId) + 1}. {productName} {serialNumbers && serialNumbers !== null && serialNumbers.length>0 ? '/ Seriya nömrəsi:' + serialNumbers?.toString() :''} </span>)
                        )}</div></div>,
                        { autoClose: 8000 }
                        );
            }
          },
        });
      }
    } else {
      createInvoice({
        data: newSalesInvoice,
        type: 'returnFromCustomer',
        onSuccessCallback: ({ data }) => {
          const { id } = data;
          if (activePayments.length > 0) {
            handleInvoicePayment(values, id);
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
            return toast.error(<div>Seçilmiş tarixdə, qaimədə qeyd olunan {errorData?.errors?.data?.length > 1 ? 'sətirlərdəki məhsullar' : 'sətirdəki məhsul' } <strong>{stocks?.find(item=> item.id === stockTo)?.name}</strong> anbarında kifayət qədər yoxdur. <div style={{display: 'flex', flexDirection: 'column'}}>{Object.values(errorArr).map(({productId, productName, serialNumbers})=> (<span>{selectedProducts?.findIndex(({id})=> id === productId) + 1}. {productName} {serialNumbers && serialNumbers !== null && serialNumbers.length>0 ? '/ Seriya nömrəsi:' + serialNumbers?.toString() :''} </span>)
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

  const handleInvoicePayment = (values, invoiceId) => {
    const {
      client,
      date,
      invoicePaymentType,
      invoicePaymentAccount,
      invoicePaymentAmount,
      invoicePaymentCurrency,
    } = values;

    const data = {
      invoices_ul: [invoiceId],
      type: -1,
      useAdvance: false,
      description: description || null,
      dateOfTransaction: date.format(fullDateTimeWithSecond),
      typeOfPayment: invoicePaymentType,
      amounts_ul: [invoicePaymentAmount],
      currencies_ul: [invoicePaymentCurrency],
      cashbox: invoicePaymentAccount,
      rate: invoicePaymentRate,
      isTax: false,
    };

    createOperationInvoice(data, () => {
      if (activePayments.includes('2')) {
        handleTaxPayment(values, invoiceId);
      } else {
        toast.success('Məlumatlar yadda saxlanıldı.');
        history.goBack();
      }
    });
  };

  const handleTaxPayment = (values, invoiceId) => {
    const {
      date,
      client,
      vatPaymentType,
      vatPaymentAccount,
      vatPaymentAmount,
      vatPaymentCurrency,
    } = values;

    const data = {
      invoices_ul: [invoiceId],
      type: -1,
      useAdvance: false,
      description: description || null,
      dateOfTransaction: date.format(fullDateTimeWithSecond),
      typeOfPayment: vatPaymentType,
      amounts_ul: [vatPaymentAmount],
      currencies_ul: [vatPaymentCurrency],
      cashbox: vatPaymentAccount,
      rate: vatPaymentRate,
      isTax: true,
    };

    createOperationInvoice(data, () => {
      toast.success('Məlumatlar yadda saxlanıldı.');
      history.goBack();
    });
  };

  const updateEditInvoice = (selectedContract, isDraft) => {
    const {
      clientId,
      salesmanId,
      operationDate,
      currencyId,
      contractId,
      endPrice,
      stockToId,
      stockFromId,
      description,
      invoiceProducts,
      currencyCode,
      amount,
      discountAmount,
      taxAmount,
      taxCurrencyCode,
    } = invoiceInfo;
    const { content } = invoiceProducts;
    const selectedProductIds = content.map(({ productId }) => productId);
    const selectedProducts = {};
    fetchReturnFromCustomerProductsFromCatalog({
      label: 'fetchEditProductsFromCatalog',
      setState: false,
      clientId,
      stockId: stockToId || stockFromId,
      filters: {
        invoiceId: id,
        product: selectedProductIds,
        datetime: getFieldValue('date').format(fullDateTimeWithSecond),
        contract: getFieldValue('contract'),
        businessUnitIds: invoiceInfo
          ? invoiceInfo?.businessUnitId === null
              ? [0]
              : [invoiceInfo?.businessUnitId]
          : cookies.get('_TKN_UNIT_')
          ? [cookies.get('_TKN_UNIT_')]
          : undefined,
      },
      onSuccessCallback: ({ data }) => {
        content.forEach(
          ({
            productId,
            productName,
            quantity,
            pricePerUnit,
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
                serialNumbers: serialNumber ? [serialNumber] : undefined,
                invoiceQuantity: roundToDown(quantity),
                invoicePrice: roundToDown(pricePerUnit),
                unitOfMeasurementName,
                quantity: Number(productDetails?.quantity || 0),    
                usedQuantity: roundToDown(usedQuantity),
                invoiceProducts: [
                  {
                    invoice_product_id: isDraft
                      ? draftRootInvoiceProductId
                      : attachedInvoiceProductId,
                    invoiceQuantity: Number(quantity),
                    usedQuantity: roundToDown(usedQuantity),
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
          description: description || null,
          discount: {
            percentage: roundTo(
              math.div(math.mul(Number(discountAmount) || 0, 100), amount),
              4
            ),
            amount: discountAmount || undefined,
          },
          vat: {
            amount: roundTo(Number(taxAmount), 2) || undefined,
            percentage: roundTo(
              math.div(math.mul(Number(taxAmount) || 0, 100), endPrice),
              4
            ),
          },
          contractDetails: selectedContract
            ? {
                isContractSelected: true,
                contractAmount: Number(selectedContract.amount),
                contractBalance: Number(selectedContract.rest),
                currencyCode,
              }
            : {
                isContractSelected: false,
                contractAmount: undefined,
                contractBalance: undefined,
              },
          invoiceCurrencyCode: currencyCode,
          vatCurrencyCode: taxCurrencyCode,
          activePayments: [],
          invoicePaymentDetails: {
            currencyCode,
            accountBalance: [],
          },
          vatPaymentDetails: {
            currencyCode,
            accountBalance: [],
          },
        });
      },
    });

    setFieldsValue({
      date: moment(operationDate, fullDateTimeWithSecond),
      client: clientId,
      salesman: salesmanId,
      contract: contractId || undefined,
      currency: currencyId,
      stockTo: stockToId || stockFromId,
    });
  };

  const handleReturnFromCustomerDraftInvoice = () => {
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

  useEffect(() => {
    if (invoiceInfo) {
      const { contractId, invoiceType } = invoiceInfo;
      if (invoiceType === 8) {
        setIsDraft(true);
      }
      if (contractId && contracts.length > 0) {
        const selectedContract = contracts.find(({ id }) => id === contractId);
        updateEditInvoice(selectedContract, invoiceType === 8);
      } else if (!contractId) {
        updateEditInvoice(undefined, invoiceType === 8);
      }
    }
  }, [invoiceInfo, contracts]);

  useEffect(() => {
    // if (contacts.length === 0) {
    //   fetchContacts();
    // }
    // fetchClients();
    setFieldsValue({ date: moment() });
    fetchMainCurrency();
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
        fetchContracts({
          limit: 1000,
          status: 1,
          invoiceId: id,
          businessUnitIds:
            invoiceInfo?.businessUnitId === null
              ? [0]
              : [invoiceInfo?.businessUnitId],
        });
      }
    } else if (cookies.get('_TKN_UNIT_')) {
      fetchStocks({ limit: 1000, businessUnitIds: [cookies.get('_TKN_UNIT_')] });
      fetchContracts({
        limit: 1000,
        status: 1,
        businessUnitIds: [cookies.get('_TKN_UNIT_')],
      });
    } else {
      fetchStocks({ limit: 1000 });
      fetchContracts({ limit: 1000, status: 1 });
    }
  }, [cookies.get('_TKN_UNIT_'), id, invoiceInfo]);
  useEffect(() => {
    fetchCurrencies({
      dateTime: invoiceInfo
        ? invoiceInfo.operationDate
        : getFieldValue('date')?.format(fullDateTimeWithSecond),
      withRatesOnly: 1,
    });
  }, [getFieldValue('date')]);

  useEffect(() => {
    setDatetime(getFieldValue('date')?.format(fullDateTimeWithSecond));
  }, [getFieldValue('date')]);
  useEffect(() => {
    if (
      currencies?.some(currency => currency.id === getFieldValue('currency'))
    ) {
      setFieldsValue({ currency: getFieldValue('currency') });
    } else {
      setFieldsValue({ currency: undefined });
      updateInvoiceCurrencyCode(undefined);
    }
  }, [currencies]);
  useEffect(() => {
    setFieldsValue({ currency: mainCurrency?.id });
    updateInvoiceCurrencyCode(mainCurrency?.code);
  }, [mainCurrency]);

  const counterpartyLabel = fields.counterparty.label;
  return (
    <>
      <InvoiceModalWithSN
        type={type}
        product={selectedRow}
        isVisible={invoiceModalWithSN}
        fetchProductInvoices={fetchProductInvoices}
        toggleModal={toggleInvoiceModalWithSN}
      />
      <InvoiceModalWithoutSN
        type={type}
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
          counterpartyLabel={counterpartyLabel}
          fields={Object.values(fields)}
          form={form}
        />
        <Invoice
          type={type}
          form={form}
          isDraft={isDraft}
          columns={columns}
          invoiceType={invoiceType}
          catalogModalIsDisabled={
            !getFieldValue('client') || !getFieldValue('stockTo')
          }
          selectProductIsDisabled={
            !getFieldValue('client') || !getFieldValue('stockTo')
          }
          toggleCatalogModal={toggleCatalogModal}
          productSelectLoading={productsListByNameLoading}
          handleProductBarcodeChange={handleProductBarcodeChange}
          handleChangeSearch={handleChangeSearch}
          setBarcodeInput={setBarcodeInput}
          barcodeInput={barcodeInput}
          handleProductNameChange={handleProductNameChange}
          handleNewInvoice={handleReturnFromCustomerInvoice}
          handleDraftInvoice={handleReturnFromCustomerDraftInvoice}
        />
        {activePayments.length > 0 ? (
          <Payment
            form={form}
            isDraft={isDraft}
            handleNewInvoice={handleReturnFromCustomerInvoice}
            handleDraftInvoice={handleReturnFromCustomerDraftInvoice}
            id={id}
            invoiceInfo={invoiceInfo}
          />
        ) : null}
      </Form>
    </>
  );
};

const mapStateToProps = state => ({
  users: state.usersReducer.users,
  contacts: state.contactsReducer.contacts,
  stocks: state.stockReducer.stocks,
  clients: state.contactsReducer.clients,
  contracts: state.contractsReducer.contracts,
  description: state.salesOperation.description,
  discount: state.salesOperation.discount,
  vat: state.salesOperation.vat,
  endPrice: state.salesOperation.endPrice,
  products: state.salesOperation.productsByName,
  profile: state.profileReducer.profile, // used for operator id
  activePayments: state.salesOperation.activePayments,
  contractDetails: state.salesOperation.contractDetails,
  invoiceCurrencyCode: state.salesOperation.invoiceCurrencyCode,
  productsListByNameLoading:
    state.loadings.fetchReturnFromCustomerProductsByName,
  selectedProducts: state.salesOperation.selectedProducts,
  currencies: state.kassaReducer.currencies,
  mainCurrency: state.kassaReducer.mainCurrency,
  totalPrice: state.salesOperation.totalPrice,
  invoicePaymentDetails: state.salesOperation.invoicePaymentDetails,
  vatPaymentDetails: state.salesOperation.vatPaymentDetails,
});

export const ReturnFromCustomer = Form.create({
  name: 'ReturnFromCustomeForm',
})(
  connect(
    mapStateToProps,
    {
      createInvoice,
      fetchContacts,
      fetchContracts,
      fetchStocks,
      fetchCurrencies,
      fetchClients,
      fetchReturnFromCustomerProductsByName,
      fetchReturnFromCustomerBarcodesByName,
      fetchReturnFromCustomerCatalogs,
      fetchReturnFromCustomerProductsFromCatalog,
      fetchReturnFromCustomerInvoicesByProduct,
      setSelectedProducts,
      clearProductsByName,
      handleQuantityChange,
      handlePriceChange,
      handleResetInvoiceFields,
      createOperationInvoice,
      handleEditInvoice,
      editInvoice,
      updateInvoiceCurrencyCode,
      fetchMainCurrency,
      deleteInvoice,
    }
  )(ReturnFromCustomerOperation)
);
