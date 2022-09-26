import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import { Row, Col, Tooltip } from 'antd';
import {
  ExcelButton,
  Table,
  ProPagination,
  ProPageSelect,
  DetailButton,
  ProDots,
  ProDotsItem,
  Can,
  TableConfiguration,
  ProModal,
} from 'components/Lib';
import ExportJsonExcel from 'js-export-excel';
import { useFilterHandle } from 'hooks/useFilterHandle';
import { fetchPurchasedItems } from 'store/actions/operations/purchased-items';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import {
  formatNumberToLocale,
  thisMonthStart,
  thisMonthEnd,
  defaultNumberFormat,
  fullDateTimeWithSecond,
} from 'utils';
import { accessTypes, permissions } from 'config/permissions';
import TurnoverSidebar from './Sidebar';
import DetailsModal from './DetailsModal';
import styles from './styles.module.scss';
import queryString from 'query-string';
import { filterQueryResolver } from 'utils';
import { SettingButton } from 'components/Lib/Buttons/SettingButton';
import ExportToExcel from 'components/Lib/ExportToExcel';
import { fetchTableConfiguration, createTableConfiguration } from 'store/actions/settings/tableConfiguration';
import { fetchAllPurchasedItems } from 'store/actions/export-to-excel/salesBuyModule';
import { ReactComponent as WithBarcode } from 'assets/img/icons/havebarcode.svg';
import { ReactComponent as WithoutBarcode } from 'assets/img/icons/nothavebarcode.svg';
import { BsCardImage } from 'react-icons/bs';
import Zoom from 'react-medium-image-zoom';
import {fetchProduct} from 'store/actions/product';
import { cookies } from 'utils/cookies';
import BarcodeDetails from '../sold-items/DetailsModal/barcodeDetails';
import { Sales_Purchased_TABLE_SETTING_DATA } from 'utils/table-config/salesBuyModule';
const math = require('exact-math');
const roundTo = require('round-to');

const PurchasedItems = ({
  purchasedItems,
  fetchProduct,
  fetchPurchasedItems,
  fetchAllPurchasedItems,
  fetchTableConfiguration,
  createTableConfiguration,
  isLoading,
  mainCurrencyCode,
  tableConfiguration,
  permissionsByKeyValue,
  total,
  fetchBusinessUnitList,
  businessUnits,
  profile,
}) => {
  const history = useHistory();
  const location = useLocation();
  const params = queryString.parse(location.search, {
    arrayFormat: 'bracket',
});
const baseURL =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL
    : process.env.REACT_APP_DEV_API_URL;
  const token = cookies.get('_TKN_');
  const tenantId = cookies.get('__TNT__');
  // const pages = [8, 10, 20, 50, 100, total];
  const [pageSize, setPageSize] = useState(
    params.limit && !isNaN(params.limit) ? parseInt(params.limit) : 8
  );
  const [currentPage, setCurrentPage] = useState(
    params.page && !isNaN(params.page) ? parseInt(params.page) : 1
  );
  const [visible, setIsVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [Tvisible, toggleVisible] = useState(false);
  const [tableSettingData, setTableSettingData] = useState(Sales_Purchased_TABLE_SETTING_DATA);
  const [excelData, setExcelData] = useState([]);
  const [excelColumns, setExcelColumns] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [exPurchasedItems, setExPurchasedItems] = useState([]);
  const [barcodeModalVisible, setBarcodeModalVisible] = useState(false);

  // eslint-disable-next-line no-unused-vars
  const [filters, onFilter,setFilters] = useFilterHandle(
    {
      dateFrom:params.dateFrom?params.dateFrom: thisMonthStart, // dd-mm-yy
      dateTo:params.dateTo?params.dateTo: thisMonthEnd, // dd-mm-yy
      suppliers:params.suppliers ? params.suppliers : null, // array
      agents:params.agents ? params.agents : null, // array
      stocks:params.stocks ? params.stocks : null, // array
      rootCatalogs:params.rootCatalogs ? params.rootCatalogs : null, // agents
      productCatalogs:params.productCatalogs ? params.productCatalogs : null, // agents
      products:params.products ? params.products :  null, // agents
      isSerialNumber:params.isSerialNumber ? params.isSerialNumber :null,
      productCode:params.productCode ? params.productCode :  null,
      serialNumber:params.serialNumber ? params.serialNumber :  null,
      barcode:params.barcode ? params.barcode :  null,
      contracts:params.contracts ? params.contracts : undefined,
      invoices:params.invoices ? params.invoices : undefined,
      salesman:params.salesman ? params.salesman : undefined,
      description:params.description ? params.description : null,
      businessUnitIds:
      params.businessUnitIds ? params.businessUnitIds:
        (businessUnits?.length === 1
          ? businessUnits[0]?.id !== null
            ? [businessUnits[0]?.id]
            : undefined
          : undefined),
      limit: Number(pageSize),
      page: currentPage, // Number
    },
    ({ filters }) => {
      const query = filterQueryResolver({ ...filters });
      if(typeof(filters['history'])=='undefined') {
          history.push({
              search: query,
          });
      }
      fetchPurchasedItems({ filters }); // Prevent the call when the component is rendering first time
    }
  );

  const [rerender, setRerender] = useState(0);
  const popstateEvent = () => {
      setRerender(rerender+1);
  }

  useEffect(() => {
    window.addEventListener('popstate', popstateEvent );
    return (() => window.removeEventListener('popstate',popstateEvent));
}, [rerender]);

useEffect(() => {
  const parmas = queryString.parse(location.search, {
      arrayFormat: 'bracket',
  });
  
  if(rerender>0){
      parmas['history'] = 1;

      if(parmas.page && !isNaN(parmas.page)) {
          setCurrentPage(parseInt(parmas.page));
      }
      setFilters({ ...parmas });
  }
  
}, [rerender]);

  useEffect(() => {
    fetchBusinessUnitList({
      filters: {
        isDeleted: 0,
        businessUnitIds: profile.businessUnits?.map(({ id }) => id),
      },
    });
    fetchTableConfiguration({ module: 'Sales-Purchased-Items' })
  }, []);
  const getTotalData = (data = []) => {
    const totalPriceInMainCurrency = data.reduce(
      (total, current) =>
        total +
        math.mul(
          Number(current.endPricePerUnit),
          Number(current.quantity),
          Number(current.rate)
        ),
      0
    );

    const totalQuantity = data.reduce(
      (total, current) =>
        total +
        Number(current.quantity),
      0
    );

    return [
      ...data,
      {
        isTotal: true,
        id: 'Total count',
        endPricePerUnit: totalPriceInMainCurrency,
        quantity: totalQuantity,
      },
    ];
  };

  const handlePaginationChange = value => {
    onFilter('page', value);
    return (() => setCurrentPage(value))();
  };

  const handleGiveBackClick = row => {
    history.push({
      pathname: '/sales/operations/add',
      state: { data: row, from: 'purchased-items' },
    });
  };
  const handleSaveSettingModal = column => {
    let tableColumn = column.filter(col => col.visible === true).map(col => col.dataIndex);
    let filterColumn = column.filter(col => col.dataIndex !== 'id');
    let data = JSON.stringify(filterColumn);
    getColumns({column: tableColumn})
    createTableConfiguration({ moduleName: "Sales-Purchased-Items", columnsOrder: data })
    setVisibleColumns(tableColumn);
    setTableSettingData(column);
    toggleVisible(false);
    getExcelColumns(mainCurrencyCode);
  };
  const openBarcodeModal = (id) => {
    setBarcodeModalVisible(!barcodeModalVisible)
    if(!barcodeModalVisible) {
      fetchProduct({ id })
    }
  }

        // set Table Configuration data and set visible columns
  useEffect(() => {
    if (tableConfiguration?.length > 0 && tableConfiguration !== null) {
      let parseData = JSON.parse(tableConfiguration)
      let columns = parseData.filter(column => column.visible === true)
        .map(column => column.dataIndex);
      setVisibleColumns(columns)
      setTableSettingData(parseData)
    }
    else if(tableConfiguration== null){
      const column = Sales_Purchased_TABLE_SETTING_DATA
      .filter(column => column.visible === true)
      .map(column => column.dataIndex);
    setVisibleColumns(column);
    setTableSettingData(Sales_Purchased_TABLE_SETTING_DATA);
    }
  }, [tableConfiguration]);

  const handleNumberChange = size => {
    onFilter('limit', size);
    onFilter('page', 1); // Need to change page number to 1 (data.length can be less than pageSize * cureentPage)
    return (() => {
      setCurrentPage(1);
      setPageSize(size);
    })();
  };

  const handleDetailClick = row => {
    setIsVisible(true);
    setSelectedRow(row);
  };


  const getColumns = ({column}) => {
    const columns = [];
    
      columns[column.indexOf('warehouseName')]={
        title: 'Anbar',
        dataIndex: 'warehouseName',
        width: 130,
        render: (value, row) =>
          row.isTotal ? null : value?.length > 10 ? (
            <Tooltip title={value}>{value.substring(0, 10)}...</Tooltip>
          ) : (
            value
          ),
      };
      columns[column.indexOf('rootCatalogName')]={
        title: 'Kataloq',
        dataIndex: 'rootCatalogName',
        width: 130,
        render: (value, row) =>
          row.isTotal ? null : value?.length > 10 ? (
            <Tooltip title={value}>{value.substring(0, 10)}...</Tooltip>
          ) : (
            value
          ),
      };
      columns[column.indexOf('catalogName')]={
        title: 'Alt kataloq',
        dataIndex: 'catalogName',
        width: 130,
        render: (value, row) =>
          row.isTotal ? null : value?.length > 10 ? (
            <Tooltip title={value}>{value.substring(0, 10)}...</Tooltip>
          ) : (
            value
          ),
      };
      columns[column.indexOf('productName')]={
        title: 'Məhsul adı',
        dataIndex: 'productName',
        width: 130,
        render: (value, row) =>
          row.isTotal ? null : value?.length > 10 ? (
            <Tooltip title={value}>{value.substring(0, 10)}...</Tooltip>
          ) : (
            value
          ),
      };
      columns[column.indexOf('quantity')]={
        title: 'Say',
        dataIndex: 'quantity',
        width: 100,
        render: (value, row) => formatNumberToLocale(defaultNumberFormat(value)),
      };
      columns[column.indexOf('unitOfmeasuring')]={
        title: 'Ölçü vahidi',
        dataIndex: 'unitOfmeasuring',
        align: 'center',
        width: 120,
        render: (value, row) => (row.isTotal ? null : value || '-'),
      };

    if (
      permissionsByKeyValue.sales_purchased_items_price_per_item.permission !==
      0
    ) {
      columns[column.indexOf('costPerUnit')]={
        title: 'Vahidin qiyməti',
        dataIndex: 'costPerUnit',
        align: 'right',
        width: 150,
        render: (value, row) =>
          row.isTotal
            ? ''
            : `${formatNumberToLocale(defaultNumberFormat(value))} ${
                row.invoiceCurrencyCode
              }`,
      };
    }
    if (
      permissionsByKeyValue.sales_purchased_items_total_price.permission !== 0
    ) {
      columns[column.indexOf('totalCost')]={
        title: 'Toplam dəyər',
        dataIndex: 'totalCost',
        align: 'right',
        width: 150,
        render: (value, row) =>
          row.isTotal
            ? ''
            : `${formatNumberToLocale(defaultNumberFormat(value))} ${
                row.invoiceCurrencyCode
              }`,
      };
    }
    if (permissionsByKeyValue.sales_purchased_items_discount.permission !== 0) {
      columns[column.indexOf('discountAmountPerUnit')]={
        title: 'Endirim(%)',
        dataIndex: 'discountAmountPerUnit',
        key: 'discountAmount',
        width: '120px',
        render: (value, row) =>
          row.isTotal
            ? null
            : `${formatNumberToLocale(
                defaultNumberFormat(
                  roundTo(
                    math.div(
                      math.mul(Number(value || 0) || 0, 100),
                      row.costPerUnit || 0
                    ),
                    4
                  ) || 0
                )
              )} %`,
      };
    }
    if (permissionsByKeyValue.sales_purchased_items_endprice.permission !== 0) {
      columns[column.indexOf('endPricePerUnit')]={
        title: 'Son qiymət',
        dataIndex: 'endPricePerUnit',
        key: 'endOfPeriod',
        align: 'right',
        width: '150px',
        render: (value, row) =>
          row.isTotal
            ? null
            : `${formatNumberToLocale(
                defaultNumberFormat(
                  math.mul(Number(value), Number(row.quantity))
                )
              )} ${row.invoiceCurrencyCode}`,
      };
    }
    if (
      permissionsByKeyValue.sales_purchased_items_per_item_endprice
        .permission !== 0
    ) {
      columns[column.indexOf('endPricePerUnitInMainCurrencyUnit')]={
        title: 'Vahidin son qiyməti',
        dataIndex: 'endPricePerUnitInMainCurrencyUnit',
        key: 'endOfPeriodPerUnit',
        align: 'right',
        width: '150px',
        render: (value, row) =>
          row.isTotal
            ? ''
            : `${formatNumberToLocale(defaultNumberFormat(row.endPricePerUnit))} ${
                row.invoiceCurrencyCode
              }`,
      };
    }
    if (
      permissionsByKeyValue.sales_purchased_items_main_currency.permission !== 0
    ) {
      columns[column.indexOf('endPriceInMainCurrency')]={
        title: 'Əsas valyuta',
        dataIndex: 'endPriceInMainCurrency',
        key: 'endPriceInMainCurrency',
        align: 'right',
        width: '150px',
        render: (value, row) =>
          row.isTotal
            ? `${formatNumberToLocale(
                defaultNumberFormat(row.endPricePerUnit)
              )} ${mainCurrencyCode}`
            : `${formatNumberToLocale(
                defaultNumberFormat(
                  math.mul(
                    Number(row.endPricePerUnit),
                    Number(row.quantity),
                    Number(row.rate)
                  )
                )
              )} ${mainCurrencyCode}`,
      };
    }

    
    columns[column.indexOf('operationDate')]={
        title: 'Tarix',
        dataIndex: 'operationDate',
        key: 'operationDate',
        width: '180px',
        render: (value, row) =>
          row.isTotal
            ? null
            : `${moment(value).format(fullDateTimeWithSecond)}`,
      };
    columns[column.indexOf('contractNumber')]={
        title: 'Müqavilə',
        dataIndex: 'contractNumber',
        align:'center',
        width: 120,
        render: (value, row) => (row.isTotal ? null :  value?.length > 10 ? (
          <Tooltip title={value}>{value.substring(0, 10)}...</Tooltip>
        ) : (
          value
        ) || '-'),
      };
    columns[column.indexOf('invoiceNumber')]={
      title: 'Qaimə',
      dataIndex: 'invoiceNumber',
      width: 120,
      render: (value, row) => (row.isTotal ? null : value || '-'),
    };
    columns[column.indexOf('supplier')]={
      title: 'Təchizatçı',
      dataIndex: 'supplier',
      width: 130,
      render: (value, row) =>
        row.isTotal ? null : value?.length > 10 ? (
          <Tooltip title={value}>{value.substring(0, 10)}...</Tooltip>
        ) : (
          value
        ),
    };
    columns[column.indexOf('agent')]={
      title: 'Agent',
      dataIndex: 'agent',
      width: 130,
      render: (value, row) =>
        row.isTotal ? null : value?.length > 10 ? (
          <Tooltip title={value}>{value.substring(0, 10)}...</Tooltip>
        ) : (
          value || '-'
        ),
    };
    columns[column.indexOf('operator')]={
      title: 'Əməliyyatçı',
      dataIndex: 'operator',
      width: 150,
      render: (value, row) =>
        row.isTotal ? null : value?.length > 10 ? (
          <Tooltip title={value}>{value.substring(0, 10)}...</Tooltip>
        ) : (
          value || '-'
        ),
    };
    columns[column.indexOf('isServiceType')] = {
      title: 'Məhsul tipi',
      dataIndex: 'isServiceType',
      width: 120,
      render: (value,row) =>row.isTotal ? '' :  (value ? 'Xidmət' : 'Məhsul'),
    };
    columns[column.indexOf('isWithoutSerialNumber')] = {
      title: 'Seriya nömrəsi',
      dataIndex: 'isWithoutSerialNumber',
      align: 'center',
      width: 120,
      render: (v,row) => row.isTotal ? '' : (v === false ? 'Hə' : 'Yox'),
    };
    columns[column.indexOf('barcode')] = {
      title: 'Barkod',
      dataIndex: 'barcode',
      align: 'center',
      ellipsis: true,
      width: 120,
          render: (value, row) =>row.isTotal ? '' : 
           (value ? <WithBarcode style={{cursor: 'pointer'}} onClick={()=>openBarcodeModal(row.productId)}/> : <WithoutBarcode />),
    };

    columns[column.indexOf('attachmentName')] = {
      title: 'Şəkil',
      dataIndex: 'attachmentName',
      align: 'center',
      width: 120,
      render: (v, row) =>
      row.isTotal ? '' : 
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
    columns[column.indexOf('manufacturerName')] = {
      title: 'İstehsalçı',
      width: 180,
      align: 'center',
      ellipsis: true,
      render: ({ manufacturerName, manufacturerSurname },row) =>
      row.isTotal ? '' : 
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
      render: (value,row) =>row.isTotal ? '' : ( value || '-'),
    };
    columns[column.indexOf('pricePerUnit')]={
      title: 'Satış qiyməti',
      width: 150,
      dataIndex: 'pricePerUnit',
      key: 'pricePerUnit',
      align: 'center',
      render:  (value, row) =>
      row.isTotal
        ? ''
        :value? `${formatNumberToLocale(
            defaultNumberFormat(
              Number(value||0)
              )
            )
          } ${row.currencyCode}`:"-",
    };
    columns[column.indexOf('description')] = {
      title: 'Əlavə məlumat',
      dataIndex: 'description',
      align: 'center',
      ellipsis: true,
      width: 120,
      render: (value,row) =>
      row.isTotal ? '' : 
        (value ? <Tooltip
          placement="topLeft"
          title={value}
        >
          {value}
        </Tooltip> : '-'),
    };
    if (
      permissionsByKeyValue.sales_purchased_items_details.permission !== 0 ||
      permissionsByKeyValue.return_to_supplier_invoice.permission === 2
    ) {
      columns.push({
        title: 'Seç',
        dataIndex: '',
        key: '',
        width: 80,
        render: (_, row) =>
          row.isTotal ? null : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Can
                I={accessTypes.manage}
                a={permissions.sales_purchased_items_details}
              >
                <DetailButton onClick={() => handleDetailClick(row)} />
              </Can>
              <Can
                I={accessTypes.manage}
                a={permissions.return_to_supplier_invoice}
              >
                <ProDots>
                  <>
                    <ProDotsItem
                      label="Geri qaytar"
                      icon="arrow-down-2"
                      onClick={() => handleGiveBackClick(row)}
                    />
                  </>
                </ProDots>
              </Can>
            </div>
          ),
      });
    }

    columns.unshift( {
      title: '№',
      dataIndex: 'id',
      width: 100,
      align: 'left',
      render: (value, row, index) =>
        row.isTotal ? 'Toplam' : (currentPage - 1) * pageSize + index + 1,
    });

    return columns;
  };

  const getExcelColumns = (mainCurrencyCode) => {
    let columnClone = [...visibleColumns];
    columnClone.indexOf('attachmentName') !== -1 && columnClone.splice(columnClone.indexOf('attachmentName'), 1);
    let columns = []
    columns[columnClone.indexOf('warehouseName')] = {
      title: 'Anbar',
      width: { wpx: 150 },
    };
    columns[columnClone.indexOf('rootCatalogName')] = {
      title: 'Kataloq',
      width: { wpx: 150 },
    };

    columns[columnClone.indexOf('catalogName')] = {
      title: 'Alt kataloq',
      width: { wpx: 150 },
    };
    
    columns[columnClone.indexOf('productName')] = {
      title: 'Məhsul',
      width: { wpx: 200 },
    };

    columns[columnClone.indexOf('quantity')] = {
      title: 'Say',
      width: { wpx: 120 },
    };

    columns[columnClone.indexOf('unitOfmeasuring')] = {
      title: 'Ölçü vahidi',
      width: { wpx: 150 },
    };

    columns[columnClone.indexOf('costPerUnit')] = {
      title: 'Vahidin qiyməti',
      width: { wpx: 120 },
    };
    columns[columnClone.indexOf('totalCost')] = {
      title: 'Toplam qiymət',
      width: { wpx: 150 },
    };
    columns[columnClone.indexOf('discountAmountPerUnit')] = {
        title: 'Endirim(%)',
        width: { wpx: 150 },
      };
    columns[columnClone.indexOf('endPricePerUnit')] = {
      title: 'Son qiymət',
      width: { wpx: 150 },
    };
    columns[columnClone.indexOf('endPricePerUnitInMainCurrencyUnit')] = {
      title: 'Vahidin son qiyməti',
      width: { wpx: 120 },
    };
    columns[columnClone.indexOf(`endPriceInMainCurrency`)]={
        title: `Əsas valyuta (${mainCurrencyCode})`,
        width: { wpx: 200 },
    };
    columns[columnClone.indexOf('operationDate')] = {
      title: 'Tarix',
      width: { wpx: 200 },
    };
    columns[columnClone.indexOf('contractNumber')] = {
      title: 'Müqavilə',
      width: { wpx: 100 },
    };
    columns[columnClone.indexOf('invoiceNumber')] = {
      title: 'Qaimə',
      width: { wpx: 200 },
    };
    columns[columnClone.indexOf('supplier')] = {
      title: 'Təchizatçı',
      width: { wpx: 200 },
    };
    columns[columnClone.indexOf('agent')] = {
      title: 'Agent',
      width: { wpx: 200 },
    };
    columns[columnClone.indexOf('operator')] = {
      title: 'Əməliyyatçı',
      width: { wpx: 200 },
    };
    columns[columnClone.indexOf('isServiceType')] = {
      title: 'Məhsul tipi',
      width: { wpx: 200 },
    };
    columns[columnClone.indexOf('isWithoutSerialNumber')] = {
      title: 'Seriya nömrəsi',
      width: { wpx: 200 },
    };
    columns[columnClone.indexOf('barcode')] = {
      title: 'Barkod',
      width: { wpx: 200 },
    };
    columns[columnClone.indexOf('manufacturerName')] = {
      title: 'İstehsalçı',
      width: { wpx: 200 },
    };
    columns[columnClone.indexOf('productCode')] = {
      title: 'Məhsul kodu',
      width: { wpx: 200 },
    };
    columns[columnClone.indexOf('pricePerUnit')] = {
      title: 'Satış qiyməti',
      width: { wpx: 200 },
    };
    columns[columnClone.indexOf('description')] = {
      title: 'Əlavə məlumat',
      width: { wpx: 200 },
    };
    columns.unshift({
      title: '№',
      width: { wpx: 90 },
    });
    setExcelColumns(columns)
  }

  const getExcelData = () => {
    let columnClone = [...visibleColumns];
    const columnFooterStyle = {
      font: { color: { rgb: 'FFFFFF' }, bold: true },
      fill: { patternType: 'solid', fgColor: { rgb: '505050' } },
  };
    columnClone.indexOf('attachmentName') !== -1 && columnClone.splice(columnClone.indexOf('attachmentName'), 1);
    const data = exPurchasedItems.map((item, index) => {   
      let arr = []
     
      columnClone.includes('warehouseName') && (arr[columnClone.indexOf('warehouseName')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value: item.warehouseName || '-', })
      columnClone.includes('rootCatalogName') && (arr[columnClone.indexOf('rootCatalogName')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value: item.rootCatalogName || '-', })
      columnClone.includes('catalogName') && (arr[columnClone.indexOf('catalogName')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value: item.catalogName || '-', })
      columnClone.includes('productName') && (arr[columnClone.indexOf('productName')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value: item.productName || '-', })
      columnClone.includes('quantity') && (arr[columnClone.indexOf('quantity')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value:formatNumberToLocale(defaultNumberFormat(item.quantity)) ||'-', });
      columnClone.includes('unitOfmeasuring') && (arr[columnClone.indexOf('unitOfmeasuring')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value:item.unitOfmeasuring ||'-', });
      columnClone.includes('costPerUnit') && (arr[columnClone.indexOf('costPerUnit')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value:`${formatNumberToLocale(defaultNumberFormat(item.costPerUnit))} ${item.invoiceCurrencyCode}` ||'-', });
      columnClone.includes('totalCost') && (arr[columnClone.indexOf('totalCost')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value:`${formatNumberToLocale(defaultNumberFormat(item.totalCost))} ${item.invoiceCurrencyCode}` ||'-', });
      columnClone.includes('discountAmountPerUnit') && (arr[columnClone.indexOf('discountAmountPerUnit')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value:`${formatNumberToLocale(defaultNumberFormat(roundTo(math.div(math.mul(Number(item.discountAmountPerUnit || 0) || 0, 100),item.costPerUnit || 0),4) || 0))} %` ||'-', });
      columnClone.includes('endPricePerUnit') && (arr[columnClone.indexOf('endPricePerUnit')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value:`${formatNumberToLocale(defaultNumberFormat(math.mul(Number(item.endPricePerUnit), Number(item.quantity))))} ${item.invoiceCurrencyCode}` ||'-', });
      columnClone.includes('endPricePerUnitInMainCurrencyUnit') && (arr[columnClone.indexOf('endPricePerUnitInMainCurrencyUnit')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value:`${formatNumberToLocale(defaultNumberFormat(item.endPricePerUnit))} ${item.invoiceCurrencyCode}` ||'-', });

      columnClone.includes('endPriceInMainCurrency') && (arr[columnClone.indexOf('endPriceInMainCurrency')] =item?.isTotal?
      { value:Number(Number(item.endPricePerUnit).toFixed(4))||0 ||'-',style:columnFooterStyle }:{ value:Number(math.mul(Number(item.endPricePerUnit),Number(item.quantity),Number(item.rate)).toFixed(4)) ||'-', });
      columnClone.includes('operationDate') && (arr[columnClone.indexOf('operationDate')] = item?.isTotal?{value:'',style:columnFooterStyle}: { value:moment(item.operationDate).format(fullDateTimeWithSecond) ||'-', });
      columnClone.includes('contractNumber') && (arr[columnClone.indexOf('contractNumber')] =item?.isTotal?{value:'',style:columnFooterStyle}:  { value:item.contractNumber || '-', });
      columnClone.includes('invoiceNumber') && (arr[columnClone.indexOf('invoiceNumber')] =item?.isTotal?{value:'',style:columnFooterStyle}:  { value:item.invoiceNumber || '-', });
      columnClone.includes('supplier') && (arr[columnClone.indexOf('supplier')] =item?.isTotal?{value:'',style:columnFooterStyle}:  { value:item.supplier || '-', });
      columnClone.includes('agent') && (arr[columnClone.indexOf('agent')] =item?.isTotal?{value:'',style:columnFooterStyle}:  { value:item.agent || '-', });
      columnClone.includes('operator') && (arr[columnClone.indexOf('operator')] =item?.isTotal?{value:'',style:columnFooterStyle}:  { value:item.operator || '-', });
      columnClone.includes('isServiceType') && (arr[columnClone.indexOf('isServiceType')] =item?.isTotal?{value:'',style:columnFooterStyle}:  { value: item.isServiceType ? 'Xidmət' : 'Məhsul' || '-', })
      columnClone.includes('isWithoutSerialNumber') && (arr[columnClone.indexOf('isWithoutSerialNumber')] =item?.isTotal?{value:'',style:columnFooterStyle}:  { value: item.isWithoutSerialNumber ? "Yox" : "Hə" || '-', })
      columnClone.includes('barcode') && (arr[columnClone.indexOf('barcode')] =item?.isTotal?{value:'',style:columnFooterStyle}:  { value: item.barcode || '-', })
      columnClone.includes('manufacturerName') && (arr[columnClone.indexOf('manufacturerName')] =item?.isTotal?{value:'',style:columnFooterStyle}:  { value: item.manufacturerName || '-' })
      columnClone.includes('productCode') && (arr[columnClone.indexOf('productCode')] =item?.isTotal?{value:'',style:columnFooterStyle}:  { value: item.productCode || '-', })
      columnClone.includes('pricePerUnit') && (arr[columnClone.indexOf('pricePerUnit')] =item?.isTotal?{value:'',style:columnFooterStyle}:  { value:item.pricePerUnit? `${formatNumberToLocale(defaultNumberFormat( Number(item.pricePerUnit||0)))} ${item.currencyCode  || ''}`: '-' })
      columnClone.includes('description') && (arr[columnClone.indexOf('description')] =item?.isTotal?{value:'',style:columnFooterStyle}:  { value: item.description || '-', })
      
     arr.unshift(item.isTotal?{value:'Toplam:',style:columnFooterStyle}:{ value:index + 1, })
      return arr;
     
    })
    setExcelData(data);
  }


  useEffect(() => {
    getExcelColumns(mainCurrencyCode)
  }, [visibleColumns,mainCurrencyCode])

  useEffect(() => {
    getExcelData()
  }, [exPurchasedItems]);
  return (
    <div className={styles.GoodTurnovers}>
      <TurnoverSidebar
        onFilter={onFilter}
        filters={filters}
        fetchBusinessUnitList={fetchBusinessUnitList}
        profile={profile}
        handlePaginationChange={handlePaginationChange}
        thisMonthStart={thisMonthStart}
        thisMonthEnd={thisMonthEnd}
      />
     <TableConfiguration
              saveSetting={handleSaveSettingModal}
              visible={Tvisible}
              AllStandartColumns={Sales_Purchased_TABLE_SETTING_DATA}
              setVisible={toggleVisible}
              columnSource={tableSettingData}
          />
      <DetailsModal
        filters={filters}
        visible={visible}
        setIsVisible={setIsVisible}
        row={selectedRow}
      />
      <ProModal
        maskClosable
        padding
        width={1100}
        handleModal={openBarcodeModal}
        isVisible={barcodeModalVisible}
      ><BarcodeDetails fromTable/>
      </ProModal>
      <section className="scrollbar aside">
        <Row style={{ margin: '0 32px' }}>
          <Row style={{ margin: '20px 0' }}>
            <Col span={6} align="end" offset={18}>
            <div 
             style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
              }}>
              <Can I={accessTypes.manage} a={permissions.purchase_report}>
              <SettingButton onClick={toggleVisible} />
              <ExportToExcel
                  getExportData={
                  () => fetchAllPurchasedItems({
                      filters: {...filters, limit: 5000, page:undefined}, onSuccessCallback: data => {
                        setExPurchasedItems(getTotalData(data.data))
                      }
                  })
                  }
                  data={excelData}
                  columns={excelColumns}
                  excelTitle="Alışlar"
                  excelName="Alışlar"
                  filename="Alışlar"
                  count={total}
              />
              </Can>
              </div>
            </Col>
          </Row>
          <Row>
            <Table
              loading={isLoading}
              scroll={{ x: 'max-content' }}
              columns={getColumns({column: visibleColumns})}
              className={styles.tableFooter}
              dataSource={
                purchasedItems?.length > 0 ? getTotalData(purchasedItems) : []
              }
              pagination={false}
            />
          </Row>
          <Row
            style={{
              margin: '15px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Col span={8}>
              <ProPagination
                isLoading={isLoading}
                currentPage={currentPage}
                pageSize={pageSize}
                onChange={handlePaginationChange}
                total={total}
              />
            </Col>
            <Col span={6} offset={10} align="end">
              <ProPageSelect
                pageSize={pageSize}
                onChange={handleNumberChange}
                total={total}
              />
            </Col>
          </Row>
        </Row>
      </section>
    </div>
  );
};
const mapStateToProps = state => ({
  purchasedItems: state.purchasedItemsReducer.purchasedItems,
  mainCurrencyCode: state.purchasedItemsReducer.mainCurrencyCode,
  total: state.purchasedItemsReducer.total,
  isLoading: state.purchasedItemsReducer.isLoading,
  actionLoading: state.purchasedItemsReducer.actionLoading,
  permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
  profile: state.profileReducer.profile,
  businessUnits: state.businessUnitReducer.businessUnits,
  tableConfiguration: state.tableConfigurationReducer.tableConfiguration,
});

export default connect(
  mapStateToProps,
  {
    createTableConfiguration,
    fetchTableConfiguration,
    fetchAllPurchasedItems,
    fetchProduct,
    fetchPurchasedItems, // actions/goods
    fetchBusinessUnitList,
  }
)(PurchasedItems);
