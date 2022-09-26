import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { useHistory, useLocation } from 'react-router-dom';
import { Row, Col, Tooltip } from 'antd';
import {
  ExcelButton,
  Table,
  ProPageSelect,
  ProPagination,
  DetailButton,
  ProDots,
  ProDotsItem,
  Can,
  TableConfiguration,
  ProModal,
} from 'components/Lib';
import { SettingButton } from 'components/Lib/Buttons/SettingButton';
import ExportToExcel from 'components/Lib/ExportToExcel';
import { fetchTableConfiguration, createTableConfiguration } from 'store/actions/settings/tableConfiguration';
import { fetchSoldItems } from 'store/actions/operations/sold-items';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { useFilterHandle } from 'hooks/useFilterHandle';
import ExportJsonExcel from 'js-export-excel';
import {
  formatNumberToLocale,
  defaultNumberFormat,
  thisMonthStart,
  thisMonthEnd,
  fullDateTimeWithSecond,
} from 'utils';
import { accessTypes, permissions } from 'config/permissions';
import SoldItemsSidebar from './Sidebar';
import DetailsModal from './DetailsModal';
import styles from './styles.module.scss';
import queryString from 'query-string';
import { filterQueryResolver } from 'utils';
import { Sales_SoldItems_TABLE_SETTING_DATA } from 'utils/table-config/salesBuyModule';
import { fetchAllSoldItems } from 'store/actions/export-to-excel/salesBuyModule';
import { ReactComponent as WithBarcode } from 'assets/img/icons/havebarcode.svg';
import { ReactComponent as WithoutBarcode } from 'assets/img/icons/nothavebarcode.svg';
import { BsCardImage } from 'react-icons/bs';
import Zoom from 'react-medium-image-zoom';
import {fetchProduct} from 'store/actions/product';
import { cookies } from 'utils/cookies';
import BarcodeDetails from './DetailsModal/barcodeDetails';
const math = require('exact-math');
const roundTo = require('round-to');

const SoldItems = ({
  isLoading,
  soldItems,
  fetchProduct,
  fetchAllSoldItems,
  createTableConfiguration,
  fetchTableConfiguration,
  tableConfiguration,
  mainCurrencyCode,
  fetchSoldItems,
  total,
  permissionsByKeyValue,
  fetchBusinessUnitList,
  businessUnits,
  profile,
}) => {
  const history = useHistory();
  const location = useLocation();
  const baseURL =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL
    : process.env.REACT_APP_DEV_API_URL;
  const token = cookies.get('_TKN_');
  const tenantId = cookies.get('__TNT__');
  const params = queryString.parse(location.search, {
    arrayFormat: 'bracket',
});
  const [pageSize, setPageSize] = useState(
    params.limit && !isNaN(params.limit) ? parseInt(params.limit) : 8
  );
  const [currentPage, setCurrentPage] = useState(
    params.page && !isNaN(params.page) ? parseInt(params.page) : 1
  );
  const [visible, setIsVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [Tvisible, toggleVisible] = useState(false);
  const [tableSettingData, setTableSettingData] = useState(Sales_SoldItems_TABLE_SETTING_DATA);
  const [excelData, setExcelData] = useState([]);
  const [excelColumns, setExcelColumns] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [exSoldItems, setExSoldItems] = useState([]);
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
      products:params.products ? params.products : null, // agents
      isSerialNumber:params.isSerialNumber ? params.isSerialNumber :null,
      productCode:params.productCode ? params.productCode : null,
      serialNumber:params.serialNumber ? params.serialNumber : null,
      barcode:params.barcode ? params.barcode : null,
      clients:params.clients ? params.clients : undefined,
      contracts:params.contracts ? params.contracts : undefined,
      invoices:params.invoices ? params.invoices : undefined,
      salesman:params.salesman ? params.salesman : undefined,
      description:params.description ? params.description : null,
      businessUnitIds:
      params.businessUnitIds ? params.businessUnitIds:
       ( businessUnits?.length === 1
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
      fetchSoldItems({ filters }); // Prevent the call when the component is rendering first time
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
    fetchTableConfiguration({ module: 'Sales-Sold-Items' })
  }, []);

  const getTotalData = (data = []) => {
    const totalPriceInMainCurrency = data.reduce(
      (total, current) => total + Number(current.totalPriceInMainCurrency),
      0
    );

    const totalQuantity = data.reduce(
      (total, current) => total + Number(current.quantity),
      0
    );

    const discountAmountInMainCurrency = data.reduce(
      (total, current) => total + 
      Number(
          math.mul(
            Number(current.discountAmountPerUnit) || 0,
            Number(current.quantity) || 0,
            Number(current.rate) || 0
          ) || 0
      ),
      0
    );
    const totalDiscountPercentage=data.reduce(
      (total,current)=>total+Number(
          roundTo(
            math.div(
              math.mul(
                Number(current.discountAmountPerUnit || 0) || 0,
                Number(current.quantity) || 0,
                Number(current.rate) || 0,
                100
              ),
              Number(current.totalPriceInMainCurrency) || 0
            ),
            4
          ) || 0
        
      ),0
    )
    const endPricePerUnitInMainCurrency = data.reduce(
      (total, current) => total + Number(math.mul(Number(current.endPricePerUnitInMainCurrency), Number(current?.quantity))
      ),
      0
    );
    const totalPricePerUnitInMainCurrency = data.reduce(
      (total, current) => total + Number(current.endPricePerUnitInMainCurrency),
      0
    );
    const totalCostPerUnitInMainCurrency = data.reduce(
      (total, current) => total + Number(current.costPerUnitInMainCurrency),
      0
    );
    const totalCostOfGoodsSoldInMainCurrency = data.reduce(
      (total, current) => total + Number(current.costOfGoodsSoldInMainCurrency),
      0
    );
    const totalPricePerUnitCurrency = data.reduce(
      (total, current) => total + Number(current.pricePerUnitInMainCurrency),
      0
    );
    const totalProfitOfGoodsSoldInMainCurrency = data.reduce(
      (total, current) => total + 
      Number(
          math.sub(
            math.mul(Number(current.endPricePerUnitInMainCurrency), Number(current?.quantity)),
            Number(current?.costOfGoodsSoldInMainCurrency)
          )
      ),
      0
    );
    return [
      ...data,
      {
        isTotal: true,
        id: 'Toplam dəyər',
        quantity: totalQuantity,
        totalPriceInMainCurrency,
        endPricePerUnitInMainCurrency: formatNumberToLocale(
          defaultNumberFormat(endPricePerUnitInMainCurrency)),
        totalPricePerUnitCurrency:formatNumberToLocale(
          defaultNumberFormat(totalPricePerUnitCurrency)),
        PricePerUnitInMainCurrency:formatNumberToLocale(
          defaultNumberFormat(totalPricePerUnitInMainCurrency)),
        totalCostPerUnitInMainCurrency:formatNumberToLocale(
          defaultNumberFormat(totalCostPerUnitInMainCurrency)),
        totalCostOfGoodsSoldInMainCurrency:formatNumberToLocale(
          defaultNumberFormat(totalCostOfGoodsSoldInMainCurrency)),
          totalProfitOfGoodsSoldInMainCurrency:formatNumberToLocale(
          defaultNumberFormat(totalProfitOfGoodsSoldInMainCurrency)),
        discount:  math.div(totalDiscountPercentage,Number(filters.limit)).toFixed(2),
        discountAmountInMainCurrency:formatNumberToLocale(
          defaultNumberFormat(discountAmountInMainCurrency)),
      },
    ];

  };

  const handlePaginationChange = value => {
    onFilter('page', value);
    return (() => setCurrentPage(value))();
  };

  const handleTakingBackClick = row => {
    history.push({
      pathname: '/sales/operations/add',
      state: { data: row, from: 'sold-items' },
    });
  };

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
  const handleSaveSettingModal = column => {
    let tableColumn = column.filter(col => col.visible === true).map(col => col.dataIndex);
    let filterColumn = column.filter(col => col.dataIndex !== 'id');
    let data = JSON.stringify(filterColumn);
    getColumns({column: tableColumn})
    createTableConfiguration({ moduleName: "Sales-Sold-Items", columnsOrder: data })
    setVisibleColumns(tableColumn);
    setTableSettingData(column);
    toggleVisible(false);
    getExcelColumns()
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
      const column = Sales_SoldItems_TABLE_SETTING_DATA
      .filter(column => column.visible === true)
      .map(column => column.dataIndex);
    setVisibleColumns(column);
    setTableSettingData(Sales_SoldItems_TABLE_SETTING_DATA);
    }
  }, [tableConfiguration]);



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
        key: 'category',
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
        key: 'subCategory',
        width: 130,
        render: (value, row) =>
          row.isTotal ? null : value?.length > 10 ? (
            <Tooltip title={value}>{value.substring(0, 10)}...</Tooltip>
          ) : (
            value
          ),
      };

    columns[column.indexOf('productName')]={
        title: 'Məhsul',
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
        align: 'center',
        width: 100,
        render: (value, row) => formatNumberToLocale(defaultNumberFormat(value || 0)),
      };

    columns[column.indexOf('unitOfmeasuring')]={
        title: 'Ölçü vahidi',
        dataIndex: 'unitOfmeasuring',
        width: '150px',
        align: 'center',
        render: (value, row) => (row.isTotal ? null : value || '-'),
      };

    columns[column.indexOf('pricePerUnitInMainCurrency')]={
        title: 'Vahidin qiyməti',
        dataIndex: 'pricePerUnitInMainCurrency',
        key: 'pricePerUnitInMainCurrency',
        width: '150px',
        align: 'right',
        render: (value, row) =>
          row.isTotal
            ? `${row.totalPricePerUnitCurrency} ${mainCurrencyCode}`
            : `${formatNumberToLocale(
                defaultNumberFormat(value || 0)
              )} ${mainCurrencyCode}`,
      };

    columns[column.indexOf('totalPriceInMainCurrency')]={
        title: 'Toplam qiymət',
        dataIndex: 'totalPriceInMainCurrency',
        key: 'totalPriceInMainCurrency',
        width: '150px',
        align: 'right',
        render: value =>
          `${formatNumberToLocale(
            defaultNumberFormat(value || 0)
          )} ${mainCurrencyCode}`,
      };

    columns[column.indexOf('discountAmountPerUnit')]={
        title: 'Endirim',
        dataIndex: 'discountAmountPerUnit',
        key: 'discountAmountInMainCurrency',
        width: 130,
        align: 'right',
        render: (value, row) =>
        row.isTotal
        ? `${row.discountAmountInMainCurrency} ${mainCurrencyCode}`:
          `${formatNumberToLocale(
            defaultNumberFormat(
              math.mul(
                Number(value) || 0,
                Number(row.quantity) || 0,
                Number(row.rate) || 0
              ) || 0))} ${mainCurrencyCode}`,
      };

    columns[column.indexOf('discountAmountPerUnitPercentage')]={
        title: 'Endirim(%)',
        dataIndex: 'discountAmountPerUnitPercentage',
        width: 120,
        align: 'center',
        render: (value, row) =>
        row.isTotal? `${row.discount} %`:
          `${formatNumberToLocale(
            defaultNumberFormat(
              roundTo(
                math.div(
                  math.mul(
                    Number(row.discountAmountPerUnit || 0) || 0,
                    Number(row.quantity) || 0,
                    Number(row.rate) || 0,
                    100
                  ),
                  row.totalPriceInMainCurrency || 0
                ),
                4
              ) || 0
            )
          )} %`,
      };

    columns[column.indexOf('endPricePerUnitInMainCurrency')]={
        title: 'Son qiymət',
        dataIndex: 'endPricePerUnitInMainCurrency',
        key: 'endPriceInMainCurrency',
        width: 150,
        align: 'right',
        render: (value, row) =>
        row.isTotal
        ? `${row.endPricePerUnitInMainCurrency} ${mainCurrencyCode}`:
          `${formatNumberToLocale(
            defaultNumberFormat(math.mul(Number(value), Number(row?.quantity)))
          )} ${mainCurrencyCode}`,
      };

    columns[column.indexOf('endPricePerUnitInMainCurrencyUnit')]={
        title: 'Vahidin son qiyməti',
        dataIndex: 'endPricePerUnitInMainCurrencyUnit',
        width: '150px',
        align: 'right',
        render: (value, row) =>
          row.isTotal
            ? `${row.PricePerUnitInMainCurrency} ${mainCurrencyCode}`
            : `${formatNumberToLocale(
                defaultNumberFormat(row.endPricePerUnitInMainCurrency || 0)
              )} ${mainCurrencyCode}`,
      };

    if (permissionsByKeyValue.sales_sold_items_cost.permission !== 0) {
      columns[column.indexOf('costPerUnitInMainCurrency')]={
        title: 'Vahidin maya dəyəri',
        dataIndex: 'costPerUnitInMainCurrency',
        width: 180,
        align: 'right',
        render: (value, row) =>
          row.isTotal
            ? `${row.totalCostPerUnitInMainCurrency} ${mainCurrencyCode}`
            : `${formatNumberToLocale(
                defaultNumberFormat(value || 0)
              )} ${mainCurrencyCode}`,
      };
    }
    if (permissionsByKeyValue.sales_sold_items_cost_main.permission !== 0) {
      columns[column.indexOf('costOfGoodsSoldInMainCurrency')]={
        title: 'Maya dəyəri',
        dataIndex: 'costOfGoodsSoldInMainCurrency',
        width: 150,
        align: 'right',
        render: (value, row) =>
          row.isTotal
            ? `${row.totalCostOfGoodsSoldInMainCurrency} ${mainCurrencyCode}`
            : `${formatNumberToLocale(
                defaultNumberFormat(value || 0)
              )} ${mainCurrencyCode}`,
      };
    }
    if (
      permissionsByKeyValue.sales_sold_items_cost_main_total.permission !== 0
    ) {
     columns[column.indexOf('endPricePerUnitInMainCurrencyProfit')]={
        title: 'Mənfəət',
        dataIndex: 'endPricePerUnitInMainCurrencyProfit',
        width: 150,
        align: 'right',
        render: (value, row) =>
          row.isTotal
            ? `${row.totalProfitOfGoodsSoldInMainCurrency} ${mainCurrencyCode}`
            : `${formatNumberToLocale(
                defaultNumberFormat(
                  math.sub(
                    math.mul(Number(row.endPricePerUnitInMainCurrency), Number(row?.quantity)),
                    Number(row?.costOfGoodsSoldInMainCurrency)
                  )
                )
              )} ${mainCurrencyCode}`,
      };
    }
    if (permissionsByKeyValue.sales_sold_items_margin.permission !== 0) {
      columns[column.indexOf('endPricePerUnitInMainCurrencyMargin')]={
        title: 'Marja',
        dataIndex: 'endPricePerUnitInMainCurrencyMargin',
        width: '110px',
        align: 'right',
        render: (value, row) =>
          row.isTotal
            ? null
            : `${formatNumberToLocale(
                defaultNumberFormat(
                  (math.sub(
                    math.mul(Number(row.endPricePerUnitInMainCurrency), Number(row?.quantity)),
                    Number(row?.costOfGoodsSoldInMainCurrency)
                  ) /
                    math.mul(Number(row.endPricePerUnitInMainCurrency), Number(row?.quantity))) *
                    100
                )
              )}%`,
      };
    }

    columns[column.indexOf('operationDate')]={
      title: 'Tarix',
      dataIndex: 'operationDate',
      key: 'operationDate',
      width: '180px',
      render: (value, row) =>
        row.isTotal ? null : `${moment(value).format(fullDateTimeWithSecond)}`,
    };
    columns[column.indexOf('contractNumber')]={
      title: 'Müqavilə',
      dataIndex: 'contractNumber',
      key: 'contractNumber',
      width: '130px',
      render: (value, row) => (row.isTotal ? null :  value?.length > 10 ? (
        <Tooltip title={value}>{value.substring(0, 10)}...</Tooltip>
      ) : (
        value
      ) || '-'),
    };
    columns[column.indexOf('invoiceNumber')]={
      title: 'Qaimə',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: '130px',
    };
    columns[column.indexOf('clientName')]={
      title: 'Alıcı',
      dataIndex: 'clientName',
      key: 'clientName',
      width: 150,
      render: (value, row) =>
        row.isTotal ? null : value?.length > 10 ? (
          <Tooltip title={value}>{value.substring(0, 10)}...</Tooltip>
        ) : (
          value
        ),
    };

    columns[column.indexOf('salesman')]={
      title: 'Satış meneceri',
      dataIndex: 'salesman',
      key: 'salesman',
      width: 150,
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
      key: 'agent',
      width: 150,
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
      ellipsis: {
        showTitle: false,
      },
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
    columns.push({
      title: '',
      dataIndex: '',
      key: 'actions',
      width: 100,
      render: (_, row) =>
        row.isTotal ? null : (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <DetailButton onClick={() => handleDetailClick(row)} />
            <Can
              I={accessTypes.manage}
              a={permissions.return_from_customer_invoice}
            >
              <ProDots>
                <>
                  <ProDotsItem
                    label="Geri al"
                    icon="arrow-down-2"
                    onClick={() => handleTakingBackClick(row)}
                  />
                </>
              </ProDots>
            </Can>
          </div>
        ),
    });
    columns.unshift( {
      title: '№',
      dataIndex: 'id',
      width: 100,
      render: (value, row, index) =>
        row.isTotal ? 'Toplam' : (currentPage - 1) * pageSize + index + 1,
    });

    return columns;
  };


  const getExcelColumns = () => {
    let columnClone = [...visibleColumns];
    columnClone.indexOf('attachmentName') !== -1 && columnClone.splice(columnClone.indexOf('attachmentName'), 1);
    let columns = [];
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

    columns[columnClone.indexOf('pricePerUnitInMainCurrency')] = {
      title: 'Vahidin qiyməti',
      width: { wpx: 120 },
    };
    columns[columnClone.indexOf('totalPriceInMainCurrency')] = {
      title: 'Toplam qiymət',
      width: { wpx: 150 },
    };
    columns[columnClone.indexOf('discountAmountPerUnit')] = {
      title: `Endirim`,
      width: { wpx: 150 },
    };
    columns[columnClone.indexOf('discountAmountPerUnitPercentage')] = {
        title: 'Endirim(%)',
        width: { wpx: 150 },
      };
    columns[columnClone.indexOf('endPricePerUnitInMainCurrency')] = {
      title: 'Son qiymət',
      width: { wpx: 150 },
    };
    columns[columnClone.indexOf('endPricePerUnitInMainCurrencyUnit')] = {
      title: 'Vahidin son qiyməti',
      width: { wpx: 120 },
    };
    columns[columnClone.indexOf('costPerUnitInMainCurrency')]={
        title: 'Vahidin maya dəyəri',
        width: { wpx: 120 },
    };
    columns[columnClone.indexOf('costOfGoodsSoldInMainCurrency')]={
        title: 'Maya dəyəri',
        width: { wpx: 200 },
    };
    columns[columnClone.indexOf('endPricePerUnitInMainCurrencyProfit')] = {
      title: 'Mənfəət',
      width: { wpx: 200 },
    };
    columns[columnClone.indexOf('endPricePerUnitInMainCurrencyMargin')] = {
      title: 'Marja',
      width: { wpx: 200 },
    };
    columns[columnClone.indexOf('operationDate')] = {
      title: 'Tarix',
      width: { wpx: 100 },
    };
    columns[columnClone.indexOf('contractNumber')] = {
      title: 'Müqavilə',
      width: { wpx: 100 },
    };
    columns[columnClone.indexOf('invoiceNumber')] = {
      title: 'Qaimə',
      width: { wpx: 200 },
    };
    columns[columnClone.indexOf('clientName')] = {
      title: 'Alıcı',
      width: { wpx: 150 },
    };
    columns[columnClone.indexOf('salesman')] = {
      title: 'Satış meneceri',
      width: { wpx: 150 },
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
    const data = exSoldItems.map((item, index) => {   
      let arr = []

      columnClone.includes('warehouseName') && (arr[columnClone.indexOf('warehouseName')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value: item.warehouseName || '-', })
      columnClone.includes('rootCatalogName') && (arr[columnClone.indexOf('rootCatalogName')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value: item.rootCatalogName || '-', })
      columnClone.includes('catalogName') && (arr[columnClone.indexOf('catalogName')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value: item.catalogName || '-', })
      columnClone.includes('productName') && (arr[columnClone.indexOf('productName')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value: item.productName || '-', })
      columnClone.includes('quantity') && (arr[columnClone.indexOf('quantity')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value:formatNumberToLocale(defaultNumberFormat(item.quantity)) ||'-', });
      columnClone.includes('unitOfmeasuring') && (arr[columnClone.indexOf('unitOfmeasuring')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value:item.unitOfmeasuring ||'-', });
      columnClone.includes('pricePerUnitInMainCurrency') && (arr[columnClone.indexOf('pricePerUnitInMainCurrency')] =item?.isTotal?
      { value:`${item.totalPricePerUnitCurrency||0} ${mainCurrencyCode}` ||'-',style:columnFooterStyle }:{ value:`${formatNumberToLocale(defaultNumberFormat(item.pricePerUnitInMainCurrency||0))} ${mainCurrencyCode}` ||'-', });
      columnClone.includes('totalPriceInMainCurrency') && (arr[columnClone.indexOf('totalPriceInMainCurrency')] =item?.isTotal?
      { value:`${item.totalPriceInMainCurrency||0} ${mainCurrencyCode}` ||'-',style:columnFooterStyle }: { value:`${formatNumberToLocale(defaultNumberFormat(item.totalPriceInMainCurrency||0))} ${mainCurrencyCode}` ||'-', });
      columnClone.includes('discountAmountPerUnit') && (arr[columnClone.indexOf('discountAmountPerUnit')] =item?.isTotal?
      { value:`${item.discountAmountInMainCurrency} ${mainCurrencyCode}` ||'-',style:columnFooterStyle }: { value:`${formatNumberToLocale(defaultNumberFormat(math.mul(Number(item.discountAmountPerUnit) || 0,Number(item.quantity) || 0,Number(item.rate) || 0) || 0))} ${mainCurrencyCode}` ||'-', });
      columnClone.includes('discountAmountPerUnitPercentage') && (arr[columnClone.indexOf('discountAmountPerUnitPercentage')] =item?.isTotal?
      { value:`${item.discount} %` ||'-', style:columnFooterStyle}: { value:`${formatNumberToLocale(
        defaultNumberFormat(roundTo(math.div(math.mul(
        Number(item.discountAmountPerUnit || 0) || 0,
        Number(item.quantity) || 0,
        Number(item.rate) || 0,100),item.totalPriceInMainCurrency || 0),4) || 0))} %` ||'-', });
      columnClone.includes('endPricePerUnitInMainCurrency') && (arr[columnClone.indexOf('endPricePerUnitInMainCurrency')] =item?.isTotal?
      { value:`${item.endPricePerUnitInMainCurrency} ${mainCurrencyCode}` ||'-', style:columnFooterStyle}: { value:`${formatNumberToLocale(defaultNumberFormat(math.mul(Number(item.endPricePerUnitInMainCurrency), Number(item?.quantity))))} ${mainCurrencyCode}` ||'-', });
      columnClone.includes('endPricePerUnitInMainCurrencyUnit') && (arr[columnClone.indexOf('endPricePerUnitInMainCurrencyUnit')] =item?.isTotal?
      { value:`${item.PricePerUnitInMainCurrency} ${mainCurrencyCode}` ||'-', style:columnFooterStyle}: { value:`${formatNumberToLocale(defaultNumberFormat(item.endPricePerUnitInMainCurrency || 0))} ${mainCurrencyCode}` ||'-', });
      columnClone.includes('costPerUnitInMainCurrency') && (arr[columnClone.indexOf('costPerUnitInMainCurrency')] =item?.isTotal?
      { value:`${item.totalCostPerUnitInMainCurrency} ${mainCurrencyCode}` ||'-',  style:columnFooterStyle}: { value:`${formatNumberToLocale(defaultNumberFormat(item.costPerUnitInMainCurrency || 0))} ${mainCurrencyCode}` ||'-', });
      columnClone.includes('costOfGoodsSoldInMainCurrency') && (arr[columnClone.indexOf('costOfGoodsSoldInMainCurrency')] =item?.isTotal?
      { value:`${item.totalCostOfGoodsSoldInMainCurrency} ${mainCurrencyCode}` ||'-',style:columnFooterStyle }: { value:`${formatNumberToLocale(defaultNumberFormat(item.costOfGoodsSoldInMainCurrency || 0))} ${mainCurrencyCode}` ||'-', });
      columnClone.includes('endPricePerUnitInMainCurrencyProfit') && (arr[columnClone.indexOf('endPricePerUnitInMainCurrencyProfit')] =item?.isTotal?
      { value:`${item.totalProfitOfGoodsSoldInMainCurrency} ${mainCurrencyCode}` ||'-',style:columnFooterStyle }: { value:`${formatNumberToLocale(defaultNumberFormat(math.sub(math.mul(Number(item.endPricePerUnitInMainCurrency), Number(item?.quantity)),Number(item?.costOfGoodsSoldInMainCurrency))))} ${mainCurrencyCode}` ||'-', });
      columnClone.includes('endPricePerUnitInMainCurrencyMargin') && (arr[columnClone.indexOf('endPricePerUnitInMainCurrencyMargin')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value:`${formatNumberToLocale(defaultNumberFormat( (math.sub(
        math.mul(Number(item.endPricePerUnitInMainCurrency), Number(item?.quantity)),
        Number(item?.costOfGoodsSoldInMainCurrency)) /
        math.mul(Number(item.endPricePerUnitInMainCurrency), Number(item?.quantity))) *100))} %` ||'-', });
      columnClone.includes('operationDate') && (arr[columnClone.indexOf('operationDate')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value:moment(item.operationDate).format(fullDateTimeWithSecond) ||'-', });
      columnClone.includes('contractNumber') && (arr[columnClone.indexOf('contractNumber')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value:item.contractNumber || '-', });
      columnClone.includes('invoiceNumber') && (arr[columnClone.indexOf('invoiceNumber')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value:item.invoiceNumber || '-', });
      columnClone.includes('clientName') && (arr[columnClone.indexOf('clientName')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value:item.clientName || '-', });
      columnClone.includes('salesman') && (arr[columnClone.indexOf('salesman')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value:item.salesman || '-', });
      columnClone.includes('agent') && (arr[columnClone.indexOf('agent')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value:item.agent || '-', });
      columnClone.includes('operator') && (arr[columnClone.indexOf('operator')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value:item.operator || '-', });
      columnClone.includes('isServiceType') && (arr[columnClone.indexOf('isServiceType')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value: item.isServiceType ? 'Xidmət' : 'Məhsul' || '-', })
      columnClone.includes('isWithoutSerialNumber') && (arr[columnClone.indexOf('isWithoutSerialNumber')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value: item.isWithoutSerialNumber ? "Yox" : "Hə" || '-', })
      columnClone.includes('barcode') && (arr[columnClone.indexOf('barcode')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value: item.barcode || '-', })
      columnClone.includes('manufacturerName') && (arr[columnClone.indexOf('manufacturerName')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value: item.manufacturerName || '-' })
      columnClone.includes('productCode') && (arr[columnClone.indexOf('productCode')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value: item.productCode || '-', })
      columnClone.includes('pricePerUnit') && (arr[columnClone.indexOf('pricePerUnit')] =item?.isTotal?{value:'',style:columnFooterStyle}: { value:item.pricePerUnit? `${formatNumberToLocale(defaultNumberFormat( Number(item.pricePerUnit||0)))} ${item.currencyCode  || ''}` : '-' })
      columnClone.includes('description') && (arr[columnClone.indexOf('description')] = item?.isTotal?{value:'',style:columnFooterStyle}:{ value: item.description || '-', })
      
     arr.unshift( item.isTotal?{value:'Toplam:',style:columnFooterStyle}:{ value: index + 1, })
      return arr;
     
    })
    setExcelData(data);
  }


  useEffect(() => {
    getExcelColumns()
  }, [visibleColumns])

  useEffect(() => {
    getExcelData()
  }, [exSoldItems]);
  return (
    <div className={styles.GoodTurnovers}>
      <SoldItemsSidebar
        onFilter={onFilter}
        filters={filters}
        fetchBusinessUnitList={fetchBusinessUnitList}
        profile={profile}
        handlePaginationChange={handlePaginationChange}
        thisMonthStart={thisMonthStart}
        thisMonthEnd={thisMonthEnd}
      />
      <DetailsModal
        filters={filters}
        visible={visible}
        setIsVisible={setIsVisible}
        row={selectedRow}
      />
      <TableConfiguration
                saveSetting={handleSaveSettingModal}
                visible={Tvisible}
                AllStandartColumns={Sales_SoldItems_TABLE_SETTING_DATA}
                setVisible={toggleVisible}
                columnSource={tableSettingData}
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
                <Can I={accessTypes.manage} a={permissions.sales_sold_items} >
                  <SettingButton onClick={toggleVisible} />
        
                  <ExportToExcel
                      getExportData={
                      () => fetchAllSoldItems({
                          filters: {...filters, limit: 5000, page:undefined}, onSuccessCallback: data => {
                            setExSoldItems(getTotalData(data.data))
                          }
                      })
                      }
                      data={excelData}
                      columns={excelColumns}
                      excelTitle="Satışlar"
                      excelName="Satışlar"
                      filename="Satışlar"
                      count={total}
                  />
                  </Can>
             </div>
            </Col>
          </Row>
          <Row>
            <Table
              loading={isLoading}
              scroll={{x: 'max-content', y: 500 }}
              columns={getColumns({column: visibleColumns})}
              className={styles.tableFooter}
              dataSource={soldItems?.length > 0 ? getTotalData(soldItems) : []}
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
  soldItems: state.soldItemsReducer.soldItems,
  mainCurrencyCode: state.soldItemsReducer.mainCurrencyCode,
  total: state.soldItemsReducer.total,
  isLoading: state.soldItemsReducer.isLoading,
  actionLoading: state.soldItemsReducer.actionLoading,
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
    fetchProduct,
    fetchAllSoldItems,
    fetchSoldItems, // actions/goods
    fetchBusinessUnitList,
  }
)(SoldItems);
