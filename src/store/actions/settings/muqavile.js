import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { ErrorMessage } from 'utils';
import { toast } from 'react-toastify';

export const setContractTypes = createAction('setContractTypes');

export function fetchContractTypes() {
  return apiAction({
    url: '/sales/contract/contractTypes',
    onSuccess: setContractTypes,
    label: 'contractTypes',
  });
}

export function createContractTypes(index, name) {
  return apiAction({
    url: '/sales/contract/contractTypes',
    method: 'POST',
    data: { name },
    onSuccess: fetchContractTypes,
    onFailure: error => () => {
      const message = ErrorMessage(error);
      toast.error(message);
    },
    showErrorToast: false,
    showToast: true,
    label: 'contractTypes',
  });
}

export function editContractTypes(id, name) {
  return apiAction({
    url: `/sales/contract/contractTypes/${id}`,
    method: 'PUT',
    data: { name },
    onSuccess: fetchContractTypes,
    onFailure: error => () => {
      const message = ErrorMessage(error);
      toast.error(message);
    },
    showErrorToast: false,
    showToast: true,
    label: 'contractTypes',
  });
}

export function deleteContractTypes(id) {
  return apiAction({
    url: `/sales/contract/contractTypes/${id}`,
    method: 'DELETE',
    onSuccess: fetchContractTypes,
    showToast: true,
    label: 'contractTypes',
  });
}
