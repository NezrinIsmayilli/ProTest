import { toast } from 'react-toastify';
import { messages } from './messages';

export function toastHelper(history, path, message = messages.successText) {
  return () =>
    toast.success(message, {
      className: 'success-toast',
      onOpen: history.replace(path),
    });
}
