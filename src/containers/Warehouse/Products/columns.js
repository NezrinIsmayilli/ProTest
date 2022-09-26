import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Checkbox, Icon, Tooltip } from 'antd';
import { DetailButton, ProDots, ProDotsItem } from 'components/Lib';
import { formatNumberToLocale, defaultNumberFormat, roundToDown } from 'utils';
import { ReactComponent as WithBarcode } from 'assets/img/icons/havebarcode.svg';
import { ReactComponent as WithoutBarcode } from 'assets/img/icons/nothavebarcode.svg';
import { permissions, accessTypes } from 'config/permissions';
import Can from 'components/Lib/Can';
import { BsCardImage } from 'react-icons/bs';
import Zoom from 'react-medium-image-zoom';
import { FaInfoCircle } from 'react-icons/fa';

export const getProductsColumns = props => {
  const {
    currentPage,
    pageSize,
    handleDetailClick,
    handleDeleteClick,
    column,
    openBarcodeModal,
  } = props;

  const columns = [];

  columns[column.indexOf('isServiceType')] = {
    title: 'Məhsul tipi',
    dataIndex: 'isServiceType',
    width: 120,
    render: value => (value ? 'Xidmət' : 'Məhsul'),
  };

  columns[column.indexOf('isWithoutSerialNumber')] = {
    title: 'Seriya nömrəsi',
    dataIndex: 'isWithoutSerialNumber',
    align: 'center',
    width: 120,
    render: v => (v === false ? 'Hə' : 'Yox'),
  };

  columns[column.indexOf('parentCatalogName')] = {
    title: 'Kataloq',
    dataIndex: 'parentCatalogName',
    ellipsis: true,
    width: 150,
  };

  columns[column.indexOf('catalogName')] = {
    title: 'Alt kataloq',
    dataIndex: 'catalogName',
    align: 'left',
    ellipsis: true,
    width: 150,
    render: (value, row) =>
      value ? (
        value === row.parentCatalogName ? (
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

  columns[column.indexOf('name')] = {
    title: 'Məhsul adı',
    dataIndex: 'name',
    width: 180,
    ellipsis: {
      showTitle: false,
    },
    render: name => (
      <Tooltip placement="topLeft" title={name}>
        {name}
      </Tooltip>
    ),
  };

  columns[column.indexOf('manufacturerName')] = {
    title: 'İstehsalçı',
    width: 180,
    ellipsis: {
      showTitle: false,
    },
    render: ({ manufacturerName, manufacturerSurname }) =>
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
    render: value => value || '-',
  };
  columns[column.indexOf('attachmentName')] = {
    title: 'Şəkil',
    dataIndex: 'attachmentName',
    align: 'center',
    width: 120,
    render: (v, row) =>
      row?.attachmentId !== null ?
        <Zoom
          zoomMargin={50}
          defaultStyles={{ height: 'fill-available' }}
        >
          <img
            src={
              row.attachmentUrl
            }
            alt={
              row.attachmentOriginalName
            }
            style={{ height: '45px', objectFit: 'contain' }}
            width="35px"
            className="img"
          />
        </Zoom>
        : <BsCardImage fontSize="35px" />,
  };
  columns[column.indexOf('unitOfMeasurementName')] = {
    title: 'Ölçü vahidi',
    dataIndex: 'unitOfMeasurementName',
    width: 120,
    ellipsis: {
      showTitle: false,
    },
    align: 'center',
    render: value => value || '-',
  };
  columns[column.indexOf('pricePerUnit')] = {
    title: 'Qiymət',
    dataIndex: 'pricePerUnit',
    width: 180,
    align: 'left',
    render: (value, row) =>
      value
        ? <>
          <span>{formatNumberToLocale(defaultNumberFormat(value))} {
            row.currencyCode
          }</span>
          {row?.prices?.length > 0 ? (
            <Tooltip
              title={
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {row.prices?.map(price => (
                    <span>
                      {price.name}:{' '}
                      {roundToDown(price.amount)} {row.currencyCode}
                    </span>
                  ))}
                </div>
              }
            >
              <Button type="link" >
                <Icon component={FaInfoCircle} />
              </Button>
            </Tooltip>
          ) : null}
        </>
        : '-',
  };
  columns[column.indexOf('quantity')] = {
    title: 'Anbar qalığı',
    dataIndex: 'quantity',
    align: 'center',
    width: 120,
    render: value =>
      value ? formatNumberToLocale(defaultNumberFormat(value)) : '-',
  };

  columns[column.indexOf('isDeleted')] = {
    title: 'Status',
    dataIndex: 'isDeleted',
    align: 'center',
    width: 120,
    render: value =>
      value ? <span style={{ color: 'rgb(196, 196, 196)', background: 'rgb(248, 248, 248)',padding:'4px' }}>Silinib</span> : <span style={{ color: 'rgb(243, 183, 83)', backgroundColor: 'rgb(253, 247, 234)',padding:'4px'}}>Aktiv</span>,
  };
  columns[column.indexOf('barcode')] = {
    title: 'Barkod',
    dataIndex: 'barcode',
    align: 'center',
    ellipsis: true,
    width: 120,
        render: (value, row) => (value ? <WithBarcode style={{cursor: 'pointer'}} onClick={()=>openBarcodeModal(row.id)}/> : <WithoutBarcode />),
  };

  columns[column.indexOf('description')] = {
    title: 'Əlavə məlumat',
    dataIndex: 'description',
    align: 'center',
    ellipsis: true,
    width: 120,
    render: value =>
      value ? <Tooltip
        placement="topLeft"
        title={value}
      >
        {value}
      </Tooltip> : '-',
  };


  columns.unshift({
    title: '№',
    width: 80,
    render: (value, row, index) => (currentPage - 1) * pageSize + index + 1,
  });

  columns.push({
    title: 'Seç',
    dataIndex: 'id',
    width: 90,
    align: 'center',
    render: (value, row) => (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <DetailButton onClick={() => handleDetailClick(row)} />
        <Can I={accessTypes.manage} a={permissions.stock_product}>
          <ProDots isDisabled={row.isDeleted}>
            <>
              <Link to={`/warehouse/product/add?id=${row.id}`}>
                <ProDotsItem label="Düzəliş et" icon="pencil" />
              </Link>
              <ProDotsItem
                label="Sil"
                icon="trash"
                onClick={() => handleDeleteClick(row)}
              />
            </>
          </ProDots>
        </Can>
      </div>
    ),
  });

  // columns.unshift({
  //   title: '',
  //   width: 46,
  //   dataIndex: 'id',
  //   render(text, record) {
  //     return {
  //       props: {
  //         style: {
  //           background: record.isArchived ? 'rgb(240, 240, 240)' : '',
  //         },
  //       },
  //       children:
  //         record.id === 'isFooter' ? null : (
  //           <Checkbox
  //             checked={checkList.checkedListAll.includes(text)}
  //             onChange={event => handleCheckboxes(record, event)}
  //             disabled={
  //               record.barcode === null &&
  //               permissionsList.stock_product.permission !== 2
  //             }
  //           />
  //         ),
  //     };
  //   },
  // });

  return columns;
};
