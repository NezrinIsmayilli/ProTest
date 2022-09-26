/**
 * @typedef { [ { name: string, required: boolean } ] } Fields
 */

/**
 * Form Validate helper
 * @param {{ name: value }} values - Form fields values
 * @param {Fields} fields - fields for validate and additional info
 * @param {Function} callback - call on end
 */
export function isFormValid(values, fields, callback) {
  let formIsValid = true;
  const errors = {};

  fields.forEach(item => {
    const { name, required } = item;

    if (required && !values[name]) {
      formIsValid = false;
      errors[name] = 'error';
    }
  });

  if (!formIsValid) {
    callback(errors);
  }

  return formIsValid;
}
