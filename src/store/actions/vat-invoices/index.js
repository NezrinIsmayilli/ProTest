import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setVatInvoices = createAction('setVatInvoices');
export const setVatOperations = createAction('setVatOperations');
export const setFinOperations = createAction('setFinOperations');
export const setInvoiceContent = createAction('setInvoiceContent');
export const setVatInvoicesCount = createAction('setVatInvoicesCount');

export const fetchVatInvoices = (filters) => {
  let query = filterQueryResolver({ ...filters, type: undefined });
  if (query.startsWith('&')) query = query.substring(1);

  return apiAction({
    url: `/transaction/report/${filters.type}?${query}`,
    onSuccess: setVatInvoices,
    label: 'vat-invoices',
  });
};

export const fetchVatInvoicesCount = (filters) => {
  let query = filterQueryResolver({ ...filters, type: undefined });
  if (query.startsWith('&')) query = query.substring(1);

  return apiAction({
    url: `/transaction/report/${filters.type}/count?${query}`,
    onSuccess: setVatInvoicesCount,
    label: 'vat-invoices',
  });
};

export const fetchVatOperations = ({ filters }) => {
  let query = filterQueryResolver(filters);
  if (query.startsWith('&')) query = query.substring(1);

  return apiAction({
    url: `/sales/invoices?${query}`,
    onSuccess: setVatOperations,
    label: 'vat-invoices',
  });
};

export const fetchFinOperations = ({ filters }) => {
  let query = filterQueryResolver(filters);
  if (query.startsWith('&')) query = query.substring(1);

  return apiAction({
    url: `/transactions?${query}`,
    onSuccess: setFinOperations,
    label: 'fin-invoices',
  });
};

export const fetchInvoiceContent = id =>
  apiAction({
    url: `/sales/invoices/invoice/${id}`,
    onSuccess: setInvoiceContent,
    label: 'content-invoices',
  });
