import { apiAction } from 'store/actions';
import { toast } from 'react-toastify';

export function operationsDelete(
  { password },
  onSuccessCallback = () => {},
  onFailureCallback = () => {}
) {
  return apiAction({
    url: '/system/data-deletion',
    method: 'POST',
    data: { password },
    onSuccess: data => dispatch => {
      dispatch(onSuccessCallback(data));
    },
    onFailure: data => dispatch => {
      dispatch(onFailureCallback(data));
      if (data.error.response.data.error.message === 'Səhv şifrə.') {
        toast.error('Daxil edilən şifrə yanlışdır.');
      }
    },

    showToast: false,
    showErrorToast: false,
    label: 'operationsDelete',
  });
}
