export const fields = {
  date: {
    type: 'date',
    name: 'date',
    label: 'Tarix',
    placeholder: 'Seçin',
  },
  currency: {
    type: 'currency',
    name: 'currency',
    label: 'Valyuta',
    placeholder: 'Seçin',
  },
  counterparty: {
    type: 'counterparty',
    name: 'supplier',
    label: 'Qarşı tərəf',
    placeholder: 'Seçin',
    from: 'return',
  },
  salesman: {
    type: 'salesman',
    name: 'salesman',
    label: 'Satış meneceri',
    placeholder: 'Seçin',
  },
  contract: {
    type: 'contract',
    name: 'contract',
    label: 'Müqavilə',
    placeholder: 'Seçin',
    from: 'return',
    direction: 1,
  },
  stockFrom: {
    type: 'stockFrom',
    name: 'stockFrom',
    label: 'Anbar(Haradan)',
    placeholder: 'Seçin',
  },
};
