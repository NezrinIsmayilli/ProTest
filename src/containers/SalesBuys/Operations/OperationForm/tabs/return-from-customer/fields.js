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
    name: 'client',
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
    direction: 2,
  },
  stockTo: {
    type: 'stockTo',
    name: 'stockTo',
    label: 'Anbar(Haraya)',
    placeholder: 'Seçin',
  },
};
