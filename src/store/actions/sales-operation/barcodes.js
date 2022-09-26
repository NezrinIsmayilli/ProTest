import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setSearchedBarcodes = createAction('setSearchedBarcodes');

const invoiceTypes = {
  draft: 'draft',
  purchase: 'purchase',
  sales: 'sales',
  returnFromCustomer: 'returnFromCustomer',
  returnToSupplier: 'returnToSupplier',
  transfer: 'transfer',
  writingOff: 'remove',
};

export const fetchBarcodesByName = props => {
  const {
    type = 'purchase',
    label = 'fetchBarcodesByName',
    filters,
    onSuccessCallback,
    onFailureCallback,
  } = props;
  const query = filterQueryResolver(filters);

  return apiAction({
    label,
    url: `/sales/invoices/${invoiceTypes[type]}/search/barcode?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setSearchedBarcodes(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
};
