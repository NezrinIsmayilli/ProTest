import swal from '@sweetalert/with-react';
/**
 * Delete Modal
 * @param {Number} id - item id
 * @param {Function} callback - callback func will call on submit
 */
export function DeleteModal(id, callback) {
	return () =>
		swal({
			title: 'Silmək istədiyinizə əminsinizmi?',
			icon: 'warning',
			buttons: ['İmtina', 'Sil'],
			dangerMode: true,
		}).then(willDelete => {
			if (willDelete) {
				callback(id);
			}
		});
}

// export function DeleteModalModified(callback, ...rest) {
//   return () =>
//     swal({
//       title: 'Silmək istədiyinizə əminsinizmi?',
//       icon: 'warning',
//       buttons: ['İmtina', 'Sil'],
//       dangerMode: true,
//     }).then(willDelete => {
//       if (willDelete) {
//         callback(...rest);
//       }
//     });
// }
