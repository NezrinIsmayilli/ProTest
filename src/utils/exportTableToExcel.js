const ExportJsonExcel = require('js-export-excel');

// add notUseRenderExcel if you want use dataindex instead of render if specific column has render
// add excelRender if you want specific render to column

function generateItemValue(
  render,
  dataIndex,
  data,
  notUseRenderExcel,
  excelRender,
  index
) {
  return excelRender
    ? dataIndex
      ? excelRender(data[dataIndex])
      : excelRender(data)
    : dataIndex || render
    ? render && !dataIndex
      ? render(data, '', index)
      : !render && dataIndex
      ? data[dataIndex]
      : render && dataIndex
      ? notUseRenderExcel
        ? data[dataIndex]
        : render(data[dataIndex], '', index)
      : undefined
    : undefined;
}

export default (columns, dataSource, fileProperties, e) => {
  const option = {};

  option.fileName =
    fileProperties && fileProperties.fileName
      ? fileProperties.fileName
      : 'report';
  option.datas = [
    {
      sheetData: [],
      sheetName:
        fileProperties && fileProperties.sheetName
          ? fileProperties.sheetName
          : 'sheet',
      sheetFilter: [...columns.map(({ title }) => title)],
      sheetHeader: [...columns.map(({ title }) => title)],
      columnWidths: [
        ...columns.map(({ width }) => (width ? Number(width) / 20 : undefined)),
      ],
    },
  ];

  const tmpSheetData = [];
  dataSource.forEach((data, index) => {
    tmpSheetData[index] = {};
    columns.forEach(
      ({ title, render, dataIndex, notUseRenderExcel, excelRender }) => {
        if (title !== '')
          tmpSheetData[index] = {
            ...tmpSheetData[index],
            [title]: generateItemValue(
              render,
              dataIndex,
              data,
              notUseRenderExcel,
              excelRender,
              index
            ),
          };
      }
    );
  });
  console.log(tmpSheetData);
  option.datas[0].sheetData = tmpSheetData;

  const toExcel = new ExportJsonExcel(option);
  toExcel.saveExcel();
};
