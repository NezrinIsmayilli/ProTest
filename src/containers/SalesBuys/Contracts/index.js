/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { cookies } from 'utils/cookies';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { IoIosArrowDropleft, IoIosArrowDropright } from 'react-icons/io';
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';
import { toast } from 'react-toastify';
import swal from '@sweetalert/with-react';
import {
    ExcelButton,
    IconButton,
    NewButton,
    Table,
    Can,
    ProDots,
    ProDotsItem,
    DetailButton,
    ProModal,
    TableConfiguration,
} from 'components/Lib';
// fetchs
import { fetchUsers } from 'store/actions/users';
import { fetchSalesBuysForms } from 'store/actions/settings/serialNumberPrefix';
import { fetchContacts } from 'store/actions/contact';
import { fetchBusinessUnitList } from 'store/actions/businessUnit';
import {
    fetchContracts,
    fetchContractsCount,
    fetchContract,
    deleteContract,
    fetchFilteredContracts,
} from 'store/actions/contracts';
import { fetchAllFilteredContracts } from 'store/actions/export-to-excel/salesBuyModule';
import { fetchCurrencies } from 'store/actions/settings/kassa';
import {
    Row,
    Col,
    Tooltip,
    Pagination,
    Select,
    Dropdown,
    Menu,
    Modal,
    Button,
} from 'antd';
import { Forms } from '../Operations/formModal';
import {
    MdMoreVert,
    AiOutlineDown,
    HiOutlineDocumentDownload,
    BiUnite,
} from 'react-icons/all';
import {
    formatNumberToLocale,
    defaultNumberFormat,
    exportFileDownloadHandle,
} from 'utils';
import {
    fetchTableConfiguration,
    createTableConfiguration,
} from 'store/actions/settings/tableConfiguration';
import { SettingButton } from 'components/Lib/Buttons/SettingButton';
import ExportToExcel from 'components/Lib/ExportToExcel';
import { useFilterHandle } from 'hooks/useFilterHandle';
import { permissions, accessTypes } from 'config/permissions';
import ContractDetail from './contractDetail';
import { AddFormModal } from '../../Settings/#shared';
import styles from './styles.module.scss';
import ContractSideBar from './sideBar';
import queryString from 'query-string';
import { filterQueryResolver } from 'utils';
import { Sales_Contracts_TABLE_SETTING_DATA } from 'utils/table-config/salesBuyModule';
const { Option } = Select;
const roundTo = require('round-to');

function SalesOperationsList(props) {
    const {
        tableConfiguration,
        fetchTableConfiguration,
        createTableConfiguration,
        fetchUsers,
        fetchContacts,
        fetchContracts,
        fetchContractsCount,
        fetchCurrencies,
        fetchFilteredContracts,
        fetchAllFilteredContracts,
        filteredContracts,
        isLoading,
        contractsCount,
        currencies,
        contacts,
        contract,
        fetchContract,
        fetchSalesBuysForms,
        contractsForms,
        users,
        fetchBusinessUnitList,
        businessUnits,
        profile,
        exportFileDownloadHandle,
        deleteContract,
    } = props;

    const baseURL =
        process.env.NODE_ENV === 'production'
            ? process.env.REACT_APP_API_URL
            : process.env.REACT_APP_DEV_API_URL;
    const token = cookies.get('_TKN_');
    const tenantId = cookies.get('__TNT__');

    const [contractsList, setContractsList] = useState([]);
    const pages = [8, 10, 20, 50, 100, contractsCount];
    const [formModal, setFormModal] = useState(false);
    const [formsData, setFormsData] = useState(undefined);
    const [selectedRow, setSelectedRow] = useState({});
    const sectionRef = useRef(null);
    const [description, setDescription] = useState(undefined);
    const history = useHistory();
    const location = useLocation();
    const params = queryString.parse(location.search, {
        arrayFormat: 'bracket',
    });
    const [pageSize, setPageSize] = useState(
        params.limit && !isNaN(params.limit) ? parseInt(params.limit) : 8
    );
    const [currentPage, setCurrentPage] = useState(
        params.page && !isNaN(params.page) ? parseInt(params.page) : 1
    );
    const [details, setDetails] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [allBusinessUnits, setAllBusinessUnits] = useState(undefined);
    const [docs, setDocs] = useState([]);
    const [visible, setVisible] = useState(false);
    const [Tvisible, toggleVisible] = useState(false);
    const [tableSettingData, setTableSettingData] = useState(
        Sales_Contracts_TABLE_SETTING_DATA
    );
    const [excelData, setExcelData] = useState([]);
    const [excelColumns, setExcelColumns] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [exContracts, setExContracts] = useState([]);
    const [filters, onFilter, setFilters] = useFilterHandle(
        {
            types: params.types ? params.types : null,
            directions: params.directions ? params.directions : null,
            responsiblePersons: params.responsiblePersons
                ? params.responsiblePersons
                : undefined,
            relatedContacts: params.relatedContacts
                ? params.relatedContacts
                : undefined,
            dateFrom: params.dateFrom ? params.dateFrom : undefined,
            dateTo: params.dateTo ? params.dateTo : undefined,
            status: params.status ? params.status : null,
            contacts: params.contacts ? params.contacts : undefined,
            contractNo: params.contractNo ? params.contractNo : undefined,
            currencies: params.currencies ? params.currencies : undefined,
            amountFrom: params.amountFrom ? params.amountFrom : undefined,
            amountTo: params.amountTo ? params.amountTo : undefined,
            description: params.description ? params.description : null,
            businessUnitIds: params.businessUnitIds
                ? params.businessUnitIds
                : businessUnits?.length === 1
                ? businessUnits[0]?.id !== null
                    ? [businessUnits[0]?.id]
                    : undefined
                : undefined,
            limit: Number(pageSize),
            page: currentPage, // Number
        },
        ({ filters }) => {
            const query = filterQueryResolver({ ...filters });
            if (typeof filters['history'] == 'undefined') {
                history.push({
                    search: query,
                });
            }
            fetchFilteredContracts(filters);
            fetchContractsCount(filters);
        }
    );

    const [rerender, setRerender] = useState(0);
    const popstateEvent = () => {
        setRerender(rerender + 1);
    };

    useEffect(() => {
        window.addEventListener('popstate', popstateEvent);
        return () => window.removeEventListener('popstate', popstateEvent);
    }, [rerender]);

    useEffect(() => {
        const parmas = queryString.parse(location.search, {
            arrayFormat: 'bracket',
        });

        if (rerender > 0) {
            parmas['history'] = 1;

            if (parmas.page && !isNaN(parmas.page)) {
                setCurrentPage(parseInt(parmas.page));
            }
            setFilters({ ...parmas });
        }
    }, [rerender]);
    const handlePaginationChange = value => {
        onFilter('page', value);
        return (() => setCurrentPage(value))();
    };

    const handlePageSizeChange = (_, size) => {
        onFilter('limit', size);
        onFilter('page', 1); // Need to change page number to 1 (data.length can be less than pageSize * cureentPage)
        return (() => {
            setCurrentPage(1);
            setPageSize(size);
        })();
    };
    const handleMenuClick = ({ key }) => {
        history.push({
            pathname: location.pathName,
            search: `${filterQueryResolver({ ...filters })}&tkn_unit=${
                key == 'null' ? 0 : key
            }`,
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
                              to="/sales/contracts/add"
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
                              to="/sales/contracts/add"
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
        fetchCurrencies();
        if (contacts.length === 0) fetchContacts({});
        fetchContracts({ limit: 1000 }, data => {
            setContractsList(data.data);
        });
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
        fetchTableConfiguration({ module: 'Sales-Contracts' });
    }, []);

    const getContracts = data => {
        if (data.length > 0) {
            return data.map(contract => ({
                ...contract,
                isDeleted: contract.status === 3,
            }));
        }
        return data;
    };
    const onRemoveProduct = () => {
        swal({
            title: 'Diqqət!',
            text: 'Müqaviləni silmək istədiyinizə əminsinizmi?',
            buttons: ['İmtina et', 'Sil'],
            dangerMode: true,
        }).then(willDelete => {
            if (willDelete) {
                deleteContract(selectedRow.id, () => {
                    fetchContracts({ filters });
                });
            }
        });
    };
    useEffect(() => {
        if (selectedRow.id) {
            fetchContract(selectedRow.id);
        }
    }, [selectedRow]);
    useEffect(() => {
        setDescription(contract?.description);
    }, [contract]);
    const handleDetailsModal = row => {
        setDetails(!details);
        setSelectedRow(row);
        setDescription(undefined);
    };
    useEffect(() => {
        if (!visible) {
            setDocs([]);
        }
    }, [visible]);
    const handleDocumentDetailClick = (file, document) => {
        const newDocs = [
            {
                uri: `${baseURL}/sales/contracts/export/${file}/${Math.random() *
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

    const handleFormModal = row => {
        setSelectedRow(row);
        const formData = contractsForms.filter(
            salesBuys => 9 === salesBuys.type
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

    const handleSaveSettingModal = column => {
        let tableColumn = column
            .filter(col => col.visible === true)
            .map(col => col.dataIndex);
        let filterColumn = column.filter(col => col.dataIndex !== 'id');
        let data = JSON.stringify(filterColumn);
        getColumns({ column: tableColumn });
        createTableConfiguration({
            moduleName: 'Sales-Contracts',
            columnsOrder: data,
        });
        setVisibleColumns(tableColumn);
        setTableSettingData(column);
        toggleVisible(false);
        getExcelColumns();
    };
    useEffect(() => {
        if (tableConfiguration?.length > 0 && tableConfiguration !== null) {
            let parseData = JSON.parse(tableConfiguration);
            let columns = parseData
                .filter(column => column.visible === true)
                .map(column => column.dataIndex);
            setVisibleColumns(columns);
            setTableSettingData(parseData);
        } else if (tableConfiguration == null) {
            const column = Sales_Contracts_TABLE_SETTING_DATA.filter(
                column => column.visible === true
            ).map(column => column.dataIndex);
            setVisibleColumns(column);
            setTableSettingData(Sales_Contracts_TABLE_SETTING_DATA);
        }
    }, [tableConfiguration]);

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
                        tabindex="-1"
                        class="anticon anticon-download"
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

    const getColumns = ({ column }) => {
        const columns = [];
        columns[column.indexOf('counterparty_name')] = {
            title: 'Qarşı  tərəf',
            dataIndex: 'counterparty_name',
            width: 200,
            ellipsis: true,
            render: value => (
                <Tooltip placement="topLeft" title={value || ''}>
                    <span>{value || '-'}</span>
                </Tooltip>
            ),
        };
        // {
        //   title: 'Növ',
        //   dataIndex: 'contract_type',
        //   render: type => (type === 1 ? 'Məhsul' : 'Servis'),
        //   width: 120,
        // },
        // {
        //   title: 'İstiqamət',
        //   dataIndex: 'direction',
        //   width: 120,
        //   render: direction => (Number(direction) === 1 ? 'Alış' : 'Satış'),
        // },
        columns[column.indexOf('contract_no')] = {
            title: 'Müqavilə',
            width: 200,
            dataIndex: 'contract_no',
            align: 'left',
            ellipsis: true,
            render: value => (
                <Tooltip placement="topLeft" title={value || ''}>
                    <span>{value || '-'}</span>
                </Tooltip>
            ),
        };
        columns[column.indexOf('responsible_person_name')] = {
            title: 'Məsul şəxs',
            dataIndex: 'responsible_person_name',
            width: 200,
            ellipsis: true,
            render: value => (
                <Tooltip placement="topLeft" title={value || ''}>
                    <span>{value || '-'}</span>
                </Tooltip>
            ),
        };

        columns[column.indexOf('start_date')] = {
            title: 'Başlama tarixi',
            dataIndex: 'start_date',
            width: 150,
            align: 'left',
            render: start_date =>
                String(start_date)
                    .split(' ')[0]
                    .split('-')
                    .reverse()
                    .join('-'),
        };

        columns[column.indexOf('end_date')] = {
            title: 'Bitmə tarixi',
            dataIndex: 'end_date',
            width: 150,
            align: 'left',
            render: end_date =>
                end_date === null
                    ? 'Müddətsiz'
                    : String(end_date)
                          .split(' ')[0]
                          .split('-')
                          .reverse()
                          .join('-'),
        };
        columns[column.indexOf('days_to_end')] = {
            title: 'Günlərin sayı',
            dataIndex: 'days_to_end',
            align: 'center',
            width: 120,
            render: value => value || '-',
        };
        columns[column.indexOf('amount')] = {
            title: 'Məbləğ',
            dataIndex: 'amount',
            align: 'left',
            width: 150,
            render: amount =>
                Number(amount) === 0
                    ? 'Limitsiz'
                    : formatNumberToLocale(defaultNumberFormat(amount)),
        };
        columns[column.indexOf('turnover')] = {
            title: 'Dövriyyə',
            dataIndex: 'turnover',
            align: 'center',
            width: 120,
            render: turnover =>
                turnover === 0
                    ? 0
                    : formatNumberToLocale(defaultNumberFormat(turnover)),
        };
        columns[column.indexOf('rest')] = {
            title: 'Qalıq',
            dataIndex: 'rest',
            align: 'center',
            width: 150,
            render: value =>
                value === 0
                    ? 0
                    : formatNumberToLocale(defaultNumberFormat(value)),
        };
        columns[column.indexOf('status')] = {
            title: 'Status',
            dataIndex: 'status',
            align: 'left',
            width: 150,
            render: statusOfOperation =>
                statusOfOperation === 1 ? (
                    <span
                        className={styles.chip}
                        style={{
                            color: '#55AB80',
                            background: '#EBF5F0',
                        }}
                    >
                        İmzalanıb
                    </span>
                ) : statusOfOperation === 2 ? (
                    <span
                        style={{
                            color: '#B16FE4',
                            background: '#F6EEFC',
                        }}
                        className={styles.chip}
                    >
                        Qaralama
                    </span>
                ) : (
                    <span
                        style={{
                            color: '#C4C4C4',
                            background: '#F8F8F8',
                        }}
                        className={styles.chip}
                    >
                        Silinib
                    </span>
                ),
        };
        columns[column.indexOf('currencycode')] = {
            title: 'Valyuta',
            dataIndex: 'currencycode',
            align: 'left',
            // width: 150,
        };
        columns[column.indexOf('contract_type')] = {
            title: 'Növ',
            width: 100,
            dataIndex: 'contract_type',
            render: (value, row) =>
                value === 1 ? `Məhsul` : value === 2 ? 'Xidmət' : '-',
        };
        columns[column.indexOf('direction')] = {
            title: 'İstiqamət',
            width: 100,
            dataIndex: 'direction',
            render: (value, row) =>
                value === 1 ? `Alış` : value === 2 ? 'Satış' : '-',
        };
        columns[column.indexOf('related_contacts')] = {
            title: 'Əlaqəli tərəflər',
            dataIndex: 'related_contacts',
            width: 160,
            // ellipsis:true,
            render: related_contacts => {
                if (related_contacts.length !== 0)
                    return (
                        <div className={styles.relatedContacts}>
                            <Tooltip
                                placement="topLeft"
                                title={related_contacts[0]}
                            >
                             {related_contacts[0]?.length>15?
                                related_contacts[0]?.slice(0,14)+'...':related_contacts[0]}
                            </Tooltip>

                            {related_contacts.length > 0 && (
                                <Tooltip
                                    placement="right"
                                    overlayStyle={{
                                        whiteSpace: 'pre',
                                    }}
                                    title={related_contacts.map((_, index) =>
                                        index !== 0 ? (
                                            <>
                                                {related_contacts[index]}
                                                <br />
                                            </>
                                        ) : (
                                            ''
                                        )
                                    )}
                                >
                                    <MdMoreVert
                                        style={{ marginLeft: 6 }}
                                        color="#373737"
                                    />
                                </Tooltip>
                            )}
                        </div>
                    );
                return '-';
            },
        };
        if (
            allBusinessUnits?.length > 1 &&
            profile.businessUnits?.length !== 1
        ) {
            columns[column.indexOf('business_unit_id')] = {
                title: 'Biznes blok',
                dataIndex: 'business_unit_id',
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
            width: 120,
            align: 'right',
            render: row => (
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <DetailButton onClick={() => handleDetailsModal(row)} />
                    <div
                        className={
                            row.status === 3
                                ? styles.editDisabled
                                : styles.edittActive
                        }
                        style={{ marginTop: '5px' }}
                    >
                        <Can
                            I={accessTypes.manage}
                            a={permissions.sales_contract}
                        >
                            <HiOutlineDocumentDownload
                                onClick={() => handleFormModal(row)}
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    cursor: 'pointer',
                                }}
                            />
                            <ProDots isDisabled={row.status === 3}>
                                <>
                                    <ProDotsItem
                                        label="Düzəliş et"
                                        icon="pencil"
                                        onClick={() =>
                                            history.push(
                                                `/sales/contracts/edit?id=${row.id}`
                                            )
                                        }
                                    />
                                    <ProDotsItem
                                        label="Sil"
                                        icon="trash"
                                        onClick={onRemoveProduct}
                                    />
                                </>
                            </ProDots>
                        </Can>
                    </div>
                </div>
            ),
        });
        columns.unshift({
            title: '№',
            width: 60,
            render: (value, row, index) =>
                (filters.page - 1) * filters.limit + index + 1,
        });

        return columns;
    };
    const getExcelColumns = () => {
        let columnClone = [...visibleColumns];
        let columns = [];
        columns[columnClone.indexOf('counterparty_name')] = {
            title: 'Qarşı tərəf',
            width: { wpx: 150 },
        };
        columns[columnClone.indexOf(`contract_no`)] = {
            title: `Müqavilə`,
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('responsible_person_name')] = {
            title: `Məsul şəxs`,
            width: { wpx: 150 },
        };

        columns[columnClone.indexOf('start_date')] = {
            title: 'Başlama tarixi',
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('end_date')] = {
            title: 'Bitmə tarixi',
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('days_to_end')] = {
            title: 'Günlərin sayı',
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('amount')] = {
            title: 'Məbləğ',
            width: { wpx: 120 },
        };

        columns[columnClone.indexOf('turnover')] = {
            title: `Dövriyyə`,
            width: { wpx: 200 },
        };

        columns[columnClone.indexOf('rest')] = {
            title: 'Qalıq',
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('status')] = {
            title: 'Status',
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('currencycode')] = {
            title: 'Valyuta',
            width: { wpx: 120 },
        };

        columns[columnClone.indexOf('contract_type')] = {
            title: 'Növ',
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('direction')] = {
            title: 'İstiqamət',
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('related_contacts')] = {
            title: 'Əlaqəli tərəflər',
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('description')] = {
            title: 'Əlavə məlumat',
            width: { wpx: 120 },
        };
        columns[columnClone.indexOf('business_unit_id')] = {
            title: 'Biznes blok',
            width: { wpx: 150 },
        };

        columns.unshift({
            title: '№',
            width: { wpx: 90 },
        });
        setExcelColumns(columns);
    };

    const getExcelData = () => {
        let columnClone = [...visibleColumns];

        const data = exContracts.map((item, index) => {
            let arr = [];
            columnClone.includes('counterparty_name') &&
                (arr[columnClone.indexOf('counterparty_name')] = {
                    value: item.counterparty_name || '-',
                });
            columnClone.includes('contract_no') &&
                (arr[columnClone.indexOf('contract_no')] = {
                    value: item.contract_no || '-',
                });
            columnClone.includes('responsible_person_name') &&
                (arr[columnClone.indexOf('responsible_person_name')] = {
                    value: item.responsible_person_name || '-',
                });
            columnClone.includes('business_unit_id') &&
                (arr[columnClone.indexOf('business_unit_id')] = {
                    value:
                        `${
                            allBusinessUnits?.find(
                                ({ id }) => id === item.business_unit_id
                            )?.name
                        }` || '-',
                });
            columnClone.includes('start_date') &&
                (arr[columnClone.indexOf('start_date')] = {
                    value: item.start_date
                        ? String(item.start_date)
                              .split(' ')[0]
                              .split('-')
                              .reverse()
                              .join('-')
                        : '-',
                });
            columnClone.includes('end_date') &&
                (arr[columnClone.indexOf('end_date')] = {
                    value: item.end_date
                        ? String(item.end_date)
                              .split(' ')[0]
                              .split('-')
                              .reverse()
                              .join('-')
                        : 'Müddətsiz',
                });
            columnClone.includes('days_to_end') &&
                (arr[columnClone.indexOf('days_to_end')] = {
                    value: Number(item.days_to_end) || '-',
                });
            columnClone.includes('amount') &&
                (arr[columnClone.indexOf('amount')] = {
                    value: item.amount
                        ? item.amount == 0
                            ? 'Limitsiz'
                            : Number(item.amount)
                        : '-',
                });
            columnClone.includes('turnover') &&
                (arr[columnClone.indexOf('turnover')] = {
                    value: Number(item.turnover),
                });
            columnClone.includes('rest') &&
                (arr[columnClone.indexOf('rest')] = {
                    value: Number(item.rest) || '-',
                });
            columnClone.includes('status') &&
                (arr[columnClone.indexOf('status')] = {
                    value:
                        item.status == 1
                            ? `İmzalanıb`
                            : item.status === 2
                            ? 'Qaralama'
                            : 'Silinib',
                });
            columnClone.includes('currencycode') &&
                (arr[columnClone.indexOf('currencycode')] = {
                    value: item.currencycode || '-',
                });

            columnClone.includes('contract_type') &&
                (arr[columnClone.indexOf('contract_type')] = {
                    value:
                        item.contract_type == 1
                            ? `Məhsul`
                            : item.contract_type === 2
                            ? 'Xidmət'
                            : '-',
                });
            columnClone.includes('direction') &&
                (arr[columnClone.indexOf('direction')] = {
                    value:
                        item.direction == 1
                            ? `Alış`
                            : item.direction === 2
                            ? 'Satış'
                            : '-',
                });
            columnClone.includes('related_contacts') &&
                (arr[columnClone.indexOf('related_contacts')] = {
                    value:
                        item.related_contacts?.length > 0
                            ? item.related_contacts?.join()
                            : '-',
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
    }, [exContracts]);

    return (
        <section>
            <AddFormModal
                width={activeTab === 0 ? 1000 : 1200}
                withOutConfirm
                onCancel={handleDetailsModal}
                visible={details}
            >
                <ContractDetail
                    profile={profile}
                    row={selectedRow}
                    description={description}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onCancel={handleDetailsModal}
                    visible={details}
                    contract={contract}
                    allBusinessUnits={allBusinessUnits}
                    {...props}
                />
            </AddFormModal>
            <TableConfiguration
                saveSetting={handleSaveSettingModal}
                visible={Tvisible}
                AllStandartColumns={Sales_Contracts_TABLE_SETTING_DATA}
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
                        row={selectedRow}
                        formsData={formsData}
                        onCancel={() => setFormModal(false)}
                        visible={formModal}
                        fromContract={true}
                        baseURL={baseURL}
                        token={token}
                        tenantId={tenantId}
                        {...props}
                    />
                </Modal>
            ) : null}
            <ContractSideBar
                contractsList={contractsList}
                onFilter={onFilter}
                handlePaginationChange={handlePaginationChange}
                filters={filters}
                profile={profile}
                {...props}
            />
            <section className="scrollbar aside" ref={sectionRef}>
                <div
                    id="productActionDropDown"
                    className="container"
                    style={{ marginTop: 30 }}
                >
                    <Row gutter={16}>
                        <Col xl={24} xxl={24} className="paddingBottom70">
                            <Row style={{ marginBottom: '20px' }}>
                                <Col span={24}>
                                    <Can
                                        I={accessTypes.manage}
                                        a={permissions.sales_contract}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'flex-end',
                                            }}
                                        >
                                            <SettingButton
                                                onClick={toggleVisible}
                                            />

                                            <ExportToExcel
                                                getExportData={() =>
                                                    fetchAllFilteredContracts({
                                                        filters: {
                                                            ...filters,
                                                            limit: 5000,
                                                            page: undefined,
                                                        },
                                                        onSuccessCallback: data => {
                                                            setExContracts(
                                                                getContracts(
                                                                    data.data
                                                                )
                                                            );
                                                        },
                                                    })
                                                }
                                                data={excelData}
                                                columns={excelColumns}
                                                excelTitle={`Müqavilələr`}
                                                excelName="Müqavilələr"
                                                filename="Müqavilələr"
                                                count={contractsCount}
                                            />
                                            {profile.businessUnits?.length >
                                            1 ? (
                                                <Dropdown
                                                    className={
                                                        styles.newDropdownBtn
                                                    }
                                                    overlay={menu}
                                                >
                                                    <NewButton
                                                        label="Yeni müqavilə"
                                                        style={{
                                                            marginLeft: '15px',
                                                        }}
                                                        icon={
                                                            <AiOutlineDown
                                                                style={{
                                                                    marginLeft:
                                                                        '5px',
                                                                }}
                                                            />
                                                        }
                                                    />
                                                </Dropdown>
                                            ) : profile.businessUnits
                                                  ?.length === 1 ? (
                                                <Link to="/sales/contracts/add">
                                                    <NewButton
                                                        label="Yeni müqavilə"
                                                        style={{
                                                            marginLeft: '15px',
                                                        }}
                                                    />
                                                </Link>
                                            ) : businessUnits?.length === 1 ? (
                                                <Link to="/sales/contracts/add">
                                                    <NewButton
                                                        label="Yeni müqavilə"
                                                        style={{
                                                            marginLeft: '15px',
                                                        }}
                                                    />
                                                </Link>
                                            ) : (
                                                <Dropdown
                                                    className={
                                                        styles.newDropdownBtn
                                                    }
                                                    overlay={menu}
                                                >
                                                    <NewButton
                                                        label="Yeni müqavilə"
                                                        style={{
                                                            marginLeft: '15px',
                                                        }}
                                                        icon={
                                                            <AiOutlineDown
                                                                style={{
                                                                    marginLeft:
                                                                        '5px',
                                                                }}
                                                            />
                                                        }
                                                    />
                                                </Dropdown>
                                            )}
                                        </div>
                                    </Can>
                                </Col>
                            </Row>
                            <Table
                                loading={isLoading}
                                scroll={{ x: 'max-content' }}
                                dataSource={getContracts(filteredContracts)}
                                columns={getColumns({ column: visibleColumns })}
                                rowKey={record => record.id}
                            />

                            <Row
                                style={{
                                    marginTop: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Col span={8}>
                                    <Pagination
                                        loading={isLoading}
                                        current={currentPage}
                                        className={styles.customPagination}
                                        pageSize={pageSize}
                                        onChange={handlePaginationChange}
                                        total={contractsCount}
                                        size="small"
                                    />
                                </Col>
                                <Col span={6} offset={10} align="end">
                                    <Select
                                        defaultValue={pageSize}
                                        className={styles.pageSize}
                                        size="large"
                                        onChange={e =>
                                            handlePageSizeChange(1, e)
                                        }
                                    >
                                        {pages.map(page => (
                                            <Option
                                                key={page}
                                                value={page}
                                                className={styles.dropdown}
                                            >
                                                {page}
                                            </Option>
                                        ))}
                                    </Select>
                                    <span className={styles.totalNumber}>
                                        Ədəd: {contractsCount}
                                    </span>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
            </section>
        </section>
    );
}

const mapStateToProps = state => ({
    currencies: state.kassaReducer.currencies,
    contracts: state.contractsReducer.contracts,
    contractsCount: state.contractsReducer.contractsCount,
    isLoading: state.contractsReducer.isLoading,
    users: state.usersReducer.users,
    contacts: state.contactsReducer.contacts,
    filteredContracts: state.contractsReducer.filteredContracts,
    contract: state.contractsReducer.contractInfo,
    profile: state.profileReducer.profile,
    contractsForms: state.serialNumberPrefixReducer.contractsForms,
    businessUnits: state.businessUnitReducer.businessUnits,
    tableConfiguration: state.tableConfigurationReducer.tableConfiguration,
});

export default connect(
    mapStateToProps,
    {
        fetchTableConfiguration,
        createTableConfiguration,
        fetchContracts,
        fetchFilteredContracts,
        fetchAllFilteredContracts,
        fetchContractsCount,
        fetchCurrencies,
        fetchContract,
        fetchUsers,
        fetchContacts,
        fetchBusinessUnitList,
        fetchSalesBuysForms,
        exportFileDownloadHandle,
        deleteContract,
    }
)(SalesOperationsList);
