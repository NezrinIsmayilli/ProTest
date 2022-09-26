/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { connect, useDispatch } from 'react-redux';
import { cookies } from 'utils/cookies';
// import { onScan } from 'onscan.js';
import { useHistory } from 'react-router-dom';
import { Tooltip, Form } from 'antd';
import { fetchContacts, fetchClients } from 'store/actions/contacts-new';
import { createOperationInvoice } from 'store/actions/finance/initialBalance';
import { fetchContracts } from 'store/actions/contracts';
import { fetchStocks } from 'store/actions/stock';
import { deleteInvoice } from 'store/actions/operations';
import {
  fetchCurrencies,
  fetchMainCurrency,
} from 'store/actions/settings/kassa';
import {
  createInvoice,
  editInvoice,
  fetchSalesProductsByName,
  fetchSalesBarcodesByName,
  fetchSalesCatalogs,
  fetchSalesProductsFromCatalog,
  clearProductsByName,
  handleQuantityChange,
  handlePriceChange,
  handleResetInvoiceFields,
  fetchSalesInvoicesByProduct,
  fetchSalesPrices,
  handleEditInvoice,
  setSelectedProducts,
  setProductsByName,
  updateInvoiceCurrencyCode,
} from 'store/actions/sales-operation';
import moment from 'moment';
import { toast } from 'react-toastify';
import {
  defaultNumberFormat,
  formatNumberToLocale,
  fullDateTimeWithSecond,
  messages,
  roundToDown,
  round,
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

const SalesOperation = props => {
  const {
    // States
    onScan,
    id,
    type = 'sales',
    description,
    discount,
    vat,
    endPrice,
    profile,
    invoiceType,
    invoiceCurrencyCode,
    selectedProducts,
    contractDetails,
    activePayments,
    invoiceInfo,
    form,
    // Actions

    clearProductsByName,
    handleQuantityChange,
    handlePriceChange,
    createOperationInvoice,
    editInvoice,
    setSelectedProducts,
    handleEditInvoice,
    createInvoice,
    handleResetInvoiceFields,
    setProductsByName,

    // DATA
    clients,
    contracts,
    contacts,
    stocks,
    mainCurrency,
    currencies,
    totalPrice,

    // Loadings
    productsListByNameLoading,

    // Fetch actions
    deleteInvoice,
    fetchMainCurrency,
    updateInvoiceCurrencyCode,
    fetchClients,
    fetchContacts,
    fetchContracts,
    fetchStocks,
    fetchCurrencies,
    fetchSalesProductsByName,
    fetchSalesCatalogs,
    fetchSalesProductsFromCatalog,
    fetchSalesInvoicesByProduct,
    fetchSalesPrices,
    fetchSalesBarcodesByName,
    invoicePaymentDetails,
    vatPaymentDetails
  } = props;

  const dispatch = useDispatch();
  const history = useHistory();
  const newProductNameRef = useRef(null);
  const { setFieldsValue, getFieldValue, validateFields, setFields } = form;
  const [barcodeInput, setBarcodeInput] = useState(null);
  const [selectedRow, setSelectedRow] = useState(undefined);
  const [isDraft, setIsDraft] = useState(false);
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
      width: 170,
      render: (value, row) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Price
            row={row}
            value={value}
            handlePriceChange={handlePriceChange}
          />
          {row.prices ? (
            <Tooltip
              title={row.prices.prices.map(priceType => (
                <div>
                  <span>{priceType.name}: </span>
                  <span>
                    {priceType.amount
                      ? formatNumberToLocale(
                          Number(priceType.amount).toFixed(2)
                        )
                      : '-'}{' '}
                    {priceType.amount ? invoiceCurrencyCode : ''}
                  </span>
                </div>
              ))}
              placement="right"
            >
              <img
                // className={styles.detailIcon}
                width={16}
                height={16}
                style={{ marginLeft: '10px' }}
                src="/img/icons/info.svg"
                alt="trash"
              />
            </Tooltip>
          ) : null}
        </div>
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
          type={type}
          limit={row.catalog.isServiceType ? -1 : row.quantity}
          handleQuantityChange={handleQuantityChange}
        />
      ),
    },
    {
      title: 'Anbardakı miqdar',
      dataIndex: 'quantity',
      width: 150,
      align: 'center',
      render: (value, { catalog: { isServiceType }, unitOfMeasurementName }) =>
        isServiceType
          ? `-`
          : `${formatNumberToLocale(defaultNumberFormat(value))} ${
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
        if (getFieldValue('stockFrom')) {
          fetchSalesBarcodesByName({
            label: 'fetchProductsListByBarcode',
            stockId: getFieldValue('stockFrom'),
            filters: {
              q: sCode,
              datetime: getFieldValue('date').format(fullDateTimeWithSecond),
            },
            onSuccessCallback: ({ data }) => {
              if (data && data.length !== 0) {
                fetchSalesPrices({
                  label: 'fetchSalesPricesByName',
                  filters: {
                    currency: getFieldValue('currency'),
                    products: [data.id],
                    businessUnitIds: id
                      ? invoiceInfo?.businessUnitId === null
                        ? [0]
                        : [invoiceInfo?.businessUnitId]
                      : cookies.get('_TKN_UNIT_')
                      ? [cookies.get('_TKN_UNIT_')]
                      : undefined,
                  },
                  onSuccessCallback: ({ data: priceTypes }) => {
                    const hasProduct = selectedProducts?.find(
                      product => product.id === data.id
                    );
                    const invoicePrice = priceTypes[data.id].default
                      .convertedAmount
                      ? Number(priceTypes[data.id].default.convertedAmount)
                      : undefined;
                    const productsWithPrices = {
                      ...data,
                      invoiceQuantity: data?.catalog?.isWithoutSerialNumber
                        ? 1
                        : null,
                      prices: priceTypes[data.id],
                      invoicePrice,
                    };
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
                    } else {
                      dispatch(
                        setSelectedProducts({
                          newSelectedProducts: [
                            ...selectedProducts,
                            productsWithPrices,
                          ],
                        })
                      );
                    }
                  },
                });
              }
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

  // Invoice list modal click
  const handleModalClick = row => {
    setSelectedRow(row);
    if (row.catalog.isWithoutSerialNumber) {
      toggleInvoiceModalWithoutSN();
    } else {
      toggleInvoiceModalWithSN();
    }
  };

  // Remove product from invoice
  const handleProductRemove = productId => {
    const newSelectedProducts = selectedProducts.filter(
      selectedProduct => selectedProduct.id !== productId
    );
    dispatch(setSelectedProducts({ newSelectedProducts }));
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
          fetchSalesProductsByName({
            label: 'fetchProductsListByName',
            stockId: getFieldValue('stockFrom'),
            onSuccessCallback: ({ data }) => {
              fetchSalesPrices({
                label: 'fetchSalesPricesByName',
                filters: {
                  currency: getFieldValue('currency'),
                  products: data.map(product => product.id),
                  businessUnitIds: id
                    ? invoiceInfo?.businessUnitId === null
                      ? [0]
                      : [invoiceInfo?.businessUnitId]
                    : cookies.get('_TKN_UNIT_')
                    ? [cookies.get('_TKN_UNIT_')]
                    : undefined,
                },
                onSuccessCallback: ({ data: priceTypes }) => {
                  const productsWithPrices = data.map(product => {
                    const invoicePrice = priceTypes[product.id].default
                      .convertedAmount
                      ? Number(priceTypes[product.id].default.convertedAmount)
                      : undefined;

                    return {
                      ...product,
                      prices: priceTypes[product.id],
                      invoicePrice,
                    };
                  });
                  dispatch(
                    setProductsByName({
                      data: productsWithPrices,
                    })
                  );
                },
              });
            },
            filters: {
              q: productName,
              datetime: getFieldValue('date').format(fullDateTimeWithSecond),
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
    fetchSalesBarcodesByName({
      label: 'fetchProductsListByBarcode',
      filters: {
        q: productBarcode,
        datetime: getFieldValue('date').format(fullDateTimeWithSecond),
      },
      stockId: getFieldValue('stockFrom'),
      onSuccessCallback: ({ data }) => {
        if (data && data.length !== 0) {
          fetchSalesPrices({
            label: 'fetchSalesPricesByName',
            filters: {
              currency: getFieldValue('currency'),
              products: [data.id],
              businessUnitIds: id
                ? invoiceInfo?.businessUnitId === null
                  ? [0]
                  : [invoiceInfo?.businessUnitId]
                : cookies.get('_TKN_UNIT_')
                ? [cookies.get('_TKN_UNIT_')]
                : undefined,
            },
            onSuccessCallback: ({ data: priceTypes }) => {
              const hasProduct = selectedProducts?.find(
                product => product.id === data.id
              );
              const invoicePrice = priceTypes[data.id].default.convertedAmount
                ? Number(priceTypes[data.id].default.convertedAmount)
                : undefined;
              const productsWithPrices = {
                ...data,
                invoiceQuantity: data?.catalog?.isWithoutSerialNumber
                  ? 1
                  : null,
                prices: priceTypes[data.id],
                invoicePrice,
              };
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
              } else {
                dispatch(
                  setSelectedProducts({
                    newSelectedProducts: [
                      ...selectedProducts,
                      productsWithPrices,
                    ],
                  })
                );
              }
            },
          });
        }
        setBarcodeInput(null);
      },
    });
  };

  // Fetch Product Invoices by product Id
  const fetchProductInvoices = (productId, onSuccessCallback) => {
    fetchSalesInvoicesByProduct({
      label: 'fetchInvoicesByProduct',
      filters:
        id || !isDraft
          ? {
              invoiceId: id,
              datetime: getFieldValue('date').format(fullDateTimeWithSecond),
            }
          : {
              datetime: getFieldValue('date').format(fullDateTimeWithSecond),
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
      fetchSalesCatalogs({ 
        filters: {...defaultFilters, datetime },
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
    fetchSalesProductsFromCatalog({
      label: 'fetchProductsFromCatalog',
      stockId: getFieldValue('stockFrom'),
      filters: {
        catalog: catalogId || selectedCatalog,
        datetime: getFieldValue('date').format(fullDateTimeWithSecond),
        ...defaultFilters
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
    fetchSalesProductsFromCatalog({
      label: 'fetchProductsFromCatalog',
      stockId: getFieldValue('stockFrom'),
      filters: {
        catalog: catalogId,
        datetime: getFieldValue('date').format(fullDateTimeWithSecond),
      },
    });
  };

  // Manipulate selected products to api required form.
  const handleSelectedProducts = selectedProducts => {
    const tmp = {};
    selectedProducts.forEach(
      ({ invoicePrice, invoiceProducts, id, invoiceQuantity, serialNumbers }) => {
        tmp[id] = {
          product: id,
          price: Number(invoicePrice),
          quantity: Number(invoiceQuantity),
          serialNumber_ul: serialNumbers || [],
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

  // Validate selected products (contract, quantity and price)
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
      math.sub(Number(endPrice || 0), Number(contractBalance || 0)) > 0
    ) {
      errorMessage = 'Müqavilə limiti aşıla bilməz.';
      isValid = false;
    }
    return {
      isValid,
      errorMessage,
    };
  };

  // handle new sales invoice
  const handleSalesInvoice = () => {
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

  // create new sales invoice
  const handleCreateInvoice = values => {
    const {
      date,
      currency,
      client,
      salesman,
      contract,
      agent,
      stockFrom,
    } = values;

    const newSalesInvoice = {
      agent: agent || null,
      salesman,
      currency,
      client,
      stock: stockFrom,
      description: description || null,
      operationDate: date.format(fullDateTimeWithSecond),
      operator: profile.id,
      taxCurrency: currency || null,
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
              type: 'sales',
              onSuccessCallback: ({ data }) => {
                const { id } = data;
                if (activePayments.length > 0) {
                  handleInvoicePayment(values, Number(id));
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
          data: newSalesInvoice,
          type: 'sales',
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
            if (error?.response?.data?.error?.errors?.key === "wrong_end_price") {
              return toast.error(
                `Son qiymət ${roundToDown(
                  error?.response?.data?.error?.errors?.paidAmount
              )} ${invoiceCurrencyCode} məbləğindən az ola bilməz.`,
                { autoClose: 8000 }
              );
            }
            if (error?.response?.data?.error?.message === "Wrong tax amount") {
              return toast.error(
                `ƏDV ${Number(invoiceInfo.paidTaxAmount || 0)} ${invoiceCurrencyCode} məbləğindən az ola bilməz.`,
                { autoClose: 8000 }
              );
            }
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
          },
        });
      }
    } else {
      createInvoice({
        data: newSalesInvoice,
        type: 'sales',
        onSuccessCallback: ({ data }) => {
          const { id } = data;
          if (activePayments.length > 0) {
            handleInvoicePayment(values, Number(id));
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

  // handle invoice payment
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
      type: 1,
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
        handleVatPayment(values, invoiceId);
      } else {
        toast.success('Məlumatlar yadda saxlanıldı.');
        history.goBack();
      }
    });
  };

  // handle vat payment
  const handleVatPayment = (values, invoiceId) => {
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
      type: 1,
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

  // Handle sales draft invoice
  const handleSalesDraftInvoice = () => {
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
    const {
      date,
      agent,
      currency,
      client,
      salesman,
      contract,
      stockFrom,
    } = values;

    const newDraftSalesInvoice = {
      agent: agent || undefined,
      salesman,
      currency,
      client,
      draftType: 2,
      stock: stockFrom,
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
        data: newDraftSalesInvoice,
        type: 'draft',
        id: Number(id),
        onSuccessCallback: () => {
          toast.success(messages.successText);
          history.goBack();
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

  // Update invoice with invoice values
  const updateEditInvoice = (selectedContract, isDraft) => {
    const {
      clientId,
      salesmanId,
      operationDate,
      currencyId,
      contractId,
      agentId,
      endPrice,
      taxCurrencyCode,
      stockFromId,
      invoiceProducts,
      currencyCode,
      amount,
      discountAmount,
      description,
      taxAmount,
      businessUnitId,
    } = invoiceInfo;
    const { content } = invoiceProducts;
    const selectedProductIds = content.map(({ productId }) => productId);
    const selectedProducts = {};
    fetchSalesProductsFromCatalog({
      label: 'fetchEditProductsFromCatalog',
      setState: false,
      stockId: stockFromId,
      filters: {
        invoiceId: id,
        product: selectedProductIds,
        datetime: operationDate,
      },
      onSuccessCallback: ({ data: totalQuantities }) => {
        fetchSalesPrices({
          filters: {
            currency: currencyId,
            products: selectedProductIds,
            businessUnitIds: businessUnitId === null ? [0] : [businessUnitId],
          },
          onSuccessCallback: ({ data: priceTypes }) => {
            content.forEach(
              ({
                productId,
                productName,
                quantity,
                pricePerUnit,
                serialNumber,
                unitOfMeasurementName,
                draftRootInvoiceProductId,
                attachedInvoiceProductId,
                catalogId,
                isServiceType,
                catalogName,
                usedQuantity
              }) => {
                if (selectedProducts[productId]) {
                  selectedProducts[productId] = {
                    ...selectedProducts[productId],
                    serialNumbers: serialNumber
                      ? [
                          ...selectedProducts[productId].serialNumbers,
                          serialNumber,
                        ]
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
                  const productDetails = totalQuantities.find(
                    product => product.id === productId
                  );
                  selectedProducts[productId] = {
                    id: productId,
                    name: productName,
                    barcode: undefined,
                    serialNumbers: serialNumber ? [serialNumber] : undefined,
                    invoiceQuantity: roundToDown(quantity),
                    unitOfMeasurementName,
                    prices: priceTypes[productId],
                    invoicePrice: roundToDown(pricePerUnit),
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
      },
    });

    setFieldsValue({
      date: moment(operationDate, fullDateTimeWithSecond),
      client: clientId || undefined,
      salesman: salesmanId || undefined,
      contract: contractId || undefined,
      currency: currencyId,
      agent: agentId || undefined,
      stockFrom: stockFromId,
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
    setDatetime(getFieldValue('date')?.format(fullDateTimeWithSecond));
  }, [getFieldValue('date')]);

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
          directions: [2],
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
        directions: [2],
        businessUnitIds: [cookies.get('_TKN_UNIT_')],
      });
    } else {
      fetchStocks({ limit: 1000 });
      fetchContracts({ limit: 1000, status: 1, directions: [2] });
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
      <InvoiceModalWithSN
        product={selectedRow}
        isVisible={invoiceModalWithSN}
        fetchProductInvoices={fetchProductInvoices}
        toggleModal={toggleInvoiceModalWithSN}
        type={type}
      />
      <InvoiceModalWithoutSN
        product={selectedRow}
        isVisible={invoiceModalWithoutSN}
        toggleModal={toggleInvoiceModalWithoutSN}
        fetchProductInvoices={fetchProductInvoices}
        type={type}
      />
      <AddFromCatalog
        id={id}
        invoiceInfo={invoiceInfo}
        type="sales"
        form={form}
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
        <GeneralInformation invoiceInfo={invoiceInfo} fields={Object.values(fields)} form={form} />
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
          handleProductNameChange={handleProductNameChange}
          handleProductBarcodeChange={handleProductBarcodeChange}
          handleChangeSearch={handleChangeSearch}
          setBarcodeInput={setBarcodeInput}
          barcodeInput={barcodeInput}
          handleNewInvoice={handleSalesInvoice}
          handleDraftInvoice={handleSalesDraftInvoice}
        />
        {activePayments.length > 0 ? (
          <Payment
            form={form}
            isDraft={isDraft}
            handleNewInvoice={handleSalesInvoice}
            handleDraftInvoice={handleSalesDraftInvoice}
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
  products: state.salesOperation.productsByName,
  profile: state.profileReducer.profile, // used for operator id
  activePayments: state.salesOperation.activePayments,
  contractDetails: state.salesOperation.contractDetails,
  invoiceCurrencyCode: state.salesOperation.invoiceCurrencyCode,
  productsListByNameLoading: state.loadings.fetchSalesProductsByName,
  selectedProducts: state.salesOperation.selectedProducts,
  currencies: state.kassaReducer.currencies,
  mainCurrency: state.kassaReducer.mainCurrency,
  totalPrice: state.salesOperation.totalPrice,
  invoicePaymentDetails: state.salesOperation.invoicePaymentDetails,
  vatPaymentDetails: state.salesOperation.vatPaymentDetails,
});

export const Sales = Form.create({
  name: 'SalesForm',
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
      setSelectedProducts,
      setProductsByName,
      fetchSalesProductsByName,
      fetchSalesBarcodesByName,
      fetchSalesCatalogs,
      fetchSalesProductsFromCatalog,
      fetchSalesInvoicesByProduct,
      handleResetInvoiceFields,
      fetchSalesPrices,
      clearProductsByName,
      handleQuantityChange,
      handlePriceChange,
      createOperationInvoice,
      handleEditInvoice,
      editInvoice,
      updateInvoiceCurrencyCode,
      fetchMainCurrency,
      deleteInvoice,
    }
  )(SalesOperation)
);
