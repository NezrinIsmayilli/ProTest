export function getSalaryOperationTypeName(type) {
  if (type === 'salary-addition' || type === 'salary-addition-production') {
    return 'Maaş əlavə';
  }
  if (type === 'salary-deduction') {
    return 'Tutulma';
  }
  if (type === 'salary-payment') {
    return 'Ödəniş';
  }
}
