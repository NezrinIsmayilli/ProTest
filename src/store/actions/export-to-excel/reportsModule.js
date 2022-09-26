import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setAllSalesReports = createAction('setAllSalesReports');
export const setAllDebtsTurnovers= createAction('setAllDebtsTurnovers');


export const fetchAllSalesReports = ({
  filters,
  onSuccessCallback}
) => {
  const query = filterQueryResolver(filters);
  const url = `/sales/invoices/${filters.type}?${query}`;
  return apiAction({
    url,
    onSuccess:  data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));},
    label: 'all-salesReports',
  });
};

export const fetchAllDebtsTurnovers = (
  {filters,
    debtType,
  onSuccessCallback}
) => {
  const query = filterQueryResolver(filters);
  const url = `/transaction/report/${debtType}?${query}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));},
    label: 'all-debts-turnovers',
  });
};

export const fetchAllProfitByMonth = (props = {}) => {
  const { filters, onSuccessCallback, onFailureCallback } = props;
  const query = filterQueryResolver(filters);
  const url = `/transaction/report/profit-and-loss?${query}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchAllProfitByMonth',
  });
};

export const fetchAllProfitByQuarter = (props = {}) => {
  const { filters, onSuccessCallback, onFailureCallback } = props;
  const query = filterQueryResolver(filters);
  const url = `/transaction/report/profit-and-loss?${query}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchAllProfitByQuarter',
  });
};


export const fetchAllProfitByYear = (props = {}) => {
  const { filters, onSuccessCallback, onFailureCallback } = props;
  const query = filterQueryResolver(filters);
  const url = `/transaction/report/profit-and-loss?${query}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchAllProfitByYear',
  });
};

export const getAllBalanceSheet = (props = {}) => {
  const {
    filters,
    onSuccessCallback,
    onFailureCallback,
    label = 'All-balance-sheet',
  } = props;
  const query = filterQueryResolver(filters);
  const url = `/transaction/report/balance-sheet?${query}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label,
  });
};

export const fetchAllProfitContracts = (props = {}) => {
  const { filters, onSuccessCallback, onFailureCallback } = props;
  const query = filterQueryResolver(filters);
  const url = `/sales/contracts/profit-centers?${query}`;
  return apiAction({
    url,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchAllProfitContracts',
  });
};