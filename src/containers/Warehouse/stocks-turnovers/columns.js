import React from 'react';
import { formatNumberToLocale, defaultNumberFormat } from 'utils';
import { DetailButton, ProDots, ProDotsItem } from 'components/Lib';
import { ReactComponent as WithBarcode } from 'assets/img/icons/havebarcode.svg';
import { ReactComponent as WithoutBarcode } from 'assets/img/icons/nothavebarcode.svg';
import { permissions, accessTypes } from 'config/permissions';
import { BsCardImage } from 'react-icons/bs';
import Zoom from 'react-medium-image-zoom';
import Can from 'components/Lib/Can';
import { Tooltip } from 'antd';

const math = require('exact-math');

export const getTurnoverColumns = props => {
  const {
    baseURL,
    tenantId,
    token,
    mainCurrencyCode,
    handleDetailClick,
    handleSoldClick,
    handleTransferClick,
    currencyRate,
    filters,
    permissions,
    openBarcodeModal,
    column
  } = props;
  const { limit, page } = filters;
  const columns = [];

  columns[column.indexOf('stock_name')] ={
    title: 'Anbar',
    ellipsis: true,
    dataIndex: 'stock_name',
    width: 200,
    render: (value, row) => (row.isLastRow ? '' : 
    <Tooltip placement="topLeft" title={value}>
    <span>{value}</span>
  </Tooltip> || '-'),
  };

  columns[column.indexOf('isServiceType')] = {
    title: 'Məhsul tipi',
    dataIndex: 'isServiceType',
    width: 120,
    render: (value,row) =>row.isLastRow ? '' :  (value ? 'Xidmət' : 'Məhsul'),
  };

  columns[column.indexOf('isWithoutSerialNumber')] = {
    title: 'Seriya nömrəsi',
    dataIndex: 'isWithoutSerialNumber',
    align: 'center',
    width: 120,
    render: (v,row) => row.isLastRow ? '' : (v === false ? 'Hə' : 'Yox'),
  };

  columns[column.indexOf('product_name')] = {
    title: 'Məhsul adı',
    dataIndex: 'product_name',
    width: 250,
    ellipsis: true,
    render: (value, row) =>
      row.isLastRow ? (
        ''
      ) : value ? (
        <Tooltip placement="topLeft" title={value}>
          <span>{value}</span>
        </Tooltip>
      ) : (
        '-'
      ),
  };
  
    columns[column.indexOf('catalog_name')] =  {
      title: 'Kataloq',
      dataIndex: 'catalog_name',
      width: 250,
      ellipsis: true,
      render: (value, { subcatalog_name, isLastRow }) =>
        isLastRow ? (
          ''
        ) : (
          <Tooltip placement="topLeft" title={`${value} / ${subcatalog_name}`}>
            <span>{`${value} / ${subcatalog_name}`}</span>
          </Tooltip>
        ),
    };

    columns[column.indexOf('subcatalog_name')] = {
      title: 'Alt kataloq',
      dataIndex: 'subcatalog_name',
      align: 'left',
      ellipsis: true,
      width: 150,
      render: (value, row) =>
      row.isLastRow ? '' : 
        value ? (
          value === row.catalog_name ? (
            '-'
          ) : (
            <Tooltip placement="topLeft" title={value}>
              <span>{value}</span>
            </Tooltip>
          )
        ) : (
          '-'
        ),
    };
    columns[column.indexOf('manufacturerName')] = {
      title: 'İstehsalçı',
      width: 180,
      ellipsis: {
        showTitle: false,
      },
      render: ({ manufacturerName, manufacturerSurname },row) =>
      row.isLastRow ? '' : 
        !manufacturerName ? (
          '-'
        ) : (
          <Tooltip
            placement="topLeft"
            title={`${manufacturerName} ${manufacturerSurname && ''}`}
          >
            {manufacturerName} {manufacturerSurname && ''}
          </Tooltip>
        ),
    };
    columns[column.indexOf('productCode')] = {
      title: 'Məhsul kodu',
      dataIndex: 'productCode',
      width: 120,
      ellipsis: {
        showTitle: false,
      },
      align: 'center',
      render: (value,row) =>row.isLastRow ? '' : ( value || '-'),
    };
    columns[column.indexOf('attachmentName')] = {
      title: 'Şəkil',
      dataIndex: 'attachmentName',
      align: 'center',
      width: 120,
      render: (v, row) =>
      row.isLastRow ? '' : 
       ( row?.attachmentId !== null ?
          <Zoom
            zoomMargin={50}
            defaultStyles={{ height: 'fill-available' }}
          >
            <img
              src={
                `${baseURL}/attachments/${row.attachmentId}/download?tenant=${tenantId}&token=${token}`
                
              }
              alt={
                row.attachmentOriginalName.slice(0,10)
              }
              style={{ height: '45px', objectFit: 'contain' }}
              width="35px"
              className="img"
            />
          </Zoom>
          : <BsCardImage fontSize="35px" />),
    };
    
    columns[column.indexOf('quantity')]= {
      title: 'Say',
      width: 150,
      dataIndex: 'quantity',
      align: 'center',
      render: (value, { unit_of_measurement, isLastRow }) =>
        isLastRow
          ? value
            ? `${formatNumberToLocale(defaultNumberFormat(value))}`
            : ''
          : `${formatNumberToLocale(
              defaultNumberFormat(value)
            )} ${unit_of_measurement || ''}`,
    };
    columns[column.indexOf('pricePerUnit')]={
      title: 'Satış qiyməti',
      width: 150,
      dataIndex: 'pricePerUnit',
      key: 'pricePerUnit',
      align: 'center',
      render:  (value, row) =>
      row.isLastRow
        ? ''
        :value? `${formatNumberToLocale(
            defaultNumberFormat(
              Number(value||0)
              )
            )
          } ${row.currencyCode}`:"-",
    };

  if (permissions.stock_report_average_value1.permission !== 0) {
    columns[column.indexOf('customPrice')]={
      title: `Orta dəyər (${currencyRate.code || mainCurrencyCode})`,
      width: 150,
      dataIndex: 'price',
      key: 'customPrice',
      align: 'right',
      render: (value, row) =>
        row.isLastRow
          ? ''
          : `${formatNumberToLocale(
              defaultNumberFormat(
                math.div(
                  math.div(Number(value), Number(row.quantity)),
                  Number(currencyRate.rate)
                )
              )
            )} ${currencyRate.code || mainCurrencyCode}`,
    };
  }
  if (permissions.stock_report_average_value2.permission !== 0) {
    columns[column.indexOf('mainPrice')]={
      title: `Orta dəyər (${mainCurrencyCode})`,
      width: 150,
      dataIndex: 'price',
      key: 'mainPrice',
      align: 'right',
      render: (value, row) =>
        row.isLastRow
          ? ''
          : `${formatNumberToLocale(
              defaultNumberFormat(math.div(Number(value), Number(row.quantity)))
            )} ${mainCurrencyCode}`,
    };
  }
  if (permissions.stock_report_total.permission !== 0) {
    columns[column.indexOf('totalPrice')]={
      title: 'Toplam',
      width: 150,
      dataIndex: 'price',
      key: 'totalPrice',
      align: 'right',
      render: value =>
        `${formatNumberToLocale(
          defaultNumberFormat(value)
        )} ${mainCurrencyCode || ''}`,
    };
  }
  columns[column.indexOf('barcode')] = {
    title: 'Barkod',
    dataIndex: 'barcode',
    align: 'center',
    ellipsis: true,
    width: 120,
        render: (value, row) =>row.isLastRow ? '' : 
         (value ? <WithBarcode style={{cursor: 'pointer'}} onClick={()=>openBarcodeModal(row.product_id)}/> : <WithoutBarcode />),
  };
  columns[column.indexOf('description')] = {
    title: 'Əlavə məlumat',
    dataIndex: 'description',
    align: 'center',
    ellipsis: true,
    width: 120,
    render: (value,row) =>
    row.isLastRow ? '' : 
      (value ? <Tooltip
        placement="topLeft"
        title={value}
      >
        {value}
      </Tooltip> : '-'),
  };
  columns.unshift(
    {
      title: '№',
      dataIndex: 'id',
      width: 80,
      render: (value, row, index) =>
        row.isLastRow ? null : (page - 1) * limit + index + 1,
    }
  )
  columns.push({
    title: 'Seç',
    width: 100,
    align: 'center',
    render: row =>
      row.isLastRow ? (
        ''
      ) : (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <DetailButton onClick={() => handleDetailClick(row)} />
          <Can I={accessTypes.manage} a={permissions.sales_invoice}>
            <Can I={accessTypes.manage} a={permissions.transfer_invoice}>
              <ProDots>
                <>
                  <Can I={accessTypes.manage} a={permissions.sales_invoice}>
                    <ProDotsItem
                      label="Sat"
                      icon="sale"
                      onClick={() => handleSoldClick(row)}
                    />
                  </Can>
                  <Can I={accessTypes.manage} a={permissions.transfer_invoice}>
                    <ProDotsItem
                      label="Transfer"
                      icon="migration"
                      onClick={() => handleTransferClick(row)}
                    />
                  </Can>
                </>
              </ProDots>
            </Can>
          </Can>
        </div>
      ),
  });
  return columns;
};
