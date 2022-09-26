import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { ExcelButton } from 'components/Lib';
import ReactExport from 'react-data-export';

const { ExcelFile } = ReactExport;
const { ExcelSheet } = ReactExport.ExcelFile;

const ExportToExcel = props => {
  const {
    data,
    currency = '',
    excelTitle = '',
    columnHeaderStyle = {
      font: { color: { rgb: 'FFFFFF' }, bold: true },
      fill: { patternType: 'solid', fgColor: { rgb: '55ab80' } },
    },
    excelName = 'file',
    filename = 'file',
  } = props;
  const multiDataSet = [
    {
      columns: [
        {
          title: '',
          width: { wpx: 60 },
        },
        {
          title: 'Prospect Cloud ERP',
          width: { wpx: 150 },
          style: {
            font: { color: { rgb: '55ab80' }, bold: true },
            alignment: {
              wrapText: true,
              horizontal: 'right',
            },
          },
        },
        {
          title: `/ ${excelTitle}`,
        },
      ],
      data: [[]],
    },
    {
      ySteps: 1,
      columns: [
        {
          title: '№',
          style: columnHeaderStyle,
        },
        {
          title: 'Satış meneceri',
          style: columnHeaderStyle,
          width: { wpx: 150 },
        },
        {
          title: 'Qarşı tərəf',
          style: columnHeaderStyle,
          width: { wpx: 150 },
        },
        {
          title: `Toplam borclar(${currency})`,
          style: columnHeaderStyle,
          width: { wpx: 180 },
        },
        {
          title: `Ödənilib(${currency})`,
          style: columnHeaderStyle,
          width: { wpx: 180 },
        },
        {
          title: 'Ödənilib(%)',
          style: columnHeaderStyle,
          width: { wpx: 180 },
        },
        {
          title: `Ödənilməlidir(${currency})`,
          style: columnHeaderStyle,
          width: { wpx: 150 },
        },
        {
          title: `Son ödəniş(${currency})`,
          style: columnHeaderStyle,
          width: { wpx: 180 },
        },
        {
          title: 'Son ödəniş tarixi',
          style: columnHeaderStyle,
          width: { wpx: 150 },
        },
        {
          title: 'Günlərin sayı',
          style: columnHeaderStyle,
          width: { wpx: 140 },
        },
      ],
      data,
    },
  ];
  return (
    <>
      <ExcelFile element={<ExcelButton />} filename={filename}>
        <ExcelSheet dataSet={multiDataSet} name={excelName} />
      </ExcelFile>
    </>
  );
};

const mapStateToProps = state => ({
  finOperations: state.vatInvoicesReducer.finOperations,
});

export default connect(
  mapStateToProps,
  {}
)(ExportToExcel);
