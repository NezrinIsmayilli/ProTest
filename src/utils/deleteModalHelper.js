import swal from '@sweetalert/with-react';

/**
 *
 * @param {Function} callback
 * @param {String} message
 * @param {String} icon
 * @param {[String]} buttons
 * @param {Boolean} dangerMode
 */
export const deleteModalHelper = (
  callback,
  message = 'Silmək istədiyinizə əminsinizmi?',
  icon = 'warning',
  buttons = ['İmtina', 'Sil'],
  dangerMode = true
) =>
  swal({
    title: message,
    icon,
    buttons,
    dangerMode,
  }).then(willDelete => {
    if (willDelete) {
      callback();
    }
  });
