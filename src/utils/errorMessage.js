export function ErrorMessage(error) {
  let errorMessage = '';
  if (
    error.error.response.data.error.message ===
    'This product price type is already exists.'
  ) {
    errorMessage = 'Bu dəyər artıq mövcuddur.';
  } else if (error.error.response.data.error.line === 217) {
    errorMessage = '3 simvoldan az ola bilməz ';
  } else if (
    error.error.response.data.error.message === 'This stock is already exists.'
  ) {
    errorMessage = 'Bu adlı anbar artıq mövcuddur.';
  } else if (
    error.error.response.data.error.message === 'Catalog has a products'
  ) {
    errorMessage = 'Məhsul bağlı olan kataloq artıq silinə bilməz!';
  } else if (error.error.response.data.error.message === 'Stock is not empty') {
    errorMessage = 'Anbarın tərkibində məhsul olduğu üçün silinə bilməz';
  } else if (
    error.error.response.data.error.message ===
    'This cashbox name is already exists.'
  ) {
    errorMessage = 'Bu hesab artıq mövcuddur.';
  } else if (
    error.error.response.data.error.message === 'This catalog cannot be deleted'
  ) {
    errorMessage = 'Bu xərc maddəsi silinə bilməz!';
  } else if (
    error.error.response.data.error.message === 'This item cannot be deleted'
  ) {
    errorMessage = 'Bu xərc adı silinə bilməz!';
  } else if (
    error.error.response.data.error.message === 'Catalog has sub-catalog.'
  ) {
    errorMessage = 'Kataloq, alt kataloqa bağlı olduğu üçün silinə bilməz!';
  }
  return errorMessage;
}
