import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { filterQueryResolver } from 'utils';

export const setContracts = createAction('setContracts');
export const setFilteredContracts = createAction('setFilteredContracts');
export const setContractInfo = createAction('setContractInfo');
export const contractsFilterHandle = createAction('contractsFilterHandle');
export const setActionResult = createAction('setActionResult');
export const setContractStatistics = createAction('setContractStatistics');
export const resetContracts = createAction('resetContracts');
export const setContractsCount = createAction('setContractsCount');
export const setContractDocuments = createAction('setContractDocuments');

export function fetchContracts(filters = {}, callback) {
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/sales/contracts?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setContracts(data));
      if (callback) callback(data);
    },
    label: 'fetchContracts',
  });
}

export function fetchFilteredContracts(filters = {}, callback) {
  const query = filterQueryResolver(filters);
  return apiAction({
    url: `/sales/contracts?${query}`,
    onSuccess: data => dispatch => {
      dispatch(setFilteredContracts(data));
      if (callback) callback(data);
    },
    label: 'fetchFilteredContracts',
  });
}

export function fetchContractDocuments(
  { id, attribute } = {},
  callback = () => {}
) {
  return apiAction({
    url: `/sales/contracts/attachments/${id}`,
    onSuccess: params => dispatch => {
      dispatch(setContractDocuments(params));
      callback(params);
    },
    attribute,
    label: 'contractDocumnets',
  });
}
export function fetchContractsCount(filters = {}, callback) {
  let query = filterQueryResolver(filters);

  return apiAction({
    url: `/sales/contracts/count?${query}`,
    onSuccess: params => dispatch => {
      dispatch(setContractsCount(params));
      if (callback) callback();
    },
    label: 'contracts',
  });
}

export function fetchContractStatistics({ id }) {
  return apiAction({
    url: `/sales/contracts/${id}/statistic`,
    onSuccess: setContractStatistics,
    attribute: id,
    label: 'contracts',
  });
}

/**
 * get one contract info
 * @param {Number} id - contract id
 */
export function fetchContract(id) {
  return apiAction({
    url: `/sales/contracts/${id}`,
    onSuccess: setContractInfo,
    attribute: id,
    label: 'contracts',
  });
}

/**
 * create contract
 * @param {Object} data - payload data
 * data content:
 * @param {Number} signatoryContact - in id-si
 * @param {Date} signedAt - ??mzalanan tarix
 * @param {String} contractNo - M??qavil?? ???
 * @param {Number} contractType - M??qavil?? n??v??n??n id-si
 * @param {Date} startDate - Ba??lama tarixi
 * @param {Date} endDate - Bitm?? tarixi
 * @param {Number} responsiblePerson - M??sul icra????n??n id-si
 * @param {Number} amount - M??qavil?? m??bl????i
 * @param {Number} currency - Valyutan??n id-si
 * @param {[Object]} documents_ul - S??n??dl??r
 * @param {String} name - S??n??d ad??
 * @param {String} number - S??n??d ???
 * @param {Date} documentDate - S??n??d tarixi
 * @param {Number} attachment - Fayl id-si
 */
export function createContract(data, callback, onFailure = () => {}) {
  return apiAction({
    url: '/sales/contracts',
    method: 'POST',
    onFailure,
    data: { ...data },
    onSuccess: callback,
    attribute: 'added',
    label: 'action',
  });
}

// EDIT
export function editContract(id, data, callback, onFailure) {
  return apiAction({
    url: `/sales/contracts/${id}`,
    method: 'PUT',
    data: { ...data, amount: +data.amount },
    onSuccess: callback,
    onFailure,
    attribute: 'edited',
    label: 'action',
  });
}

// DElete
export function deleteContract(id, onSuccess = fetchContract) {
  return apiAction({
    url: `/sales/contracts/${id}`,
    method: 'DELETE',
    onSuccess,
    showToast: true,
    attribute: id,
    label: 'contracts',
  });
}
