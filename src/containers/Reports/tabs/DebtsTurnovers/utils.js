import ExportJsonExcel from 'js-export-excel';

export const handleExport = (debtsTurnovers, debtType) => {
  const data = debtsTurnovers || '';
  const option = {};
  const dataTable = data.map(dataItem => ({
    Id: dataItem.id,
    Counterparty: dataItem.contrpartyFullName,
    'Start of the period': data.startOfThePeriodDebt,
    'Debt reduction': data.debtReduction,
    'Debt inccreasement': dataItem.debtIncreasment,
    'End of the period': dataItem.endOfThePeriodDebt,
    Dinamika: dataItem.dynamics,
    'Dinamika(%)': dataItem.dynamicsPercentage,
  }));

  option.fileName =
    debtType === 'payables-turnover' ? 'Payables' : 'Receivables';
  option.datas = [
    {
      sheetData: dataTable,
      shhetName: 'sheet',
      sheetFilter: [
        'Id',
        'Start of the period',
        'Debt reduction',
        'Debt increasement',
        'End of the period',
        'Dinamika',
        'Dinamika(%)',
      ],
      sheetHeader: [
        'Id',
        'Start of the period',
        'Debt reduction',
        'Debt increasement',
        'End of the period',
        'Dinamika',
        'Dinamika(%)',
      ],
    },
  ];

  const toExcel = new ExportJsonExcel(option);
  toExcel.saveExcel();
};
