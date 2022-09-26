export function toFixedNumber(value, float = 2) {
  return value === null || !value ? 0 : Number(Number(value).toFixed(float));
}
