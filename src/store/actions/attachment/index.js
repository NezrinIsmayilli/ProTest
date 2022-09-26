// speacial api handle for attachment api - api -> :(
import axios from 'axios';
import { createAction } from 'redux-starter-kit';
import { apiAction } from 'store/actions';
import { toast } from 'react-toastify';
import { apiStart, apiEnd } from 'store/actions/api';
import { apiErrorMessageResolver } from 'utils';

export const setFileUrl = createAction('setFileUrl');
export const setThumbFileUrl = createAction('setThumbFileUrl');
export const setUploadedFileInfo = createAction('setUploadedFileInfo');

const label = 'attachment';

// to do
export function uploadAttachment(formData, onSuccessCallback = () => {}) {
  return apiAction({
    url: `/attachments`,
    method: 'POST',
    data: formData,
    onSuccess: data => dispatch => {
      dispatch(setUploadedFileInfo(data));
      onSuccessCallback(data);
    },
    label: 'uploadAttachment',
  });
}

export const downloadFileUrl = (
  id,
  onSuccessCallback = () => {},
  url = true
) => {
  return apiAction({
    url: `/attachments/${id}/download?url=${url}`,
    onSuccess: data => dispatch => {
      dispatch(setFileUrl(data));
      onSuccessCallback(data);
    },
    label: 'attachments',
  });
};

export const downloadFileThumbnailUrl = (id, url = true) => async dispatch => {
  try {
    dispatch(apiStart(label));

    const { data } = await axios.get(`/attachments/${id}/thumb?url=${url}`);

    dispatch(setThumbFileUrl({ data: data.url }));
  } catch (error) {
    const errorMessage = apiErrorMessageResolver(error);

    toast.error(errorMessage);
  } finally {
    dispatch(apiEnd(label));
  }
};

export function deleteAttachment(id, onSuccessCallback = () => {}) {
  return apiAction({
    url: `/attachments/${id}`,
    method: 'DELETE',
    showToast: true,
    onSuccess: onSuccessCallback,
    attribute: id,
    label: 'attachment',
  });
}
