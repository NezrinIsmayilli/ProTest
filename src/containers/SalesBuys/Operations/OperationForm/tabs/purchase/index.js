/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { connect, useDispatch } from 'react-redux';
// import onScan from 'onscan.js';
import { useHistory } from 'react-router-dom';
import { cookies } from 'utils/cookies';
import { Form } from 'antd';
import { fetchContacts, fetchSuppliers } from 'store/actions/contacts-new';
import { fetchSalesInvoiceInfo } from 'store/actions/salesAndBuys';
import { createOperationInvoice } from 'store/actions/finance/initialBalance';
import { fetchContracts } from 'store/actions/contracts';
import { fetchStocks } from 'store/actions/stock';
import {
  fetchCurrencies,
  fetchMainCurrency,
} from 'store/actions/settings/kassa';
import {
  roundToDown,
  messages,
  defaultNumberFormat,
  formatNumberToLocale,
  fullDateTimeWithSecond,
} from 'utils';
import {
  editInvoice,
  createInvoice,
  fetchPurchaseProductsByName,
  fetchPurchaseBarcodesByName,
  fetchPurchaseCatalogs,
  fetchPurchaseProductsFromCatalog,
  clearProductsByName,
  handleQuantityChange,
  handlePriceChange,
  handleResetInvoiceFields,
  handleEditInvoice,
  setSelectedProducts,
  fetchSalesProductsFromCatalog,
  updateInvoiceCurrencyCode,
} from 'store/actions/sales-operation';
import { deleteInvoice } from 'store/actions/operations';
import moment from 'moment';
import { toast } from 'react-toastify';

import { fields } from './fields';
import GeneralInformation from '../../general-fields';
import {
  Invoice,
  Quantity,
  Price,
  Trash,
  SelectFromInvoice,
  AddSerialNumbers,
  AddFromCatalog,
  SerialNumbers,
} from '../../invoice';
import { Payment } from '../../payment';

const math = require('exact-math');
const roundTo = require('round-to');

const PurchaseOperation = props => {
  const {
    // States
    id,
    onScan,
    type,
    vat,
    form,
    invoiceType,
    profile,
    description,
    endPrice,
    totalPrice,
    discount,
    invoiceInfo,
    editInvoice,
    activePayments,
    selectedProducts,
    contractDetails,
    vatPaymentDetails,
    invoiceCurrencyCode,
    invoicePaymentDetails,

    // Actions
    handleResetInvoiceFields,
    createInvoice,
    createOperationInvoice,
    handleQuantityChange,
    handleEditInvoice,
    handlePriceChange,
    deleteInvoice,

    // Loadings
    productsListByNameLoading,

    // DATA
    suppliers,
    contracts,
    currencies,
    contacts,
    stocks,
    mainCurrency,

    // API
    fetchMainCurrency,
    updateInvoiceCurrencyCode,
    fetchStocks,
    fetchContacts,
    fetchContracts,
    fetchCurrencies,
    fetchSuppliers,
    clearProductsByName,
    fetchPurchaseCatalogs,
    fetchPurchaseProductsByName,
    fetchPurchaseProductsFromCatalog,
    fetchSalesProductsFromCatalog,
    fetchPurchaseBarcodesByName,
  } = props;

  const dispatch = useDispatch();
  const history = useHistory();
  const newProductNameRef = useRef(null);
  const [isDraft, setIsDraft] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState(null);
  const { setFields, setFieldsValue, getFieldValue, validateFields } = form;
  const [serialModalIsVisible, setSerialModalIsVisible] = useState(false);
  const [catalogModalIsVisible, setCatalogModalIsVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [catalogs, setCatalogs] = useState({ root: [], children: {} });
  const [selectedCatalog, setSelectedCatalog] = useState(undefined);
  const [productWithCatalog, setProductsWithCatalog] = useState([]);

  const {
    isContractSelected,
    contractAmount,
    contractBalance,
  } = contractDetails;
  const { accountBalance: invoiceAccountBalance, rate: invoicePaymentRate } = invoicePaymentDetails;
  const { accountBalance: vatAccountBalance, rate: vatPaymentRate } = vatPaymentDetails;

  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 80,
      render: (_value, _row, index) => index + 1,
    },
    {
      title: 'Məhsul adı',
      dataIndex: 'name',
      width: 170,
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
          invoiceInfo={invoiceInfo}
          row={row}
          value={value}
          limit={-1}
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
        Number(value || 0) > 0
          ? `${formatNumberToLocale(defaultNumberFormat(value || 0))} ${
              unitOfMeasurementName ? unitOfMeasurementName.toLowerCase() : ''
            }`
          : `-`,
    },
    {
      title: 'SN əlavə et',
      key: 'addFromInvoice',
      width: 120,
      align: 'center',
      render: (_, row) => (
        <SelectFromInvoice
          handleClick={() => handleModalClick(row)}
          disabled={row.catalog.isWithoutSerialNumber}
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
        Number(row.usedQuantity) === 0 || row.usedQuantity === undefined ? 
        <Trash
          value={value}
          selectedProducts={selectedProducts}
          handleProductRemove={handleProductRemove}
        /> : null
      ),
    },
  ];
  useEffect(() => {
    onScan.attachTo(document, {
      onScan(sCode, iQty) {
        if (document.activeElement) {
          document.activeElement.blur();
        }
        fetchPurchaseBarcodesByName({
          label: 'fetchProductsListByBarcode',
          filters: {
            q: sCode,
          },
          onSuccessCallback: ({ data }) => {
            if (data && data.length !== 0) {
              const hasProduct = selectedProducts?.find(
                product => product.id === data.id
              );
              if (hasProduct) {
                if (data?.catalog?.isWithoutSerialNumber) {
                  handleQuantityChange(
                    data.id,
                    Number(hasProduct.invoiceQuantity) + 1,
                    -1
                  );
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
      },
    });
    return () => {
      onScan.detachFrom(document);
    };
  }, [selectedProducts]);

  // Toggle Add Catalog Modal
  const toggleCatalogModal = () => {
    setCatalogModalIsVisible(
      prevCatalogModalIsVisible => !prevCatalogModalIsVisible
    );
  };

  // Toggle Add Serial Numbers Modal
  const toggleSerialModal = () => {
    setSerialModalIsVisible(
      prevSerialModalIsVisible => !prevSerialModalIsVisible
    );
  };

  // Add serials Modal open
  const handleModalClick = row => {
    setSelectedRow(row);
    toggleSerialModal();
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

  // Fetch products by product name
  const handleProductNameChange = productName => {
    clearTimeout(newProductNameRef.current);
    if (productName.length > 2) {
      newProductNameRef.current = setTimeout(
        () =>
          fetchPurchaseProductsByName({
            label: 'fetchProductsListByName',
            filters: {
              q: productName,
              businessUnitIds: id
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
    fetchPurchaseBarcodesByName({
      label: 'fetchProductsListByBarcode',
      filters: {
        q: productBarcode,
      },
      onSuccessCallback: ({ data }) => {
        if (data && data.length !== 0) {
          const hasProduct = selectedProducts?.find(
            product => product.id === data.id
          );
          if (hasProduct) {
            if (data?.catalog?.isWithoutSerialNumber) {
              handleQuantityChange(
                data.id,
                Number(hasProduct.invoiceQuantity) + 1,
                -1
              );
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

  // Fetch product catalogs by invoice type
  const fetchCatalogs = (
      page = 1,
      limit = 20,
      search = '',
      stateReset = 0,
      onSuccessCallback
    ) => {
      const type = 'purchase';
      const defaultFilters = { limit, page, name: search };
        fetchPurchaseCatalogs({ filters: defaultFilters, type, label: 'fetchCatalogsByInvoiceType', onSuccessCallback: data => {
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
      fetchPurchaseProductsFromCatalog({
        label: 'fetchProductsFromCatalog',
        catalogId: catalogId || selectedCatalog,
        filters: { businessUnitIds: id
        ? invoiceInfo?.businessUnitId === null
          ? [0]
          : [invoiceInfo?.businessUnitId]
        : cookies.get('_TKN_UNIT_')
        ? [cookies.get('_TKN_UNIT_')]
        : undefined, ...defaultFilters}, onSuccessCallback: data => {
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
  

  // Fetch purchase products by catalog id
  const fetchProductsFromCatalog = catalogId => {
    fetchPurchaseProductsFromCatalog({
      label: 'fetchProductsFromCatalog',
      catalogId,
      filters: {
        businessUnitIds: id
          ? invoiceInfo?.businessUnitId === null
            ? [0]
            : [invoiceInfo?.businessUnitId]
          : cookies.get('_TKN_UNIT_')
          ? [cookies.get('_TKN_UNIT_')]
          : undefined,
      },
    });
  };

  const handleProductRemove = productId => {
    const newSelectedProducts = selectedProducts.filter(
      selectedProduct => selectedProduct.id !== productId
    );
    dispatch(setSelectedProducts({ newSelectedProducts }));
  };

  /* 
        COMPLETE OPERATION
  */

  const validateInvoicePayment = values => {
    const { invoicePaymentAmount, invoicePaymentCurrency } = values;

    const { code } = currencies.find(
      currency => currency.id === invoicePaymentCurrency
    );
    const currencyBalance = invoiceAccountBalance.find(
      balance => balance.currencyCode === code
    );

    if (
      !currencyBalance ||
      Number(invoicePaymentAmount) > Number(currencyBalance?.balance || 0)
    ) {
      return {
        isValid: false,
        message: `Balansda ${code} valyutasından kifayət qədər vəsait yoxdur.`,
      };
    }

    return {
      isValid: true,
    };
  };

  // Complete invoice payment operation
  const handleInvoicePayment = (values, invoiceId) => {
    const {
      supplier,
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

    createOperationInvoice(
      data,
      () => {
        if (activePayments.includes('2')) {
          handleVatPayment(values, invoiceId);
        } else {
          toast.success('Məlumatlar yadda saxlanıldı.');
          history.goBack();
        }
      },
      () => {},
      'createInvoicePayment'
    );
  };

  const validateVatPayment = values => {
    const { vatPaymentAmount, vatPaymentCurrency } = values;

    const { code } = currencies.find(
      currency => currency.id === vatPaymentCurrency
    );

    const currencyBalance = vatAccountBalance.find(
      balance => balance.currencyCode === code
    );

    if (
      !currencyBalance ||
      Number(vatPaymentAmount) > Number(currencyBalance?.balance || 0)
    ) {
      return {
        isValid: false,
        message: `Balansda ${code} valyutasından kifayət qədər vəsait yoxdur.`,
      };
    }
    return {
      isValid: true,
    };
  };

  // Complete vat payment operation
  const handleVatPayment = (values, invoiceId) => {
    const {
      date,
      supplier,
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

    createOperationInvoice(
      data,
      () => {
        toast.success('Məlumatlar yadda saxlanıldı.');
        history.goBack();
      },
      () => {},
      'createVatPayment'
    );
  };

  // Create purchase invoice
  const handleCreateInvoice = values => {
    const {
      date,
      currency,
      supplier,
      salesman,
      contract,
      agent,
      stockTo,
    } = values;

    let newPurchaseInvoice = {};

    if (id) {
      newPurchaseInvoice = {
        salesman,
        currency,
        supplier,
        stock: stockTo,
        counterparty: null,
        agent: agent || null,
        description: description || null,
        operationDate: date.format(fullDateTimeWithSecond),
        operator: profile.id,
        taxCurrency: currency || null,
        supplierInvoiceNumber: '',
        contract: contract || null,
        discount: Number(discount.amount) || null,
        tax: Number(vat.amount) || null,
        invoiceProducts_ul: handleSelectedProducts(selectedProducts, false),
      };
      if (isDraft) {
        deleteInvoice({
          id,
          attribute: {},
          onSuccess: () => {
            createInvoice({
              data: newPurchaseInvoice,
              type: 'purchase',
              onSuccessCallback: ({ data }) => {
                const { id } = data;
                if (activePayments.length > 0) {
                  handleInvoicePayment(values, id);
                } else {
                  toast.success(messages.successText);
                  history.goBack();
                }
              },
              onFailureCallback: ({error}) => {
                const errorData = error?.response?.data?.error;
                if (errorData?.messageKey === 'serial_number_is_in_use') {
                  if(errorData?.errors?.data?.serialNumbers?.length > 1) {
                    return toast.error(`${errorData?.errors?.data?.serialNumbers?.toString()} seriya nömrələri artıq istifadə olunub.`)
                  } else {
                    return toast.error(`${errorData?.errors?.data?.serialNumbers?.toString()} seriya nömrəsi artıq istifadə olunub.`)
                  }
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
              showError: false
            });
          },
        });
      } else {
        editInvoice({
          data: newPurchaseInvoice,
          type: 'purchase',
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
            if (errorData?.messageKey === 'serial_number_is_in_use') {
              if(errorData?.errors?.data?.serialNumbers?.length > 1) {
                return toast.error(`${errorData?.errors?.data?.serialNumbers?.toString()} seriya nömrələri artıq istifadə olunub.`)
              } else {
                return toast.error(`${errorData?.errors?.data?.serialNumbers?.toString()} seriya nömrəsi artıq istifadə olunub.`)
              }
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
      // }
    } else {
      newPurchaseInvoice = {
        salesman,
        currency,
        supplier,
        stock: stockTo,
        counterparty: null,
        agent: agent || null,
        taxCurrency: currency || null,
        description: description || null,
        operationDate: date.format(fullDateTimeWithSecond),
        operator: profile.id,
        supplierInvoiceNumber: '',
        contract: contract || null,
        discount: Number(discount.amount) || null,
        tax: Number(vat.amount) || null,
        invoiceProducts_ul: handleSelectedProducts(selectedProducts, false),
      };

      createInvoice({
        data: newPurchaseInvoice,
        type: 'purchase',
        onSuccessCallback: ({ data }) => {
          const { id } = data;
          if (activePayments.length > 0) {
            handleInvoicePayment(values, id);
          } else {
            toast.success(messages.successText);
            history.push(`/sales/operations`);
          }
        },
        onFailureCallback: ({error}) => {
          const errorData = error?.response?.data?.error;
          if (errorData?.messageKey === 'serial_number_is_in_use') {
            if(errorData?.errors?.data?.serialNumbers?.length > 1) {
              return toast.error(`${errorData?.errors?.data?.serialNumbers?.toString()} seriya nömrələri artıq istifadə olunub.`)
            } else {
              return toast.error(`${errorData?.errors?.data?.serialNumbers?.toString()} seriya nömrəsi artıq istifadə olunub.`)
            }
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
        showError: false
      });
    }
  };

  // Handle draft invoice
  const createDraftInvoice = values => {
    const {
      date,
      agent,
      currency,
      supplier,
      salesman,
      contract,
      stockTo,
    } = values;

    const newDraftPurchaseInvoice = {
      agent,
      salesman,
      currency,
      supplier,
      draftType: 1,
      stock: stockTo,
      description: description || null,
      taxCurrency: currency || null,
      operationDate: date.format(fullDateTimeWithSecond),
      operator: profile.id,
      supplierInvoiceNumber: '',
      contract: contract || null,
      discount: Number(discount.amount) || null,
      tax: Number(vat.amount) || null,
      invoiceProducts_ul: handleSelectedProducts(selectedProducts, true),
    };

    if (id) {
      editInvoice({
        data: newDraftPurchaseInvoice,
        type: 'draft',
        id: Number(id),
        onSuccessCallback: () => {
          toast.success(messages.successText);
          history.goBack();
        },
        onFailureCallback: ({error}) => {
          const errorData = error?.response?.data?.error;
          if (errorData?.messageKey === 'serial_number_is_in_use') {
            if(error?.response?.data?.error?.errors?.data?.serialNumbers?.length > 1) {
              return toast.error(`${error?.response?.data?.error?.errors?.data?.serialNumbers?.toString()} seriya nömrələri artıq istifadə olunub.`)
            } else {
              return toast.error(`${error?.response?.data?.error?.errors?.data?.serialNumbers?.toString()} seriya nömrəsi artıq istifadə olunub.`)
            }
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
    } else {
      createInvoice({
        data: newDraftPurchaseInvoice,
        type: 'draft',
        onSuccessCallback: () => {
          toast.success(messages.successText);
          history.push(`/sales/operations`);
        },
        onFailureCallback: ({error}) => {
          const errorData = error?.response?.data?.error;
          if (errorData?.messageKey === 'serial_number_is_in_use') {
            if(errorData?.errors?.data?.serialNumbers?.length > 1) {
              return toast.error(`${errorData?.errors?.data?.serialNumbers?.toString()} seriya nömrələri artıq istifadə olunub.`)
            } else {
              return toast.error(`${errorData?.errors?.data?.serialNumbers?.toString()} seriya nömrəsi artıq istifadə olunub.`)
            }
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
        showError: false
      });
    }
  };
  // Manipulate selected products to api required form.
  const handleSelectedProducts = (selectedProducts, isDraft) => {

    if (isDraft) {
      return selectedProducts.map(
        ({ invoicePrice, id, invoiceQuantity, serialNumbers }) => ({
          product: id,
          price: Number(invoicePrice),
          quantity: Number(invoiceQuantity),
          serialNumber_ul: serialNumbers || [],
          invoiceProductsExtended_ul: [],
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
        })
      );
    }
    return selectedProducts.map(
      ({ invoicePrice, id, invoiceQuantity, serialNumbers }) => ({
        product: id,
        cost: null,
        price: Number(invoicePrice),
        quantity: Number(invoiceQuantity),
        serialNumber_ul: serialNumbers || [],
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
        : null
      })
    );
  };

  // Form Submit (Finally trying to create invoice)
  const handlePurchaseInvoice = () => {
    validateFields((errors, values) => {
      if (!errors) {
        const { isValid, errorMessage } = validateSelectedProducts(
          selectedProducts
        );
        const paymentsAreValid =
          activePayments.length > 0 ? validatePaymentAmounts(values) : true;
        if (!isValid || !paymentsAreValid) {
          if (errorMessage) {
            return toast.error(errorMessage);
          }
        } else {
          handleCreateInvoice(values);
        }
      }
    });
  };

  const handlePurchaseDraftInvoice = () => {
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
      math.sub(Number(endPrice), contractBalance) > 0
    ) {
      errorMessage = 'Müqavilə limiti aşıla bilməz.';
      isValid = false;
    }
    return {
      isValid,
      errorMessage,
    };
  };

  const validatePaymentAmounts = values => {
    const { invoicePaymentAmount, vatPaymentAmount } = values;
    const { message: invoiceErrorMessage } = validateInvoicePayment(values);

    if (activePayments.includes('2')) {
      const { message: vatErrorMessage } = validateVatPayment(values);

      if (!invoiceErrorMessage && !vatErrorMessage) {
        return true;
      }
      setFields({
        invoicePaymentAmount: {
          value: invoicePaymentAmount,
          errors: invoiceErrorMessage ? [new Error(invoiceErrorMessage)] : [],
        },
        vatPaymentAmount: {
          value: vatPaymentAmount,
          errors: vatErrorMessage ? [new Error(vatErrorMessage)] : [],
        },
      });

      return false;
    }
    if (invoiceErrorMessage) {
      setFields({
        invoicePaymentAmount: {
          value: invoicePaymentAmount,
          errors: [new Error(invoiceErrorMessage)],
        },
      });
      return false;
    }
    return true;
  };

  /*
        FETCH INVOICE REQUIRED DATAS AND EDIT INVOICE VALUES
  */

  const updateEditInvoice = selectedContract => {
    const {
      supplierId,
      salesmanId,
      operationDate,
      currencyId,
      description,
      contractId,
      agentId,
      stockToId,
      stockFromId,
      endPrice,
      invoiceProducts,
      currencyCode,
      amount,
      discountAmount,
      taxAmount,
      taxCurrencyCode,
    } = invoiceInfo;
    const { content } = invoiceProducts;
    const selectedProducts = {};
    const selectedProductIds = content.map(({ productId }) => productId);
    fetchSalesProductsFromCatalog({
      label: 'fetchEditProductsFromCatalog',
      setState: false,
      stockId: stockToId || stockFromId,
      filters: {
        invoiceId: id,
        product: selectedProductIds,
        datetime: operationDate,
        businessUnitIds: id
          ? invoiceInfo?.businessUnitId === null
            ? [0]
            : [invoiceInfo?.businessUnitId]
          : cookies.get('_TKN_UNIT_')
          ? [cookies.get('_TKN_UNIT_')]
          : undefined,
      },
      onSuccessCallback: ({ data: totalQuantities }) => {
        content.forEach(
          ({
            productId,
            productName,
            quantity,
            pricePerUnit,
            isServiceType,
            unitOfMeasurementName,
            catalogId,
            catalogName,
            serialNumber,
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
              };
            } else {
              const productDetails = totalQuantities.find(
                product => product.id === productId
              );
              selectedProducts[productId] = {
                id: productId,
                name: productName,
                barcode: undefined,
                unitOfMeasurementName,
                quantity: Number(productDetails?.quantity || 0),
                serialNumbers: serialNumber ? [serialNumber] : undefined,
                invoiceQuantity: roundToDown(quantity),
                invoicePrice: roundToDown(pricePerUnit),
                usedQuantity: roundToDown(usedQuantity),
                content: content?.filter(item=> item.productId === productId),
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
          description: description || undefined,
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
            accountBalance: [],
          },
          vatPaymentDetails: {
            accountBalance: [],
          },
        });
      },
    });
    setFieldsValue({
      date: moment(operationDate, fullDateTimeWithSecond),
      supplier: supplierId,
      salesman: salesmanId,
      contract: contractId || undefined,
      currency: currencyId,
      agent: agentId || undefined,
      stockTo: stockToId || stockFromId,
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
    // fetchSuppliers();
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
  return (
    <>
      <AddFromCatalog
        isVisible={catalogModalIsVisible}
        toggleModal={toggleCatalogModal}
        fetchProducts={fetchProductsFromCatalog}
        fetchCatalogs={fetchCatalogs}
        catalogs={catalogs}
        setCatalogs={setCatalogs}
        setSelectedCatalog={setSelectedCatalog}
        filteredProducts={productWithCatalog}
        fetchProductFromCatalogs={fetchProductFromCatalogs}
      />
      <AddSerialNumbers
        selectedRow={selectedRow}
        isVisible={serialModalIsVisible}
        toggleModal={toggleSerialModal}
      />
      <Form>
        <GeneralInformation invoiceInfo={invoiceInfo} form={form} fields={Object.values(fields)} />
        <Invoice
          type={type}
          form={form}
          isDraft={isDraft}
          columns={columns}
          invoiceType={invoiceType}
          toggleCatalogModal={toggleCatalogModal}
          productSelectLoading={productsListByNameLoading}
          handleProductNameChange={handleProductNameChange}
          handleChangeSearch={handleChangeSearch}
          handleProductBarcodeChange={handleProductBarcodeChange}
          setBarcodeInput={setBarcodeInput}
          barcodeInput={barcodeInput}
          handleNewInvoice={handlePurchaseInvoice}
          handleDraftInvoice={handlePurchaseDraftInvoice}
          catalogModalIsDisabled={false}
        />
        {activePayments.length > 0 ? (
          <Payment
            form={form}
            isDraft={isDraft}
            handleNewInvoice={handlePurchaseInvoice}
            handleDraftInvoice={handlePurchaseDraftInvoice}
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
  suppliers: state.contactsReducer.suppliers,
  clients: state.contactsReducer.clients,
  contracts: state.contractsReducer.contracts,
  currencies: state.kassaReducer.currencies,
  description: state.salesOperation.description,
  discount: state.salesOperation.discount,
  vat: state.salesOperation.vat,
  endPrice: state.salesOperation.endPrice,
  contractDetails: state.salesOperation.contractDetails,
  invoicePaymentDetails: state.salesOperation.invoicePaymentDetails,
  vatPaymentDetails: state.salesOperation.vatPaymentDetails,
  activePayments: state.salesOperation.activePayments,
  selectedProducts: state.salesOperation.selectedProducts,
  invoiceCurrencyCode: state.salesOperation.invoiceCurrencyCode,
  products: state.salesOperation.productsByName,
  profile: state.profileReducer.profile, // used for operator id
  mainCurrency: state.kassaReducer.mainCurrency,
  totalPrice: state.salesOperation.totalPrice,
});

export const Purchase = Form.create({
  name: 'PurchaseForm',
})(
  connect(
    mapStateToProps,
    {
      clearProductsByName,
      fetchSalesInvoiceInfo,
      handleResetInvoiceFields,
      createOperationInvoice,
      createInvoice,
      handleQuantityChange,
      handlePriceChange,
      deleteInvoice,
      handleEditInvoice,
      editInvoice,
      // API
      fetchContracts,
      fetchStocks,
      fetchContacts,
      fetchCurrencies,
      fetchSuppliers,
      fetchPurchaseProductsByName,
      fetchPurchaseCatalogs,
      fetchPurchaseProductsFromCatalog,
      fetchSalesProductsFromCatalog,
      updateInvoiceCurrencyCode,
      fetchMainCurrency,
      fetchPurchaseBarcodesByName,
    }
  )(PurchaseOperation)
);
