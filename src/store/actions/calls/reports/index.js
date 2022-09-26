import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setOperatorReports = createAction('setOperatorReports');
export const setSupervisorReports = createAction('setSupervisorReports');

export const setStatusHistoryReports = createAction('setStatusHistoryReports');
export const setStatusHistoryCount = createAction('setStatusHistoryCount');
export const setOperators = createAction('setOperators');

export const setMainIndicatorsReport = createAction('setMainIndicatorsReport');
export const setCalls = createAction('setCalls');
export const setCallsInternal = createAction('setCallsInternal');
export const setCallInternalCount = createAction('setCallInternalCount');
export const setCallCount = createAction('setCallCount');

const url =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL_PROCALL
    : process.env.REACT_APP_DEV_API_URL_PROCALL;
export function fetchOperatorReports(props = {}) {
  const {
    filters,
    onSuccessCallback,
    onFailureCallback,
    label = 'fetchOperatorReports',
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `${url}/reports/operator-statistics?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setOperatorReports(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label,
  });
}
export function fetchSupervisorReports(props = {}) {
  const {
    onSuccessCallback,
    onFailureCallback,
    label = 'fetchSupervisorReports',
  } = props;
  return apiAction({
    url: `${url}/reports/supervisor-panel`,
    onSuccess: data => dispatch => {
      dispatch(setSupervisorReports(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label,
  });
}
export function fetchLoginTime(props = {}) {
  const { filters, onSuccessCallback, onFailureCallback } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/tenant-person-activity?${query}`,
    onSuccess: data => dispatch => {
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchLoginTime',
  });
}
// export function fetchSelectedOperatorReport(props = {}) {
//   const { id, onSuccessCallback, onFailureCallback } = props;

//   return apiAction({
//     url: `${url}/calls/${id}`,
//     onSuccess: data => dispatch => {
//       dispatch(setSelectedCall(data));
//       if (onSuccessCallback) dispatch(onSuccessCallback(data));
//     },
//     onFailure: error => dispatch => {
//       if (onFailureCallback) dispatch(onFailureCallback(error));
//     },
//     label: 'selectedCall',
//   });
// }

// Status History
export function fetchStatusHistoryReports(props = {}) {
  const {
    filters,
    onSuccessCallback,
    onFailureCallback,
    label = 'fetchStatusHistoryReports',
  } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `${url}/statuses?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setStatusHistoryReports(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label,
  });
}

export function getStatusHistoryCount(props = {}) {
  const { filters, onSuccess } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `${url}/statuses/count?${query}`,
    label: 'call',
    onSuccess: data => dispatch => {
      if (onSuccess !== undefined) {
        onSuccess(data);
      } else {
        dispatch(setStatusHistoryCount(data?.data?.count));
      }
    },
    attribute: {},
  });
}

export function fetchOperators(props = {}) {
  const { filters, onSuccessCallback, onFailureCallback } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `${url}/statuses/operators?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setOperators(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchOperators',
  });
}

// Main-indicators

export const fetchProfitByMonth = (props = {}) => {
  const { filters, onSuccessCallback, onFailureCallback } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `${url}/reports/main-factors?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setMainIndicatorsReport(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchProfitByMonth',
  });
};

export function fetchCalls(props = {}) {
  const { filters, onSuccessCallback, onFailureCallback } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `${url}/calls/customers?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setCalls(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchCalls',
  });
}

export function fetchCallsCount(props = {}) {
  const { filters, onSuccess } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `${url}/calls/customers/count?${query}`,
    label: 'fetchCalls',
    onSuccess: data => dispatch => {
      if (onSuccess !== undefined) {
        onSuccess(data);
      } else {
        dispatch(setCallCount(data?.data?.count));
      }
    },
    attribute: {},
  });
}

export function fetchCallsInternal(props = {}) {
  const { filters, onSuccessCallback, onFailureCallback } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `${url}/calls?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setCallsInternal(data));
      if (onSuccessCallback) dispatch(onSuccessCallback(data));
    },
    onFailure: error => dispatch => {
      if (onFailureCallback) dispatch(onFailureCallback(error));
    },
    label: 'fetchCalls',
  });
}

export function getTotalCallInternalCount(props = {}) {
  const { filters, onSuccess } = props;
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `${url}/calls/count?${query}`,
    label: 'fetchCalls',
    onSuccess: data => dispatch => {
      if (onSuccess !== undefined) {
        onSuccess(data);
      } else {
        dispatch(setCallInternalCount(data?.data?.count));
      }
    },
    attribute: {},
  });
}