/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { cookies } from 'utils/cookies';
import { Col, Row, Tooltip, Dropdown, Menu, Modal, Button } from 'antd';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { IoIosArrowDropleft, IoIosArrowDropright } from 'react-icons/io';
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';
import { fetchSalesInvoiceList } from 'store/actions/salesAndBuys';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import {
    fetchTableConfiguration,
    createTableConfiguration,
} from 'store/actions/settings/tableConfiguration';
import {
    AiOutlineDown,
    HiOutlineDocumentDownload,
    BiUnite,
} from 'react-icons/all';
import { SettingButton } from 'components/Lib/Buttons/SettingButton';
import ExportToExcel from 'components/Lib/ExportToExcel';
import { deleteInvoice } from 'store/actions/operations';
import { permissions, accessTypes } from 'config/permissions';
import {
    formatNumberToLocale,
    defaultNumberFormat,
    exportFileDownloadHandle,
    fullDateTimeWithSecond,
} from 'utils';
import { toast } from 'react-toastify';
import swal from '@sweetalert/with-react';
import ExportJsonExcel from 'js-export-excel';
import { fetchSalesBuysForms } from 'store/actions/settings/serialNumberPrefix';
import { fetchAllSalesInvoiceList } from 'store/actions/export-to-excel/stocksModule';
import {
    ExcelButton,
    NewButton,
    Table,
    Can,
    ProDots,
    ProDotsItem,
    DetailButton,
    ProModal,
    TableConfiguration,
} from 'components/Lib';

import { useFilterHandle } from 'hooks';
import moment from 'moment';
import { IoFilterCircleOutline } from 'react-icons/io5';
import { Forms } from '../../SalesBuys/Operations/formModal';
import BronDetails from './bronDetails';
import BronSideBar from './sideBar';
import styles from '../styles.module.scss';
import { BRON_TABLE_SETTING_DATA } from 'utils/table-config/stocksModule';
import { FormItemWrapper } from '@ant-design/charts';
const math = require('exact-math');
const Bron = props => {
    const {
        invoices,
        isLoading,
        fetchSalesInvoiceList,
        fetchAllSalesInvoiceList,
        fetchTableConfiguration,
        createTableConfiguration,
        tableConfiguration,
        deleteInvoice,
        profile,
        fetchBusinessUnitList,
        businessUnits,
        fetchSalesBuysForms,
        salesBuysForms,
        exportFileDownloadHandle,
    } = props;

    const history = useHistory();
    const location = useLocation();
    const baseURL =
        process.env.NODE_ENV === 'production'
            ? process.env.REACT_APP_API_URL
            : process.env.REACT_APP_DEV_API_URL;
    const token = cookies.get('_TKN_');
    const tenantId = cookies.get('__TNT__');

    const [details, setDetails] = useState(false);
    const [formModal, setFormModal] = useState(false);
    const [formsData, setFormsData] = useState(undefined);
    const [selectedRow, setSelectedRow] = useState({});
    const [selectedExportRow, setSelectedExportRow] = useState({});
    const [activeTab, setActiveTab] = useState(0);
    const [allBusinessUnits, setAllBusinessUnits] = useState(undefined);
    const [docs, setDocs] = useState([]);
    const [visible, setVisible] = useState(false);
    const [Tvisible, toggleVisible] = useState(false);
    const [tableSettingData, setTableSettingData] = useState(
        BRON_TABLE_SETTING_DATA
    );
    const [excelData, setExcelData] = useState([]);
    const [excelColumns, setExcelColumns] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [exBrons, setExBrons] = useState([]);
    const [filters, onFilter] = useFilterHandle(
        {
            dateFrom: undefined,
            dateTo: undefined,
            businessUnitIds:
                businessUnits?.length === 1
                    ? businessUnits[0]?.id !== null
                        ? [businessUnits[0]?.id]
                        : undefined
                    : undefined,
            contacts: [],
            contracts: [],
            salesManagers: [],
            products: [],
            isDeleted: undefined,
            bronEndDate: undefined,
            orders: [],
            invoices: undefined,
            limit: 1000,
            invoiceTypes: [9],
        },
        ({ filters }) => {
            fetchSalesInvoiceList({ filters });
        }
    );
    const handleMenuClick = ({ key }) => {
        history.push({
            pathname: location.pathName,
            search: `?tkn_unit=${key == 'null' ? 0 : key}`,
        });
    };
    const menu = (
        <Menu
            style={{ maxHeight: '500px', overflowY: 'auto' }}
            onClick={handleMenuClick}
        >
            {profile.businessUnits?.length === 0
                ? businessUnits?.map(item => (
                      <Menu.Item
                          key={item.id}
                          style={{
                              fontSize: '18px',
                              display: 'flex',
                              alignItems: 'end',
                          }}
                      >
                          <Link
                              to="/warehouse/bron/add"
                              style={{ width: '100%' }}
                          >
                              <BiUnite style={{ marginRight: '5px' }} />
                              {item.name}
                          </Link>
                      </Menu.Item>
                  ))
                : profile?.businessUnits?.map(item => (
                      <Menu.Item
                          key={item.id}
                          style={{
                              fontSize: '18px',
                              display: 'flex',
                              alignItems: 'end',
                          }}
                      >
                          <Link
                              to="/warehouse/bron/add"
                              style={{ width: '100%' }}
                          >
                              <BiUnite style={{ marginRight: '5px' }} />
                              {item.name}
                          </Link>
                      </Menu.Item>
                  ))}
        </Menu>
    );
    useEffect(() => {
        fetchSalesBuysForms();
        fetchBusinessUnitList({
            filters: {
                isDeleted: 0,
                businessUnitIds: profile.businessUnits?.map(({ id }) => id),
            },
        });
        fetchBusinessUnitList({
            filters: {},
            onSuccess: res => {
                setAllBusinessUnits(res.data);
            },
        });
        fetchTableConfiguration({ module: 'Warehouse-Brons' });
    }, []);
    const handleDetailsModal = row => {
        setDetails(!details);
        setSelectedRow(row);
    };
    const onRemoveProduct = (operationId, filters) => {
        swal({
            title: 'Diqqət!',
            text: 'Əməliyyatı silmək istədiyinizə əminsiniz?',
            buttons: ['İmtina', 'Sil'],
            dangerMode: true,
        }).then(willDelete => {
            if (willDelete) {
                deleteInvoice({
                    id: operationId,
                    attribute: {},
                    onSuccess: () => {
                        fetchSalesInvoiceList({
                            filters,
                        });
                    },
                });
            }
        });
    };
    const getStatusType = (isDeleted, bronEndDate) => {
        const bronDate = moment(bronEndDate, 'DD-MM-YYYY HH:mm:ss').format(
            'YYYY-MM-DD HH:mm:ss'
        );
        if (isDeleted) {
            return (
                <span
                    style={{
                        color: '#C4C4C4',
                        background: '#F8F8F8',
                    }}
                    className={styles.chip}
                >
                    Silinib
                </span>
            );
        }
        if (bronEndDate && moment(bronDate) < moment()) {
            return (
                <span
                    style={{
                        color: '#B16FE4',
                        background: '#F6EEFC',
                    }}
                    className={styles.chip}
                >
                    Bitib
                </span>
            );
        }

        if (!bronEndDate || moment(bronDate) > moment()) {
            return (
                <span
                    className={styles.chip}
                    style={{
                        color: '#F3B753',
                        background: '#FDF7EA',
                    }}
                >
                    Aktiv
                </span>
            );
        }
    };
    const handleFormModal = row => {
        setSelectedExportRow(row);
        const formData = salesBuysForms.filter(
            salesBuys => salesBuys.type === 8
        );
        if (
            row.id &&
            (formData.length === 0 || formData?.[0]?.docs?.length === 0)
        ) {
            toast.error('Bu sənəd üzrə ixrac forması yoxdur.');
        } else if (formData?.[0]?.docs?.length === 1) {
            handleDocumentDetailClick(row.id, formData?.[0]?.docs[0]);
        } else {
            setFormModal(true);
            setFormsData(formData);
        }
    };

    useEffect(() => {
        if (!visible) {
            setDocs([]);
        }
    }, [visible]);
    const handleDocumentDetailClick = (file, document) => {
        const newDocs = [
            {
                uri: `${baseURL}/sales/invoices/export/invoice/${file}/${Math.random() *
                    (10000 - 100) +
                    100}?sampleDocumentId=${
                    document?.id
                }&tenant=${tenantId}&token=${token}`,
                name: document.name,
                fileType:
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            },
        ];

        setVisible(true);
        setDocs(newDocs);
    };

    const handleSaveSettingModal = column => {
        let tableColumn = column
            .filter(col => col.visible === true)
            .map(col => col.dataIndex);
        let filterColumn = column.filter(col => col.dataIndex !== 'id');
        let data = JSON.stringify(filterColumn);
        getColumns({ column: tableColumn });
        createTableConfiguration({
            moduleName: 'Warehouse-Brons',
            columnsOrder: data,
        });
        setVisibleColumns(tableColumn);
        setTableSettingData(column);
        toggleVisible(false);
        getExcelColumns();
    };

    // set Table Configuration data and set visible columns
    useEffect(() => {
        if (tableConfiguration?.length > 0 && tableConfiguration !== null) {
            let parseData = JSON.parse(tableConfiguration);
            let columns = parseData
                .filter(column => column.visible === true)
                .map(column => column.dataIndex);
            setVisibleColumns(columns);
            setTableSettingData(parseData);
        } else if (tableConfiguration == null) {
            const column = BRON_TABLE_SETTING_DATA.filter(
                column => column.visible === true
            ).map(column => column.dataIndex);
            setVisibleColumns(column);
            setTableSettingData(BRON_TABLE_SETTING_DATA);
        }
    }, [tableConfiguration]);

    const getColumns = ({ column }) => {
        const columns = [];

        columns[column.indexOf('createdAt')] = {
            title: 'İcra tarixi',
            width: 180,
            dataIndex: 'createdAt',
            render: date => date.replace(/(\d{4})-(\d\d)-(\d\d)/, '$3-$2-$1'),
        };
        columns[column.indexOf('invoiceNumber')] = {
            title: 'Sənəd',
            width: 180,
            dataIndex: 'invoiceNumber',
            render: value => value,
        };
        columns[column.indexOf('stockFromName')] = {
            title: 'Anbar',
            dataIndex: 'stockFromName',
            width: 150,
            ellipsis: true,
            render: value =>
                value ? (
                    <Tooltip placement="topLeft" title={value}>
                        <span>{value}</span>
                    </Tooltip>
                ) : (
                    '-'
                ),
        };
        columns[column.indexOf('clientName')] = {
            title: 'Qarşı tərəf',
            dataIndex: 'clientName',
            width: 150,
            ellipsis: true,
            render: value => (
                <Tooltip placement="topLeft" title={value}>
                    <span>{value || '-'}</span>
                </Tooltip>
            ),
        };
        columns[column.indexOf('totalQuantity')] = {
            title: 'Məhsul miqdarı',
            dataIndex: 'totalQuantity',
            width: 100,
            align: 'center',
            render: value =>
                value ? formatNumberToLocale(defaultNumberFormat(value)) : '-',
        };
        columns[column.indexOf('contractNo')] = {
            title: 'Müqavilə',
            width: 120,
            dataIndex: 'contractNo',
            ellipsis: {
                showTitle: false,
            },
            align: 'center',
            render: value =>
                value?.length > 8 ? (
                    <Tooltip title={value}>{value.substring(0, 8)}...</Tooltip>
                ) : (
                    value || '-'
                ),
        };
        columns[column.indexOf('orderSerialNumber')] = {
            title: 'Sifariş',
            align: 'center',
            width: 180,
            dataIndex: 'orderSerialNumber',
            render: (value, row) =>
                value
                    ? row.orderDirection === 1
                        ? `SFD${moment(
                              row.createdAt?.replace(
                                  /(\d\d)-(\d\d)-(\d{4})/,
                                  '$3'
                              ),
                              'YYYY'
                          ).format('YYYY')}/${value}`
                        : `SFX${moment(
                              row.createdAt?.replace(
                                  /(\d\d)-(\d\d)-(\d{4})/,
                                  '$3'
                              ),
                              'YYYY'
                          ).format('YYYY')}/${value}`
                    : '-',
        };
        columns[column.indexOf('createdAtStart')] = {
            title: 'Başlama tarixi',
            align: 'left',
            width: 180,
            dataIndex: 'createdAtStart',
            render: (_, row) =>
                row.createdAt?.replace(/(\d{4})-(\d\d)-(\d\d)/, '$3-$2-$1'),
        };
        columns[column.indexOf('bronEndDate')] = {
            title: 'Bitmə tarixi',
            align: 'left',
            width: 180,
            dataIndex: 'bronEndDate',
            render: date =>
                date
                    ? date.replace(/(\d{4})-(\d\d)-(\d\d)/, '$3-$2-$1')
                    : 'Müddətsiz',
        };
        columns[column.indexOf('salesmanName')] = {
            title: 'Satış meneceri',
            dataIndex: 'salesmanName',
            align: 'left',
            width: 130,
            render: (value, row) =>
                `${value} ${row.salesmanLastName}`.length > 10 ? (
                    <Tooltip title={`${value} ${row.salesmanLastName}`}>
                        {`${value} ${row.salesmanLastName}`.substring(0, 10)}...
                    </Tooltip>
                ) : (
                    `${value} ${row.salesmanLastName}` || '-'
                ),
        };
        columns[column.indexOf('isDeleted')] = {
            title: 'Status',
            dataIndex: 'isDeleted',
            align: 'center',
            width: 120,
            render: (value, row) => getStatusType(value, row.bronEndDate),
        };
        if (
            allBusinessUnits?.length > 1 &&
            profile.businessUnits?.length !== 1
        ) {
            columns[column.indexOf('businessUnitId')] = {
                title: 'Biznes blok',
                dataIndex: 'businessUnitId',
                align: 'center',
                width: 130,
                ellipsis: true,
                render: value => (
                    <Tooltip
                        placement="topLeft"
                        title={
                            allBusinessUnits?.find(({ id }) => id === value)
                                ?.name
                        }
                    >
                        <span>
                            {
                                allBusinessUnits?.find(({ id }) => id === value)
                                    ?.name
                            }
                        </span>
                    </Tooltip>
                ),
            };
        }
        columns[column.indexOf('operatorName')] = {
            title: 'Əlavə olunub',
            dataIndex: 'operatorName',
            align: 'center',
            width: 150,
            ellipsis: true,
            render: (value, row) => (
                <Tooltip placement="topLeft" title={value}>
                    <span>{`${value} ${row.operatorLastname}` || '-'}</span>
                </Tooltip>
            ),
        };

        columns[column.indexOf('bronDuration')] = {
            title: 'Bron müddəti',
            dataIndex: 'bronDuration',
            align: 'center',
            width: 150,
            ellipsis: true,
            render: (_, row) => (
                <Tooltip
                    placement="topLeft"
                    title={
                        row.bronEndDate
                            ? math.round(
                                  math.div(
                                      Number(
                                          moment(
                                              row.bronEndDate,
                                              fullDateTimeWithSecond
                                          ).diff(
                                              moment(
                                                  row.createdAt,
                                                  fullDateTimeWithSecond
                                              )
                                          )
                                      ) || 0,
                                      86400000
                                  )
                              ) + 1
                            : '-'
                    }
                >
                    <span>
                        {row.bronEndDate
                            ? math.round(
                                  math.div(
                                      Number(
                                          moment(
                                              row.bronEndDate,
                                              fullDateTimeWithSecond
                                          ).diff(
                                              moment(
                                                  row.createdAt,
                                                  fullDateTimeWithSecond
                                              )
                                          )
                                      ) || 0,
                                      86400000
                                  )
                              ) + 1
                            : '-'}
                    </span>
                </Tooltip>
            ),
        };
        columns[column.indexOf('description')] = {
            title: 'Əlavə məlumat',
            dataIndex: 'description',
            align: 'center',
            ellipsis: true,
            width: 120,
            render: (value, row) =>
                value ? (
                    <Tooltip placement="topLeft" title={value}>
                        {value}
                    </Tooltip>
                ) : (
                    '-'
                ),
        };
        columns.push({
            title: 'Seç',
            dataIndex: 'id',
            width: 100,
            align: 'center',
            render: (value, row) => (
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <DetailButton onClick={() => handleDetailsModal(row)} />
                    <Can I={accessTypes.manage} a={permissions.bron_invoice}>
                        <HiOutlineDocumentDownload
                            onClick={() => handleFormModal(row)}
                            style={{
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer',
                            }}
                        />
                        <ProDots isDisabled={row.isDeleted}>
                            <ProDotsItem
                                label="Düzəliş et"
                                icon="pencil"
                                onClick={() =>
                                    history.push(
                                        `/warehouse/bron/edit/${value}`
                                    )
                                }
                            />
                            <ProDotsItem
                                label="Sil"
                                icon="trash"
                                onClick={() => onRemoveProduct(value, filters)}
                            />
                        </ProDots>
                    </Can>
                </div>
            ),
        });
        columns.unshift({
            title: '№',
            width: 60,
            render: (value, row, index) => index + 1,
        });
        return columns;
    };

    const [customFilter, setCustomFilter] = useState(1);
    const getFilteredInvoices = (tableData, customFilter) => {
        if (customFilter === 2) {
            const newtableDatas = tableData.filter(
                ({ bronEndDate, isDeleted }) => {
                    const bronDate = moment(
                        bronEndDate,
                        'DD-MM-YYYY HH:mm:ss'
                    ).format('YYYY-MM-DD HH:mm:ss');
                    if (
                        bronEndDate &&
                        moment(bronDate) < moment() &&
                        !isDeleted
                    ) {
                        return true;
                    }
                    return false;
                }
            );
            return newtableDatas;
        }
        if (customFilter === 1) {
            const newtableDatas = tableData.filter(
                ({ bronEndDate, isDeleted }) => {
                    const bronDate = moment(
                        bronEndDate,
                        'DD-MM-YYYY HH:mm:ss'
                    ).format('YYYY-MM-DD HH:mm:ss');
                    if (!isDeleted) {
                        if (!bronEndDate || moment(bronDate) > moment()) {
                            return true;
                        }
                        return false;
                    }
                }
            );
            return newtableDatas;
        }
        if (customFilter === 3) {
            const newtableDatas = tableData.filter(({ isDeleted }) => {
                if (isDeleted) {
                    return true;
                }
                return false;
            });
            return newtableDatas;
        }
        return tableData;
    };

    const getExcelColumns = () => {
        let columnClone = [...visibleColumns];
        let columns = [];

        columns[columnClone.indexOf('createdAt')] = {
            title: 'İcra tarixi',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('invoiceNumber')] = {
            title: 'Sənəd',
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('stockFromName')] = {
            title: 'Anbar',
            width: { wpx: 200 },
        };
        columns[columnClone.indexOf('clientName')] = {
            title: 'Qarşı tərəf',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('totalQuantity')] = {
            title: 'Məhsul miqdarı',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('contractNo')] = {
            title: 'Müqavilə',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('orderSerialNumber')] = {
            title: 'Sifariş',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('createdAtStart')] = {
            title: 'Başlama tarixi',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('bronEndDate')] = {
            title: 'Bitmə tarixi',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('salesmanName')] = {
            title: 'Satış meneceri',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('isDeleted')] = {
            title: 'Status',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('businessUnitId')] = {
            title: 'Biznes blok',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('operatorName')] = {
            title: 'Əlavə olunub',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf('bronDuration')] = {
            title: 'Bron müddəti',
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('description')] = {
            title: 'Əlavə məlumat',
            width: { wpx: 150 },
        };

        columns.unshift({
            title: '№',
            width: { wpx: 50 },
        });
        setExcelColumns(columns);
    };

    const getExcelData = () => {
        let columnClone = [...visibleColumns];
        const data = exBrons.map((item, index) => {
            let arr = [];
            const bronDate = moment(
                item?.bronEndDate,
                'DD-MM-YYYY HH:mm:ss'
            ).format('YYYY-MM-DD HH:mm:ss');
            columnClone.includes('createdAt') &&
                (arr[columnClone.indexOf('createdAt')] = {
                    value:
                        item.createdAt?.replace(
                            /(\d{4})-(\d\d)-(\d\d)/,
                            '$3-$2-$1'
                        ) || '-',
                });
            columnClone.includes('invoiceNumber') &&
                (arr[columnClone.indexOf('invoiceNumber')] = {
                    value: item.invoiceNumber || '-',
                });
            columnClone.includes('stockFromName') &&
                (arr[columnClone.indexOf('stockFromName')] = {
                    value: item.stockFromName || '-',
                });
            columnClone.includes('clientName') &&
                (arr[columnClone.indexOf('clientName')] = {
                    value: item.clientName || '-',
                });
            columnClone.includes('totalQuantity') &&
                (arr[columnClone.indexOf('totalQuantity')] = {
                    value:
                        formatNumberToLocale(
                            defaultNumberFormat(item.totalQuantity)
                        ) || '-',
                });

            columnClone.includes('contractNo') &&
                (arr[columnClone.indexOf('contractNo')] = {
                    value: item.contractNo || '-',
                });
            columnClone.includes('orderSerialNumber') &&
                (arr[columnClone.indexOf('orderSerialNumber')] = {
                    value: item.orderSerialNumber
                        ? item.orderDirection === 1
                            ? `SFD${moment(
                                  item.createdAt?.replace(
                                      /(\d\d)-(\d\d)-(\d{4})/,
                                      '$3'
                                  ),
                                  'YYYY'
                              ).format('YYYY')}/${item.orderSerialNumber}`
                            : `SFX${moment(
                                  item.createdAt?.replace(
                                      /(\d\d)-(\d\d)-(\d{4})/,
                                      '$3'
                                  ),
                                  'YYYY'
                              ).format('YYYY')}/${item.orderSerialNumber}`
                        : '-' || '-',
                });
            columnClone.includes('createdAtStart') &&
                (arr[columnClone.indexOf('createdAtStart')] = {
                    value:
                        item.createdAt?.replace(
                            /(\d{4})-(\d\d)-(\d\d)/,
                            '$3-$2-$1'
                        ) || '-',
                });
            columnClone.includes('bronEndDate') &&
                (arr[columnClone.indexOf('bronEndDate')] = {
                    value: item.bronEndDate
                        ? item.bronEndDate?.replace(
                              /(\d{4})-(\d\d)-(\d\d)/,
                              '$3-$2-$1'
                          )
                        : 'Müddətsiz',
                });

            columnClone.includes('salesmanName') &&
                (arr[columnClone.indexOf('salesmanName')] = {
                    value:
                        `${item.salesmanName} ${item.salesmanLastName}` || '-',
                });
            columnClone.includes('isDeleted') &&
                (arr[columnClone.indexOf('isDeleted')] = {
                    value: item.isDeleted
                        ? 'Silinib'
                        : item.bronEndDate && moment(bronDate) < moment()
                        ? 'Bitib'
                        : 'Aktiv' || '-',
                });
            columnClone.includes('operatorName') &&
                (arr[columnClone.indexOf('operatorName')] = {
                    value:
                        `${item.operatorName} ${item.operatorLastname}` || '-',
                });
            columnClone.includes('bronDuration') &&
                (arr[columnClone.indexOf('bronDuration')] = {
                    value: item.bronEndDate
                        ? math.round(
                              math.div(
                                  Number(
                                      moment(
                                          item.bronEndDate,
                                          fullDateTimeWithSecond
                                      ).diff(
                                          moment(
                                              item.createdAt,
                                              fullDateTimeWithSecond
                                          )
                                      )
                                  ) || 0,
                                  86400000
                              )
                          )
                        : '-',
                });
            columnClone.includes('businessUnitId') &&
                (arr[columnClone.indexOf('businessUnitId')] = {
                    value:
                        `${
                            allBusinessUnits?.find(
                                ({ id }) => id === item.businessUnitId
                            )?.name
                        }` || '-',
                });

            columnClone.includes('description') &&
                (arr[columnClone.indexOf('description')] = {
                    value: item.description || '-',
                });

            arr.unshift({ value: index + 1 });
            return arr;
        });
        setExcelData(data);
    };

    useEffect(() => {
        getExcelColumns();
    }, [visibleColumns]);

    useEffect(() => {
        getExcelData();
    }, [exBrons]);

    const myHeader = state => {
        if (!state.currentDocument || state.config?.header?.disableFileName) {
            return null;
        }
        return (
            <div className={styles.fileViewer}>
                <h2>{state.currentDocument.name || ''}</h2>
                <a title="Download file" href={state.currentDocument?.uri}>
                    <i
                        aria-label="icon: download"
                        title="Download file"
                        tabIndex="-1"
                        className="anticon anticon-download"
                    >
                        <svg
                            viewBox="64 64 896 896"
                            focusable="false"
                            className={styles.downloadIcon}
                            data-icon="download"
                            width="1.2em"
                            height="1.2em"
                            fill="grey"
                            aria-hidden="true"
                        >
                            <path d="M505.7 661a8 8 0 0 0 12.6 0l112-141.7c4.1-5.2.4-12.9-6.3-12.9h-74.1V168c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v338.3H400c-6.7 0-10.4 7.7-6.3 12.9l112 141.8zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z"></path>
                        </svg>
                    </i>
                </a>
            </div>
        );
    };

    const [openedSidebar, setOpenedSidebar] = React.useState(false);

    return (
        <div>
            <ProModal
                maskClosable
                padding
                width={activeTab === 0 ? 760 : 1200}
                handleModal={handleDetailsModal}
                visible={details}
            >
                <BronDetails
                    row={selectedRow}
                    getStatusType={getStatusType}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onCancel={handleDetailsModal}
                    visible={details}
                    allBusinessUnits={allBusinessUnits}
                    {...props}
                />
            </ProModal>
            <TableConfiguration
                saveSetting={handleSaveSettingModal}
                visible={Tvisible}
                AllStandartColumns={BRON_TABLE_SETTING_DATA}
                setVisible={toggleVisible}
                columnSource={tableSettingData}
            />
            <ProModal
                maskClosable
                padding
                isVisible={visible}
                handleModal={() => setVisible(false)}
                width={900}
            >
                <DocViewer
                    pluginRenderers={DocViewerRenderers}
                    documents={docs}
                    style={{ width: 820, height: 1000 }}
                    config={{
                        header: {
                            overrideComponent: myHeader,
                        },
                    }}
                />
            </ProModal>
            {formsData && formsData.length > 0 ? (
                <Modal
                    className={styles.customModal}
                    footer={null}
                    onCancel={() => setFormModal(false)}
                    closable={false}
                    width={formsData?.[0]?.docs.length > 3 ? 600 : 400}
                    visible={formModal}
                >
                    <Button
                        className={styles.closeButton}
                        size="large"
                        onClick={() => setFormModal(false)}
                    >
                        <img
                            width={14}
                            height={14}
                            src="/img/icons/X.svg"
                            alt="trash"
                            className={styles.icon}
                        />
                    </Button>
                    <Forms
                        handleDocumentDetailClick={handleDocumentDetailClick}
                        row={selectedExportRow}
                        formsData={formsData}
                        onCancel={() => setFormModal(false)}
                        visible={formModal}
                        baseURL={baseURL}
                        token={token}
                        tenantId={tenantId}
                        {...props}
                    />
                </Modal>
            ) : null}
            <BronSideBar
                filters={filters}
                onFilter={onFilter}
                setCustomFilter={setCustomFilter}
                profile={profile}
                openedSidebar={openedSidebar}
                setOpenedSidebar={setOpenedSidebar}
            />
            <section className="scrollbar aside" style={{ padding: '0 32px' }}>
                <Row className={styles.pageToolsContainer}>
                    <Col span={12} align="end" offset={12}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                            }}
                        >
                            <div className={styles.responsiveFilterButton}>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setOpenedSidebar(!openedSidebar)
                                    }
                                >
                                    <IoFilterCircleOutline />
                                </button>
                            </div>
                            <Can
                                I={accessTypes.manage}
                                a={permissions.bron_invoice}
                            >
                                <SettingButton onClick={toggleVisible} />

                                <ExportToExcel
                                    getExportData={() =>
                                        fetchAllSalesInvoiceList({
                                            filters: {
                                                ...filters,
                                                limit: 5000,
                                                page: undefined,
                                            },
                                            onSuccessCallback: data => {
                                                setExBrons(
                                                    getFilteredInvoices(
                                                        data.data,
                                                        customFilter
                                                    )
                                                );
                                            },
                                        })
                                    }
                                    data={excelData}
                                    columns={excelColumns}
                                    excelTitle="Bron Əməliyyatlar"
                                    excelName="Bron Əməliyyatlar"
                                    filename="Bron Əməliyyatlar"
                                    count={
                                        getFilteredInvoices(
                                            invoices,
                                            customFilter
                                        )?.length
                                    }
                                />

                                {profile.businessUnits?.length > 1 ? (
                                    <Dropdown
                                        className={styles.newDropdownBtn}
                                        overlay={menu}
                                    >
                                        <NewButton
                                            label="Bron əlavə et"
                                            style={{ marginLeft: '10px' }}
                                            icon={
                                                <AiOutlineDown
                                                    style={{
                                                        marginLeft: '5px',
                                                    }}
                                                />
                                            }
                                        />
                                    </Dropdown>
                                ) : profile.businessUnits?.length === 1 ? (
                                    <Link to="/warehouse/bron/add">
                                        <NewButton
                                            label="Bron əlavə et"
                                            style={{ marginLeft: '10px' }}
                                        />
                                    </Link>
                                ) : businessUnits?.length === 1 ? (
                                    <Link to="/warehouse/bron/add">
                                        <NewButton
                                            label="Bron əlavə et"
                                            style={{ marginLeft: '10px' }}
                                        />
                                    </Link>
                                ) : (
                                    <Dropdown
                                        className={styles.newDropdownBtn}
                                        overlay={menu}
                                    >
                                        <NewButton
                                            label="Bron əlavə et"
                                            style={{ marginLeft: '10px' }}
                                            icon={
                                                <AiOutlineDown
                                                    style={{
                                                        marginLeft: '5px',
                                                    }}
                                                />
                                            }
                                        />
                                    </Dropdown>
                                )}
                            </Can>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Table
                        columns={getColumns({ column: visibleColumns })}
                        loading={isLoading}
                        dataSource={getFilteredInvoices(invoices, customFilter)}
                        pagination={false}
                    />
                </Row>
            </section>
        </div>
    );
};

const mapStateToProps = state => ({
    invoices: state.salesAndBuysReducer.invoices,
    isLoading: state.loadings.setSalesInvoiceList,
    profile: state.profileReducer.profile,
    businessUnits: state.businessUnitReducer.businessUnits,
    salesBuysForms: state.serialNumberPrefixReducer.salesBuysForms,
    tableConfiguration: state.tableConfigurationReducer.tableConfiguration,
});

export default connect(
    mapStateToProps,
    {
        fetchSalesInvoiceList,
        fetchAllSalesInvoiceList,
        fetchTableConfiguration,
        createTableConfiguration,
        deleteInvoice,
        fetchBusinessUnitList,
        fetchSalesBuysForms,
        exportFileDownloadHandle,
    }
)(Bron);
