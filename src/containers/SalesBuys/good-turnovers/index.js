import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Row, Col, Tooltip } from 'antd';
import { ExcelButton, Table, DetailButton, Can, ProModal, TableConfiguration } from 'components/Lib';
import { useFilterHandle } from 'hooks/useFilterHandle';
import { fetchGoodsTurnovers } from 'store/actions/operations/goods-turnovers';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import { fetchTableConfiguration, createTableConfiguration } from 'store/actions/settings/tableConfiguration';
import {
  thisMonthStart,
  thisMonthEnd,
  formatNumberToLocale,
  defaultNumberFormat,
} from 'utils';
import { permissions } from 'config';
import { accessTypes } from 'config/permissions';
import TurnoverSidebar from './Sidebar';
import DetailsModal from './DetailsModal';
import styles from './styles.module.scss';
import { SettingButton } from 'components/Lib/Buttons/SettingButton';
import ExportToExcel from 'components/Lib/ExportToExcel';
import { ReactComponent as WithBarcode } from 'assets/img/icons/havebarcode.svg';
import { ReactComponent as WithoutBarcode } from 'assets/img/icons/nothavebarcode.svg';
import { BsCardImage } from 'react-icons/bs';
import Zoom from 'react-medium-image-zoom';
import {fetchProduct} from 'store/actions/product';
import { cookies } from 'utils/cookies';
import BarcodeDetails from '../sold-items/DetailsModal/barcodeDetails';
import { Sales_GoodTurnovers_TABLE_SETTING_DATA } from 'utils/table-config/salesBuyModule';
import { fetchAllGoodsTurnovers } from 'store/actions/export-to-excel/salesBuyModule';

const math = require('exact-math');

const GoodTurnovers = ({
  isLoading,
  goodsTurnovers,
  fetchAllGoodsTurnovers,
  fetchProduct,
  tableConfiguration,
  total,
  createTableConfiguration,
  fetchTableConfiguration,
  fetchGoodsTurnovers,
  fetchBusinessUnitList,
  profile,
}) => {

  const baseURL =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL
    : process.env.REACT_APP_DEV_API_URL;
  const token = cookies.get('_TKN_');
  const tenantId = cookies.get('__TNT__');
  const [visible, setIsVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [businessUnits, setBusinessUnits] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [Tvisible, toggleVisible] = useState(false);
  const [tableSettingData, setTableSettingData] = useState(Sales_GoodTurnovers_TABLE_SETTING_DATA);
  const [excelData, setExcelData] = useState([]);
  const [excelColumns, setExcelColumns] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [exGoodTurnovers, setExGoodTurnovers] = useState([]);
  const [barcodeModalVisible, setBarcodeModalVisible] = useState(false);

  const [filters, onFilter] = useFilterHandle(
    {
      dateFrom: thisMonthStart, // dd-mm-yy
      dateTo: thisMonthEnd, // dd-mm-yy
      parentCatalog: null, // array
      catalog: null, // String
      name: null, // Number
      businessUnitIds:
        businessUnits?.length === 1
          ? businessUnits[0]?.id !== null
            ? [businessUnits[0]?.id]
            : undefined
          : undefined,
    },
    ({ filters }) => {
      fetchGoodsTurnovers({ filters });
    }
  );

  const handleDetailClick = row => {
    setIsVisible(true);
    setSelectedRow({
      ...row,
      end_of_period: math.sub(
        Number(
          math.add(Number(row.start_of_period || 0), Number(row.income || 0))
        ),
        Number(row.outgo || 0)
      ),
    });
  };
  const getFilteredData = (tableData, stocks) => {
    if (stocks.length > 0) {
      const newtableDatas = tableData.filter(({ stock_id }) => {
        if (stocks.length > 0 ? stocks.includes(stock_id) : true) {
          return true;
        }
        return false;
      });
      return newtableDatas;
    }
    return tableData;
  };

  const handleSaveSettingModal = column => {
    let tableColumn = column.filter(col => col.visible === true).map(col => col.dataIndex);
    let filterColumn = column.filter(col => col.dataIndex !== 'id');
    let data = JSON.stringify(filterColumn);
    getColumns({column: tableColumn})
    createTableConfiguration({ moduleName: "Sales-Good-Turnovers", columnsOrder: data })
    setVisibleColumns(tableColumn);
    setTableSettingData(column);
    toggleVisible(false);
    // getExcelColumns()
  };
  const openBarcodeModal = (id) => {
    setBarcodeModalVisible(!barcodeModalVisible)
    if(!barcodeModalVisible) {
      fetchProduct({ id })
    }
  }

  useEffect(()=>{
    fetchTableConfiguration({ module: 'Sales-Good-Turnovers' })
  },[])
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
      const column = Sales_GoodTurnovers_TABLE_SETTING_DATA
      .filter(column => column.visible === true)
      .map(column => column.dataIndex);
    setVisibleColumns(column);
    setTableSettingData(Sales_GoodTurnovers_TABLE_SETTING_DATA);
    }
  }, [tableConfiguration]);


  const getTotalData = (data = []) => {
    if (data.length > 0) {
      const newData = data.map(record => ({
        ...record,
        endOfPeriod: math.sub(
          Number(
            math.add(
              Number(record.start_of_period || 0),
              Number(record.income || 0)
            )
          ),
          Number(record.outgo || 0)
        ),
      }));
      const total_start_of_period = data.reduce(
        (total, current) =>
          math.add(Number(total || 0), Number(current.start_of_period || 0)),
        0
      );

      const total_income = data.reduce(
        (total, current) =>
          math.add(Number(total || 0), Number(current.income || 0)),
        0
      );

      const total_outgo = data.reduce(
        (total, current) =>
          math.add(Number(total || 0), Number(current.outgo || 0)),
        0
      );

      const total_endOfPeriod = newData.reduce(
        (total, current) =>
          math.add(Number(total || 0), Number(current.endOfPeriod || 0)),
        0
      );

      return [
        ...newData,
        {
          last: true,
          id: 'Toplam',
          start_of_period: total_start_of_period,
          income: total_income,
          outgo: total_outgo,
          endOfPeriod: total_endOfPeriod,
        },
      ];
    }
    return [];
  };

  const getColumns = ({column}) => {
  const columns = [];
  columns[column.indexOf('stock_name')]={
      title: 'Anbar',
      dataIndex: 'stock_name',
      width: 130,
      align: 'left',
      render: (value, row) =>
        row.last ? null : value?.length > 10 ? (
          <Tooltip title={value}>{value.substring(0, 10)}...</Tooltip>
        ) : (
          value
        ),
    };
  columns[column.indexOf('catalog_name')]={
      title: 'Kateqoriya',
      dataIndex: 'catalog_name',
      width: 130,
      align: 'left',
      render: (value, row) =>
        row.last ? null : value?.length > 10 ? (
          <Tooltip title={value}>{value.substring(0, 10)}...</Tooltip>
        ) : (
          value
        ),
    };
  columns[column.indexOf('subcatalog_name')]={
      title: 'Alt kateqoriya',
      dataIndex: 'subcatalog_name',
      width: 130,
      render: (value, row) =>
        row.last ? null : value?.length > 10 ? (
          <Tooltip title={value}>{value.substring(0, 10)}...</Tooltip>
        ) : (
          value
        ),
    };
  columns[column.indexOf('product_name')]={
      title: 'Məhsul',
      dataIndex: 'product_name',
      width: 130,
      align: 'left',
      render: (value, row) =>
        row.last ? null : value?.length > 10 ? (
          <Tooltip title={value}>{value.substring(0, 10)}...</Tooltip>
        ) : (
          value
        ),
    };
  columns[column.indexOf('unit_of_measurement_name')]={
      title: 'Ölçü vahidi',
      dataIndex: 'unit_of_measurement_name',
      width: 120,
      align: 'center',
      ellipsis: true,
      render: (value, row) =>
        row.last ? null : (
          <Tooltip placement="topLeft" title={value || ''}>
            <span>{value || '-'}</span>
          </Tooltip>
        ),
    };
  columns[column.indexOf('start_of_period')]={
      title: 'Dövrün əvvəlinə',
      dataIndex: 'start_of_period',
      width: 130,
      align: 'center',
      render: value => formatNumberToLocale(defaultNumberFormat(value || 0)),
    };
  columns[column.indexOf('income')]={
      title: 'Daxil olma',
      dataIndex: 'income',
      width: 130,
      align: 'center',
      render: value => formatNumberToLocale(defaultNumberFormat(value || 0)),
    };
  columns[column.indexOf('outgo')]={
      title: 'Xaric olma',
      dataIndex: 'outgo',
      width: 130,
      align: 'center',
      render: value => formatNumberToLocale(defaultNumberFormat(value || 0)),
    };
  columns[column.indexOf('endOfPeriod')]={
      title: 'Dövrün sonuna',
      dataIndex: 'endOfPeriod',
      width: 130,
      align: 'center',
      render: value => formatNumberToLocale(defaultNumberFormat(value)),
    };

    columns[column.indexOf('isServiceType')] = {
      title: 'Məhsul tipi',
      dataIndex: 'isServiceType',
      width: 120,
      render: (value,row) =>row.last ? '' :  (value ? 'Xidmət' : 'Məhsul'),
    };
    columns[column.indexOf('isWithoutSerialNumber')] = {
      title: 'Seriya nömrəsi',
      dataIndex: 'isWithoutSerialNumber',
      align: 'center',
      width: 120,
      render: (v,row) => row.last ? '' : (v === false ? 'Hə' : 'Yox'),
    };
    columns[column.indexOf('barcode')] = {
      title: 'Barkod',
      dataIndex: 'barcode',
      align: 'center',
      ellipsis: true,
      width: 120,
          render: (value, row) =>row.last ? '' : 
           (value ? <WithBarcode style={{cursor: 'pointer'}} onClick={()=>openBarcodeModal(row.product_id)}/> : <WithoutBarcode />),
    };

    columns[column.indexOf('attachmentName')] = {
      title: 'Şəkil',
      dataIndex: 'attachmentName',
      align: 'center',
      width: 120,
      render: (v, row) =>
      row.last ? '' : 
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
      row.last ? '' : 
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
      render: (value,row) =>row.last ? '' : ( value || '-'),
    };
    columns[column.indexOf('pricePerUnit')]={
      title: 'Satış qiyməti',
      width: 150,
      dataIndex: 'pricePerUnit',
      key: 'pricePerUnit',
      align: 'center',
      render:  (value, row) =>
      row.last
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
      row.last ? '' : 
        (value ? <Tooltip
          placement="topLeft"
          title={value}
        >
          {value}
        </Tooltip> : '-'),
    };
    columns.push({
      title: 'Seç',
      align: 'center',
      width: 80,
      render: (_, row) =>
        row.last ? null : (
          <DetailButton onClick={() => handleDetailClick(row)} />
        ),
    });

    columns.unshift( {
      title: '№',
      dataIndex: 'id',
      width: 90,
      align: 'left',
      render: (value, row, index) => (row.last ? value : index + 1),
    });
  
  return columns;
}

const getExcelColumns = () => {
  let columnClone = [...visibleColumns];
  columnClone.indexOf('attachmentName') !== -1 && columnClone.splice(columnClone.indexOf('attachmentName'), 1);
  let columns = []
  columns[columnClone.indexOf('stock_name')] = {
    title: 'Anbar',
    width: { wpx: 150 },
  };
  columns[columnClone.indexOf('catalog_name')] = {
    title: 'Kateqoriya',
    width: { wpx: 150 },
  };

  columns[columnClone.indexOf('subcatalog_name')] = {
    title: 'Alt kateqoriya',
    width: { wpx: 150 },
  };
  
  columns[columnClone.indexOf('product_name')] = {
    title: 'Məhsul',
    width: { wpx: 200 },
  };

  columns[columnClone.indexOf('unit_of_measurement_name')] = {
    title: 'Ölçü vahidi',
    width: { wpx: 150 },
  };

  columns[columnClone.indexOf('start_of_period')] = {
    title: 'Dövrün əvvəlinə',
    width: { wpx: 150 },
  };
  columns[columnClone.indexOf('income')] = {
    title: 'Daxil olma',
    width: { wpx: 150 },
  };
  columns[columnClone.indexOf('outgo')] = {
    title: `Xaric olma`,
    width: { wpx: 150 },
  };
  columns[columnClone.indexOf('endOfPeriod')] = {
      title: 'Dövrün sonuna',
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
    width: { wpx: 50 },
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
  const data = exGoodTurnovers.map((item, index) => {   
    let arr = []

    columnClone.includes('stock_name') && (arr[columnClone.indexOf('stock_name')] =item?.last?{value:'',style:columnFooterStyle}:{ value: item.stock_name || '-', })
    columnClone.includes('catalog_name') && (arr[columnClone.indexOf('catalog_name')] =item?.last?{value:'',style:columnFooterStyle}: { value: item.catalog_name || '-', })
    columnClone.includes('subcatalog_name') && (arr[columnClone.indexOf('subcatalog_name')] =item?.last?{value:'',style:columnFooterStyle}: { value: item.subcatalog_name || '-', })
    columnClone.includes('product_name') && (arr[columnClone.indexOf('product_name')] =item?.last?{value:'',style:columnFooterStyle}: { value: item.product_name || '-', })
    columnClone.includes('unit_of_measurement_name') && (arr[columnClone.indexOf('unit_of_measurement_name')] =item?.last?{value:'',style:columnFooterStyle}: { value:item.unit_of_measurement_name ||'-', });
    columnClone.includes('start_of_period') && (arr[columnClone.indexOf('start_of_period')] = { value:`${formatNumberToLocale(defaultNumberFormat(item.start_of_period||0))}` ||'-', style:item?.last?columnFooterStyle:'' });
    columnClone.includes('income') && (arr[columnClone.indexOf('income')] = { value:`${formatNumberToLocale(defaultNumberFormat(item.income||0))}` ||'-',style:item?.last?columnFooterStyle:''  });
    columnClone.includes('outgo') && (arr[columnClone.indexOf('outgo')] = { value:`${formatNumberToLocale(defaultNumberFormat(item.outgo||0))}` ||'-',style:item?.last?columnFooterStyle:''  });
    columnClone.includes('endOfPeriod') && (arr[columnClone.indexOf('endOfPeriod')] = { value:`${formatNumberToLocale(defaultNumberFormat(item.endOfPeriod))}` ||'-',style:item?.last?columnFooterStyle:''  });
    columnClone.includes('isServiceType') && (arr[columnClone.indexOf('isServiceType')] = item?.last?{value:'',style:columnFooterStyle}:{ value: item.isServiceType ? 'Xidmət' : 'Məhsul' || '-', })
    columnClone.includes('isWithoutSerialNumber') && (arr[columnClone.indexOf('isWithoutSerialNumber')] =item?.last?{value:'',style:columnFooterStyle}: { value: item.isWithoutSerialNumber ? "Yox" : "Hə" || '-', })
    columnClone.includes('barcode') && (arr[columnClone.indexOf('barcode')] = item?.last?{value:'',style:columnFooterStyle}:{ value: item.barcode || '-', })
    columnClone.includes('manufacturerName') && (arr[columnClone.indexOf('manufacturerName')] =item?.last?{value:'',style:columnFooterStyle}: { value: item.manufacturerName || '-' })
    columnClone.includes('productCode') && (arr[columnClone.indexOf('productCode')] =item?.last?{value:'',style:columnFooterStyle}: { value: item.productCode || '-', })
    columnClone.includes('pricePerUnit') && (arr[columnClone.indexOf('pricePerUnit')] =item?.last?{value:'',style:columnFooterStyle}: { value: item.pricePerUnit?`${formatNumberToLocale(defaultNumberFormat( Number(item.pricePerUnit||0)))} ${item.currencyCode  || ''}` : '-' })
    columnClone.includes('description') && (arr[columnClone.indexOf('description')] =item?.last?{value:'',style:columnFooterStyle}: { value: item.description || '-', })
    
 
   arr.unshift(item?.last?{value:'Toplam:',style:columnFooterStyle}:{ value: index + 1, })
    return arr;
   
  })
  setExcelData(data);
}


useEffect(() => {
  getExcelColumns()
}, [visibleColumns])

useEffect(() => {
  getExcelData()
}, [exGoodTurnovers]);

  return (
    <div className={styles.GoodTurnovers}>
      <TurnoverSidebar
        onFilter={onFilter}
        setStocks={setStocks}
        filters={filters}
        businessUnits={businessUnits}
        setBusinessUnits={setBusinessUnits}
        profile={profile}
        fetchBusinessUnitList={fetchBusinessUnitList}
      />
       <TableConfiguration
                saveSetting={handleSaveSettingModal}
                visible={Tvisible}
                AllStandartColumns={Sales_GoodTurnovers_TABLE_SETTING_DATA}
                setVisible={toggleVisible}
                columnSource={tableSettingData}
            />
      <ProModal
        maskClosable
        padding
        width={1100}
        handleModal={openBarcodeModal}
        isVisible={barcodeModalVisible}
      ><BarcodeDetails fromTable/></ProModal>

      <DetailsModal
        visible={visible}
        setIsVisible={setIsVisible}
        row={selectedRow}
        filters={filters}
      />
      <section className="scrollbar aside">
        <Row style={{ margin: '0 32px' }}>
          <Row style={{ margin: '20px 0' }}>
            <Can I={accessTypes.manage} a={permissions.sales_turnover}>
              <Col span={6} align="end" offset={18}>
              <div 
             style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
              }}>
              <SettingButton onClick={toggleVisible} />
        
        <ExportToExcel
            getExportData={
            () => fetchAllGoodsTurnovers({
                filters: {...filters, limit: 5000, page:undefined}, onSuccessCallback: data => {
                  setExGoodTurnovers(getTotalData(getFilteredData(Object.values(data?.data), stocks)))
                }
            })
            }
            data={excelData}
            columns={excelColumns}
            excelTitle="Dövriyyə"
            excelName="Dövriyyə"
            filename="Dövriyyə"
            count={getFilteredData(goodsTurnovers, stocks)?.length||0}
        />
        </div>
              </Col>
            </Can>
          </Row>
          <Row style={{ marginBottom: '30px' }}>
            <Table
              loading={isLoading}
              scroll={{ x: 'max-content', y: 600 }}
              columns={getColumns({column: visibleColumns})}
              className={styles.tableFooter}
              dataSource={
                goodsTurnovers?.length > 0
                  ? getTotalData(getFilteredData(goodsTurnovers, stocks))
                  : []
              }
            />
          </Row>
        </Row>
      </section>
    </div>
  );
};

const mapStateToProps = state => ({
  goodsTurnovers: state.goodsTurnoversReducer.goodsTurnovers,
  total: state.goodsTurnoversReducer.total,
  total: state.goodsTurnoversReducer.total,
  isLoading: state.goodsTurnoversReducer.isLoading,
  actionLoading: state.goodsTurnoversReducer.actionLoading,
  profile: state.profileReducer.profile,
  businessUnits: state.businessUnitReducer.businessUnits,
  tableConfiguration: state.tableConfigurationReducer.tableConfiguration,
});

export default connect(
  mapStateToProps,
  {
    fetchAllGoodsTurnovers,
    createTableConfiguration,
    fetchProduct,
    fetchTableConfiguration,
    fetchGoodsTurnovers, // actions/goods
    fetchBusinessUnitList,
  }
)(GoodTurnovers);
