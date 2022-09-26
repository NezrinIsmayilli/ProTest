export function formatToLocaleString(value) {
  return value ? Number(value).toLocaleString('en') : '-';
}
