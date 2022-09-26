export const fields = {
  date: {
    type: 'date',
    name: 'date',
    label: 'Tarix',
    placeholder: 'Seçin',
  },
  salesman: {
    type: 'salesman',
    name: 'salesman',
    label: 'Satış meneceri',
    placeholder: 'Seçin',
  },
  stockFrom: {
    type: 'stockFrom',
    name: 'stockFrom',
    label: 'Anbar(Haradan)',
    placeholder: 'Seçin',
  },
  stockTo: {
    type: 'stockTo',
    name: 'stockTo',
    label: 'Anbar(Haraya)',
    placeholder: 'Seçin',
    fromTransfer: true,
  },
};
