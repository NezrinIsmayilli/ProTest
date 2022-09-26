import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setOrders = createAction('setOrders');
export const setSelectedOrder = createAction('setSelectedOrder');
export const setContentItems = createAction('setContentItems');
export const setSentItems = createAction('setSentItems');
export const setAcceptedItems = createAction('setAcceptedItems');
export const setStages = createAction('setStages');
export const setOrdersTotal = createAction('setOrdersTotal');
export const clearOrders = createAction('clearOrders');
export const clearSelectedOrder = createAction('clearSelectedOrder');
export const setCountsGroupedByDirection = createAction(
  'setCountsGroupedByDirection'
);

export const fetchOrders = (filters, onSucessCallback, fetchCount = true) => {
  const query = filterQueryResolver(filters);
  const url = `/orders?${query}`;
  return apiAction({
    url,
    label: 'orders',
    onSuccess: data => dispatch => {
      if (onSucessCallback) {
        onSucessCallback(data);
      }
      if (fetchCount) {
        dispatch(getTotalCount({ query }));
      }
      dispatch(setOrders(data));
    },
    attribute: {},
  });
};

export function getTotalCount({ query }) {
  const url = `/orders/count?${query}`;
  return apiAction({
    url,
    label: 'orders',
    onSuccess: setOrdersTotal,
    attribute: {},
  });
}

export function fetchStages() {
  const url = `/orders/count-grouped-by-stage`;
  return apiAction({
    url,
    label: 'orders',
    onSuccess: data => dispatch => {
      dispatch(setStages(data));
    },
    attribute: {},
  });
}

export function fetchCountsGroupedByDirection() {
  const url = `/orders/count-grouped-by-direction`;
  return apiAction({
    url,
    label: 'counts-grouped-by-direction',
    onSuccess: data => dispatch => {
      dispatch(setCountsGroupedByDirection(data));
    },
    attribute: {},
  });
}

export function createOrder(data, callback) {
  return apiAction({
    url: '/orders',
    method: 'POST',
    onSuccess: callback,
    data,
    label: data.isDraft ? 'createDraftOrder' : 'createOrder',
  });
}
export function deleteOrder(id, onSuccessCallback = () => {}) {
  return apiAction({
    url: `/orders/${id}`,
    method: 'DELETE',
    onSuccess: onSuccessCallback,
    label: 'deleteOrder',
  });
}

export function updateOrder(id, data, callback) {
  return apiAction({
    url: `/orders/items/${id}`,
    method: 'PUT',
    onSuccess: callback,
    showToast: true,
    data,
    label: 'ordersActions',
  });
}

export function changeStage(stage, id, data, callback) {
  return apiAction({
    url: `/orders/stage/${stage}/${id}`,
    method: 'PUT',
    onSuccess: () => dispatch => {
      callback();
    },
    data,
    label: 'orders',
  });
}

export function updateDescription(id, data, callback) {
  return apiAction({
    url: `/orders/${id}`,
    method: 'PUT',
    onSuccess: callback,
    showToast: true,
    data,
    label: 'orders',
  });
}

export function updateDeliveryDetails(id, data, callback) {
  return apiAction({
    url: `/orders/delivery/${id}`,
    method: 'PUT',
    onSuccess: callback,
    showToast: true,
    data,
    label: 'updateDeliveryDetails',
  });
}

export function createMessage(data, callback) {
  return apiAction({
    url: `/orders/messages`,
    method: 'POST',
    onSuccess: callback,
    data,
    label: 'addMessage',
  });
}

export function updateHistory(id, data, callback) {
  return apiAction({
    url: `/orders/history/${id}`,
    method: 'PUT',
    onSuccess: callback,
    data,
    label: 'orders',
  });
}
