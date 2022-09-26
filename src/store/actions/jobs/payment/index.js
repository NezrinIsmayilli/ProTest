// import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';

export const createPayment = (cardType, callback) => {
  return apiAction({
    url: '/jobs/pay',
    data: { cardType },
    onSuccess: params => () => {
      callback(params.data);
    },
    label: 'createPayment',
  });
};
