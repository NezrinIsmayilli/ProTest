import { apiAction } from 'store/actions';

const invoiceTypes = {
  draft: 'draft',
  purchase: 'purchase',
  sales: 'sales',
  returnFromCustomer: 'returnFromCustomer',
  returnToSupplier: 'returnToSupplier',
  transfer: 'transfer',
  writingOff: 'remove',
  production: 'materials',
};

// Create invoice
export const createCompositon = props => {
  const {
    data,
    id,
    type = 'draft',
    onSuccessCallback,
    onFailureCallback,
    label = 'createInvoiceOperation',
  } = props;

  return apiAction({
    data,
    label,
    url: `/sales/products/materials/${id}`,
    method: 'POST',
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
};

export const editCompositon = props => {
  const {
    id,
    data,
    type = 'draft',
    onSuccessCallback,
    onFailureCallback,
    label = 'editInvoiceOperation',
  } = props;

  return apiAction({
    data,
    label,
    method: 'POST',
    url: `/sales/products/materials/${id}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
};

// Delete invoice (all invoice types)
export function deleteCompositon(props = {}) {
  const {
    id,
    onSuccessCallback,
    onFailureCallback,
    label = 'deleteCompositon',
  } = props;
  return apiAction({
    label,
    method: 'DELETE',
    url: `/sales/products/${id}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
  });
}
