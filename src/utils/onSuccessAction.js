import { toast } from 'react-toastify';
import { history } from './history';

export const onSuccessAction = (
  msg = 'Məlumatlar yadda saxlandı',
  goBack = true
) =>
  toast.success(msg, {
    className: 'success-toast',
    onOpen: goBack && history.goBack,
  });
