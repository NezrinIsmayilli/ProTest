import { createAction } from 'redux-starter-kit';

const re_amount = /^[0-9]{0,12}\.?[0-9]{0,4}$/;

export const setInvoicePaymentDetails = createAction(
    'sales/setInvoicePaymentDetails'
);
export const updateDetails = createAction('sales/updateDetails');
export const clearReducer = createAction('sales/clearInvoiceOperation');
export const setVatPaymentDetails = createAction('sales/setVatPaymentDetails');
export const setActivePayments = createAction('sales/setActivePayments');
export const setVat = createAction('sales/setVat');
export const setDiscount = createAction('sales/setDiscount');
export const setTotalPrice = createAction('sales/setTotalPrice');
export const setEndPrice = createAction('sales/setEndPrice');
export const setContractDetails = createAction('sales/contractDetails');
export const setInvoiceCurrencyCode = createAction('sales/invoiceCurrencyCode');
export const setVatCurrencyCode = createAction('sales/vatCurrencyCode');
export const setSelectedProducts = createAction('sales/setSelectedProducts');
export const setSelectedImportProducts = createAction(
    'sales/setSelectedImportProducts'
);
export const setExpenses = createAction('sales/setExpenses');
export const setProductPrice = createAction('sales/setProductPrice');
export const setDescription = createAction('sales/setDescription');
export const setProductQuantity = createAction('sales/setProductQuantity');
export const setProductSerialNumbers = createAction(
    'sales/setProductSerialNumbers'
);
export const setExpenseDirection = createAction('sales/setExpenseDirection');
export const setExpenseCurrency = createAction('sales/setExpenseCurrency');
export const setExpenseCashboxType = createAction(
    'sales/setExpenseCashboxType'
);
export const setExpenseCashbox = createAction('sales/setExpenseCashbox');
export const setEmployee = createAction('sales/setEmployee');
export const setCounterparty = createAction('sales/setCounterparty');
export const setInvoiceExpenseRate = createAction(
    'sales/setInvoiceExpenseRate'
);
export const setExpenseError = createAction('sales/setExpenseError');
export const setProductPlannedPrice = createAction(
    'sales/setProductPlannedPrice'
);
export const setProductPlannedCost = createAction(
    'sales/setProductPlannedCost'
);
export const setSelectedProductionExpense = createAction(
    'sales/setSelectedProductionExpense'
);
export const setSelectedProductionEmployeeExpense = createAction(
    'sales/setSelectedProductionEmployeeExpense'
);
export const setSelectedProductionMaterial = createAction(
    'sales/setSelectedProductionMaterial'
);
export const setTotalCost = createAction('sales/setTotalCost');

export const updateContractDetails = contractDetails => dispatch => {
    if (contractDetails) {
        dispatch(setContractDetails(contractDetails));
    } else {
        dispatch(
            setContractDetails({
                isContractSelected: false,
                contractAmount: undefined,
                contractBalance: undefined,
            })
        );
    }
};

export const updateInvoiceCurrencyCode = currencyCode => dispatch => {
    dispatch(setInvoiceCurrencyCode(currencyCode));
};

export const handleQuantityChange = (
    productId,
    newQuantity,
    quantity
) => dispatch => {
    const limit = Number(quantity) > 0 ? Number(quantity) : 10000000000;
    if (re_amount.test(Number(newQuantity)) && newQuantity <= limit) {
        dispatch(setProductQuantity({ productId, newQuantity }));
    }
    if (newQuantity === '') {
        dispatch(setProductQuantity({ productId, undefined }));
    }
};

export const handlePriceChange = (
    productId,
    newPrice,
    limit = 100000000
) => dispatch => {
    if (re_amount.test(newPrice) && newPrice <= limit) {
        dispatch(setProductPrice({ productId, newPrice }));
    }
    if (newPrice === '') {
        dispatch(setProductPrice({ productId, undefined }));
    }
};

export const updatePaymentDetails = (newDetails, type) => dispatch => {
    if (type === 'invoice') {
        dispatch(setInvoicePaymentDetails({ newDetails }));
    } else {
        dispatch(setVatPaymentDetails({ newDetails }));
    }
};

export const handleEditInvoice = invoiceDetails => dispatch => {
    dispatch(updateDetails({ invoiceDetails }));
};

export const handleResetInvoiceFields = () => dispatch => {
    dispatch(clearReducer());
};

export const handlePlannedPriceChange = (
    productId,
    newPlannedPrice,
    limit = 100000000
) => dispatch => {
    const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;
    if (re.test(newPlannedPrice) && newPlannedPrice <= limit) {
        dispatch(setProductPlannedPrice({ productId, newPlannedPrice }));
    }
    if (newPlannedPrice === '') {
        dispatch(setProductPlannedPrice({ productId, undefined }));
    }
};
export const handlePlannedCostChange = (
    productId,
    newCost,
    limit = 100000000
) => dispatch => {
    const re = /^[0-9]{1,9}\.?[0-9]{0,2}$/;
    if (re.test(newCost) && newCost <= limit) {
        dispatch(setProductPlannedCost({ productId, newCost }));
    }
    if (newCost === '') {
        dispatch(setProductPlannedCost({ productId, undefined }));
    }
};
