import React from 'react';
import { Tooltip } from 'antd';
import {
    CustomTag,
    ProDots,
    ProDotsItem,
    ProTooltip,
    DetailButton,
    ProIcon,
} from 'components/Lib';
import { contactCategories } from 'utils';

import { permissions, accessTypes } from 'config/permissions';
import Can from 'components/Lib/Can';
import CashboxInfoButton from '../CashboxInfoButton';
import styles from './styles.module.scss';

export const getColumns = props => {
    const {
        column,
        pageSize,
        currentPage,
        customerTypes,
        handleDetailClick,
        handleEditClick,
        handleDeleteClick,
        fetchInvoiceListByContactId,
        permissionsList,
        fetchAdvancePaymentByContactId,
    } = props;

    const handleCategoryNames = (categories = []) =>
        categories.map(category => contactCategories[category]?.name);

    const columns = [];

    columns[column.indexOf('name')] = {
        title: 'Partnyor',
        dataIndex: 'name',
        align: 'left',
        width: 180,
        render: (value, row) => (
            <div className={styles.InfoContener}>
                <div className={styles.ellipseDiv}>
                    <Tooltip placement="topLeft" title={value}>
                        <span>{value || '-'}</span>
                    </Tooltip>
                </div>

                <div>
                    {permissionsList.transaction_recievables_report
                        .permission !== 0 &&
                    permissionsList.transaction_payables_report.permission !==
                        0 ? (
                        <CashboxInfoButton
                            fetchInfo={callback =>
                                fetchInvoiceListByContactId(
                                    row?.contactId,
                                    callback
                                )
                            }
                            fetchAdvance={callback =>
                                fetchAdvancePaymentByContactId(
                                    row?.contactId,
                                    {},
                                    callback
                                )
                            }
                        />
                    ) : null}
                </div>
            </div>
        ),
    };
    columns[column.indexOf('email')] = {
        title: 'Email',
        dataIndex: 'email',
        width: 180,
        ellipsis: true,
        render: value => (
            <Tooltip placement="topLeft" title={value}>
                {value || '-'}
            </Tooltip>
        ),
    };
    columns[column.indexOf('phoneNumbers')] = {
        title: 'Mobil telefon',
        dataIndex: 'phoneNumbers',
        key: 'phoneNumbers',
        width: 180,
        render: value => (
            <div>{value && value.length > 0 ? value[0] : '-'}</div>
        ),
    };
    columns[column.indexOf('categoryIds')] = {
        title: 'Kateqoriya',
        dataIndex: 'categoryIds',
        width: 180,
        render: value => (
            <>
                {handleCategoryNames(value)[0] || '-'}
                {handleCategoryNames(value)[0] && (
                    <ProTooltip
                        title={handleCategoryNames(value)}
                        align="right"
                    />
                )}
            </>
        ),
    };
    columns[column.indexOf('priceTypeId')] = {
        title: 'Qiymət tipi',
        dataIndex: 'priceTypeId',
        key: 'priceTypeId',
        ellipsis: true,
        width: 150,
        render: value => (
            <Tooltip
                placement="topLeft"
                title={
                    customerTypes && value && customerTypes.length > 0
                        ? customerTypes.filter(
                              customerType => customerType.id === value
                          )[0]?.name || 'Satış'
                        : 'Satış'
                }
            >
                {customerTypes && value && customerTypes.length > 0
                    ? customerTypes.filter(
                          customerType => customerType.id === value
                      )[0]?.name || 'Satış'
                    : 'Satış'}
            </Tooltip>
        ),
    };
    // {
    //   title: 'Status',
    //   dataIndex: 'showStatus',
    //   key: 'showStatus',
    //   width: '120px',
    //   render: value => <CustomTag label={value ? 'Aktiv' : 'Deaktiv'} />,
    // },
    // {
    //   title: 'Əlavə məlumat',
    //   dataIndex: 'description',
    //   key: 'description',
    //   width: 180,
    //   render: value => (
    //     <div
    //       style={{
    //         display: 'flex',
    //         alignItems: 'center',
    //         justifyContent: 'flex-start',
    //       }}
    //     >
    //       {value && value.substring(0, 30)}
    //       {value && (
    //         <ProTooltip title={value}>
    //           <ProIcon icon="info" width={16} height={16} />
    //         </ProTooltip>
    //       )}
    //     </div>
    //   ),
    // },
    columns[column.indexOf('status')] = {
        title: 'Əlaqə statusu',
        dataIndex: 'status',
        width: 150,
        align: 'center',
        render: (_, row) => (
            <Tooltip
                placement="left"
                title={
                    row.status === 'active'
                        ? 'Qoşulub.'
                        : 'Partnyorluq təklifi göndərilib.'
                }
            >
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#F9F9F9',
                        cursor: 'pointer',
                    }}
                >
                    <img
                        width={20}
                        height={20}
                        src={`/img/icons/${
                            row.status === 'active' ? 'connected' : 'sent-timer'
                        }.svg`}
                        alt="iconAlt"
                        className={styles.icon}
                    />
                </div>
            </Tooltip>
        ),
    };

    // columns[column.indexOf('voen')] = {
    //     title: 'VÖEN',
    //     dataIndex: 'voen',
    //     align: 'left',
    //     width: 150,
    //     ellipsis: true,
    //     render: value => (
    //         <Tooltip placement="topLeft" title={value}>
    //             <span>{value || '-'}</span>
    //         </Tooltip>
    //     ),
    // };
    // columns[column.indexOf('websites')] = {
    //     title: 'Websayt',
    //     dataIndex: 'websites',
    //     align: 'left',
    //     width: 150,
    //     ellipsis: true,
    //     render: value =>
    //         value?.length > 0
    //             ? value?.map(website => <div>{website}</div>)
    //             : '-',
    // };
    // columns[column.indexOf('manager')] = {
    //     title: 'Menecer',
    //     dataIndex: 'manager',
    //     align: 'left',
    //     width: 150,
    //     ellipsis: true,
    //     render: value => 
    //         <>
         
    //         <Tooltip placement="topLeft" title={value[0]}>
    //         {  (value[0]?.length>15?
    //                     value[0]?.slice(0,14)+'...':value[0])||'-'}
    //                      </Tooltip>
            
    //        { value?.length>1 && (
    //             <ProTooltip title={value} align="right">
    //                 <ProIcon width={16} height={16} />
    //             </ProTooltip>
    //         )}
    //         </>
        
    // };
    // columns[column.indexOf('address')] = {
    //     title: 'Ünvan',
    //     dataIndex: 'address',
    //     align: 'left',
    //     width: 150,
    //     ellipsis: true,
    //     render: value => (
    //         <Tooltip placement="topLeft" title={value}>
    //             <span>{value || '-'}</span>
    //         </Tooltip>
    //     ),
    // };
    // columns[column.indexOf('deliveryAddress')] = {
    //     title: 'Çatdırılma ünvanı',
    //     dataIndex: 'deliveryAddress',
    //     align: 'left',
    //     width: 150,
    //     ellipsis: true,
    //     render: value => (
    //         <Tooltip placement="topLeft" title={value}>
    //             <span>{value || '-'}</span>
    //         </Tooltip>
    //     ),
    // };
    // columns[column.indexOf('description')] = {
    //     title: 'Əlavə məlumat',
    //     dataIndex: 'description',
    //     align: 'center',
    //     ellipsis: true,
    //     width: 120,
    //     render: (value, row) =>
    //         value ? (
    //             <Tooltip placement="topLeft" title={value}>
    //                 {value}
    //             </Tooltip>
    //         ) : (
    //             '-'
    //         ),
    // };
    // columns[column.indexOf('createdAt')] = {
    //     title: 'Əməliyyat tarixi',
    //     dataIndex: 'createdAt',
    //     render: (date, row) => date?.split('  '),
    //     width: 180,
    // };
    // columns[column.indexOf('createdBy')] = {
    //     title: 'Əlavə olunub',
    //     dataIndex: 'createdBy',
    //     align: 'center',
    //     ellipsis: true,
    //     width: 120,
    //     render: (value, row) =>
    //         value ? (
    //             <Tooltip placement="topLeft" title={value}>
    //                 {value}
    //             </Tooltip>
    //         ) : (
    //             '-'
    //         ),
    // };
    // columns[column.indexOf('officialName')] = {
    //     title: 'Şirkət adı',
    //     dataIndex: 'officialName',
    //     align: 'center',
    //     ellipsis: true,
    //     width: 120,
    //     render: value =>
    //         value ? (
    //             <Tooltip placement="topLeft" title={value}>
    //                 {value}
    //             </Tooltip>
    //         ) : (
    //             '-'
    //         ),
    // };
    // columns[column.indexOf('generalDirector')] = {
    //     title: 'Baş direktor',
    //     dataIndex: 'generalDirector',
    //     align: 'center',
    //     ellipsis: true,
    //     width: 120,
    //     render: value =>
    //         value ? (
    //             <Tooltip placement="topLeft" title={value}>
    //                 {value}
    //             </Tooltip>
    //         ) : (
    //             '-'
    //         ),
    // };
    // columns[column.indexOf('companyVoen')] = {
    //     title: 'VÖEN (Şirkət)',
    //     dataIndex: 'companyVoen',
    //     align: 'center',
    //     ellipsis: true,
    //     width: 120,
    //     render: value =>
    //         value ? (
    //             <Tooltip placement="topLeft" title={value}>
    //                 {value}
    //             </Tooltip>
    //         ) : (
    //             '-'
    //         ),
    // };
    // columns[column.indexOf('bankName')] = {
    //     title: 'Bank adı',
    //     dataIndex: 'bankName',
    //     align: 'center',
    //     ellipsis: true,
    //     width: 120,
    //     render: value =>
    //         value ? (
    //             <Tooltip placement="topLeft" title={value}>
    //                 {value}
    //             </Tooltip>
    //         ) : (
    //             '-'
    //         ),
    // };
    // columns[column.indexOf('bankVoen')] = {
    //     title: 'VÖEN (Bank)',
    //     dataIndex: 'bankVoen',
    //     align: 'center',
    //     ellipsis: true,
    //     width: 120,
    //     render: value =>
    //         value ? (
    //             <Tooltip placement="topLeft" title={value}>
    //                 {value}
    //             </Tooltip>
    //         ) : (
    //             '-'
    //         ),
    // };
    // columns[column.indexOf('bankCode')] = {
    //     title: 'Kod',
    //     dataIndex: 'bankCode',
    //     align: 'center',
    //     ellipsis: true,
    //     width: 120,
    //     render: value =>
    //         value ? (
    //             <Tooltip placement="topLeft" title={value}>
    //                 {value}
    //             </Tooltip>
    //         ) : (
    //             '-'
    //         ),
    // };
    // columns[column.indexOf('correspondentAccount')] = {
    //     title: 'Müxbir hesab (M/h)',
    //     dataIndex: 'correspondentAccount',
    //     align: 'center',
    //     width: 150,
    //     ellipsis: true,
    //     render: value => (
    //         <Tooltip placement="topLeft" title={value}>
    //             <span>{value || '-'}</span>
    //         </Tooltip>
    //     ),
    // };
    // columns[column.indexOf('settlementAccount')] = {
    //     title: 'Hesablaşma hesabı (H/h)',
    //     dataIndex: 'settlementAccount',
    //     align: 'center',
    //     width: 150,
    //     ellipsis: true,
    //     render: value => (
    //         <Tooltip placement="topLeft" title={value}>
    //             <span>{value || '-'}</span>
    //         </Tooltip>
    //     ),
    // };
    // columns[column.indexOf('swift')] = {
    //     title: 'S.W.I.F.T.',
    //     dataIndex: 'swift',
    //     align: 'center',
    //     width: 150,
    //     ellipsis: true,
    //     render: value => (
    //         <Tooltip placement="topLeft" title={value}>
    //             <span>{value || '-'}</span>
    //         </Tooltip>
    //     ),
    // };

    columns.push({
        title: 'Seç',
        dataIndex: 'actions',
        align: 'center',
        width: 80,
        render: (_, row) => (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <DetailButton
                    style={{ height: '28px' }}
                    onClick={() => handleDetailClick(row)}
                />
                <Can I={accessTypes.manage} a={permissions.partner}>
                    <ProDots>
                        <>
                            <ProDotsItem
                                label="Düzəliş et"
                                icon="pencil"
                                onClick={() => handleEditClick(row)}
                            />
                            <ProDotsItem
                                label="Sil"
                                icon="trash"
                                onClick={() => handleDeleteClick(row.id)}
                            />
                        </>
                    </ProDots>
                </Can>
            </div>
        ),
    });

    columns.unshift({
        title: '№',
        dataIndex: 'id',
        key: 'id',
        width: '80px',
        render: (_value, _item, index) =>
            (currentPage - 1) * pageSize + index + 1,
    });
    return columns;
};
