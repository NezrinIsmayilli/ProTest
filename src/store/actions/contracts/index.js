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
 * @param {Date} signedAt - İmzalanan tarix
 * @param {String} contractNo - Müqavilə №
 * @param {Number} contractType - Müqavilə növünün id-si
 * @param {Date} startDate - Başlama tarixi
 * @param {Date} endDate - Bitmə tarixi
 * @param {Number} responsiblePerson - Məsul icraçının id-si
 * @param {Number} amount - Müqavilə məbləği
 * @param {Number} currency - Valyutanın id-si
 * @param {[Object]} documents_ul - Sənədlər
 * @param {String} name - Sənəd adı
 * @param {String} number - Sənəd №
 * @param {Date} documentDate - Sənəd tarixi
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
