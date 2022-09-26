import axios from 'axios';
import { toast } from 'react-toastify';
import { apiStart, apiEnd } from 'store/actions/api';
import { apiErrorMessageResolver } from 'utils';

export const exportFileDownloadHandle = (
  label,
  url,
  type = 'application/vnd.ms-excel',
  fileName = 'report.xlsx'
) => async dispatch => {
  console.log(url);
  try {
    dispatch(apiStart(label));

    const data = await axios.get(url, {
      responseType: 'arraybuffer',
    });
    const link = document.createElement('a');
    link.id = label;
    const file = new Blob([data.data], { type });
    const fileURL = URL.createObjectURL(file);
    link.href = fileURL;
    link.download = fileName;
    link.click();
  } catch (error) {
    const errorMessage = apiErrorMessageResolver(error);

    toast.error(errorMessage);
  } finally {
    dispatch(apiEnd(label));
  }
};
