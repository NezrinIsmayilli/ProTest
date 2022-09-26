import React, { useRef, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Table, Tooltip } from 'antd';
import swal from 'sweetalert';
import { fetchSalesInvoiceList } from 'store/actions/reports/order-report';
import {
  fetchProductionProductOrder,
  deleteProductionProductOrder,
} from 'store/actions/sales-operation';
import {
  formatNumberToLocale,
  defaultNumberFormat,
  roundToDown,
  visualStatuses,
  sortedStatuses,
} from 'utils';
import moment from 'moment';
import { useOrderPermissions } from 'hooks';
import { Button } from 'antd';
import { DetailButton, ProStage } from 'components/Lib';

import styles from './styles.module.scss';
import MoreDetails from './MoreDetails';

function SalesReportDetails(props) {
  const componentRef = useRef();
  const {
    filters,
    orders,
    row,
    tenant,
    fetchSalesInvoiceList,
    deleteProductionProductOrder,
    invoices,
    isLoading,
    type,
    fetchProductionProductOrder,
    fromProduction = false,
    selectedOrdersWithProduct,
    setSelectedOrdersWithProduct,
    deleteProductionProductOrderLoading,
  } = props;
  const [isVisibleDetails, setIsVisibleDetails] = useState(false);

  const [data, setData] = useState();
  const [productionProductOrder, setProductionProductOrder] = useState([]);
  const [permissions, handlePermissionsChange] = useOrderPermissions();

  function onRowClickHandle(data) {
    return {
      onClick: () => {
        setData(data);
      },
    };
  }

  useEffect(() => {
    if (data?.id) {
      handlePermissionsChange(data, tenant?.id === data?.tenantId);
    }
  }, [data]);

  const handleData = invoices => {
    if (invoices.length > 0) {
      return [
        ...invoices.map(invoice => ({
          ...invoice,
          paidInPercentage:
            (roundToDown(invoice.paidAmount || 0) * 100) /
            roundToDown(invoice.endPrice),
          mustPaid:
            roundToDown(invoice.endPrice) -
            roundToDown(invoice.paidAmount || 0),
        })),
      ];
    }
    return [];
  };

  const handleTotalData = invoices => {
    if (invoices.length > 0) {
      const totalendPriceInMainCurrency = invoices.reduce(
        (all, current) => all + roundToDown(current.totalPriceInMainCurrency),
        0
      );
      return [
        {
          isTotal: true,
          totalPriceInMainCurrency: totalendPriceInMainCurrency,
        },
      ];
    }
    return [];
  };
  useEffect(() => {
    if (row && row.id) {
      if (fromProduction) {
        if (row.selectedProductId) {
          fetchProductionProductOrder({
            filters: {
              invoiceProducts: [row.selectedProductId],
            },
            onSuccessCallback: ({ data }) => {
              setProductionProductOrder(data);
            },
          });
        } else {
          setProductionProductOrder([]);
        }
      } else {
        fetchSalesInvoiceList({ filters });
      }
    }
  }, [row, fetchSalesInvoiceList, filters]);

  const handleStatusOptions = (row, statuses) => {
    const filteredStatuses = statuses.filter(
      ({ id }) =>
        id === row.visualStage ||
        (row.canChangeStage &&
          row.availableTransitions
            .map(({ visualStage }) => visualStage)
            .includes(id))
    );
    return filteredStatuses;
  };

  // details modal
  const handleDetailsModal = (row, data) => {
    setIsVisibleDetails(true);
  };
  const handleDeleteClick = (id, orderId, fromFront) => {
    swal({
      title: 'Diqqət!',
      text: 'Sənədi Silmək istədiyinizə əminsiniz?',
      buttons: ['Ləğv et', 'Sil'],
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) {
        const newOrders = selectedOrdersWithProduct.map(item => {
          if (item.productId === row?.id) {
            return {
              ...item,
              orders: item?.orders?.filter(order => order.id !== orderId),
            };
          } else {
            return { ...item };
          }
        });
        // if (fromFront) {
        setSelectedOrdersWithProduct(newOrders);
        // } else {
        //   deleteProductionProductOrder(id, () => {
        //     setSelectedOrdersWithProduct(newOrders);
        //   });
        // }
      }
    });
  };
  const columns = [
    {
      title: '№',
      dataIndex: 'id',
      width: 90,
      render: (_, { isTotal }, index) => (isTotal ? 'Toplam' : index + 1),
    },
    {
      title: 'Sənəd',
      dataIndex: 'serialNumber',
      width: 120,
      align: 'center',
      render: (value, row) =>
        row.isTotal
          ? ''
          : `SFD${moment(
              row?.createdAt?.replace(/(\d\d)-(\d\d)-(\d{4})/, '$3'),
              'YYYY'
            ).format('YYYY')}/${value}`,
    },
    {
      title: 'Tarix',
      dataIndex: 'createdAt',
      render: (value, row) => (row.isTotal ? '' : value),
    },
    {
      title: 'Qarşı tərəf',
      dataIndex: 'partnerName',
      align: 'center',
      ellipsis: true,
      render: (value, row) =>
        row.isTotal ? (
          ''
        ) : (
          <Tooltip placement="topLeft" title={value || ''}>
            <span>{value || '-'}</span>
          </Tooltip>
        ),
    },
    {
      title: `Məbləğ (AZN)`,
      dataIndex: 'totalPriceInMainCurrency',
      width: 120,
      align: 'center',
      render: value =>
        `${formatNumberToLocale(defaultNumberFormat(value))} AZN`,
    },
    {
      title: 'Məhsul sayı',
      dataIndex: 'totalQuantity',
      align: 'center',
      render: (value, row) => (row.isTotal ? '' : value || '-'),
    },
    {
      title: 'Son icra tarix',
      dataIndex: 'deliveryDate',
      align: 'center',
      render: (value, row) => (row.isTotal ? '' : value || 'Sərbəst'),
    },
    {
      title: 'Gecikmə (gün)',
      align: 'center',
      dataIndex: 'daysPassed',
      render: (value, row) => (row.isTotal ? '' : value || '-'),
    },
    {
      title: 'Status',
      dataIndex: 'visualStage',
      align: 'center',
      width: 190,
      render: (value, row) =>
        row.isTotal ? null : (
          <ProStage
            visualStage={visualStatuses[row.visualStage]}
            statuses={handleStatusOptions(row, sortedStatuses)}
            // onChange={newStage => handleStageChange(newStage, row)}
            disabled
          />
        ),
    },
    {
      title: 'Seç',
      width: 100,
      align: 'center',
      render: dataRow =>
        dataRow.isTotal ? (
          ''
        ) : (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <DetailButton onClick={() => handleDetailsModal(dataRow)} />
            {fromProduction ? (
              <Button
                onClick={() => {
                  if (
                    selectedOrdersWithProduct
                      ?.find(item => item.productId === row?.id)
                      ?.orders?.find(order => order.id === dataRow.id)
                      ?.isFrontData
                  ) {
                    handleDeleteClick(false, dataRow.id, true);
                  } else {
                    handleDeleteClick(
                      productionProductOrder?.find(
                        ({ orderId }) => orderId === dataRow.id
                      )?.id,
                      dataRow.id,
                      false
                    );
                  }
                }}
                className={styles.customBtn}
                icon="delete"
              />
            ) : null}
          </div>
        ),
    },
  ];
  return (
    <>
      <div
        ref={componentRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          alignItems: 'center',
        }}
      >
        <div
          id="recievablesActionDropDown"
          className={styles.exportBox}
          style={{
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div className={styles.exportBox}>
            <div className={styles.columnDetailItem}>
              <Tooltip
                placement="topLeft"
                title={
                  type === 'sales-per-sales-managers'
                    ? row.salesman_name
                    : type === 'sales-per-buyers'
                    ? row.client_name
                    : row.name || ''
                }
              >
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: 24,
                    lineHeight: '24px',
                    marginBottom: 10,
                    color: '#373737',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    width: '300px',
                  }}
                >
                  {type === 'sales-per-sales-managers'
                    ? row.salesman_name
                    : type === 'sales-per-buyers'
                    ? row.client_name
                    : row.name}
                </label>
              </Tooltip>
            </div>
          </div>
        </div>

        <div
          className={styles.opInvTable}
          style={{
            width: 'calc(100% + 30px)',
            marginTop: 32,
            maxHeight: 600,
            paddingRight: 8,
            overflowY: 'auto',
            marginRight: -16,
          }}
        >
          <Table
            scroll={{ x: 'max-content' }}
            dataSource={
              fromProduction
                ? handleData(
                    orders?.filter(order =>
                      [
                        ...(productionProductOrder
                          ?.filter(item => item.productId === row?.id)
                          ?.map(productOrder => productOrder.orderId) || []),
                        ...(selectedOrdersWithProduct
                          ?.filter(item => item.productId === row?.id)?.[0]
                          ?.orders?.map(selectedOrder => selectedOrder.id) ||
                          []),
                      ].includes(order.id)
                    )
                  )
                : handleData(invoices)
            }
            loading={isLoading || deleteProductionProductOrderLoading}
            className={styles.invoiceTable}
            columns={columns}
            pagination={false}
            rowKey={record => record.id}
            rowClassName={styles.row}
            onRow={onRowClickHandle}
          />
          {fromProduction
            ? orders?.filter(order =>
                [
                  ...(productionProductOrder
                    ?.filter(item => item.productId === row?.id)
                    ?.map(productOrder => productOrder.orderId) || []),
                  ...(selectedOrdersWithProduct
                    ?.filter(item => item.productId === row?.id)?.[0]
                    ?.orders?.map(selectedOrder => selectedOrder.id) || []),
                ].includes(order.id)
              ).length > 0 && (
                <Table
                  scroll={{ x: 'max-content' }}
                  dataSource={handleTotalData(
                    orders?.filter(order =>
                      [
                        ...(productionProductOrder
                          ?.filter(item => item.productId === row?.id)
                          ?.map(productOrder => productOrder.orderId) || []),
                        ...(selectedOrdersWithProduct
                          ?.filter(item => item.productId === row?.id)?.[0]
                          ?.orders?.map(selectedOrder => selectedOrder.id) ||
                          []),
                      ].includes(order.id)
                    )
                  )}
                  loading={isLoading}
                  className={styles.totalTable}
                  columns={columns}
                  pagination={false}
                  rowKey={record => record.id}
                  rowClassName={styles.row}
                  onRow={onRowClickHandle}
                />
              )
            : invoices.length > 0 && (
                <Table
                  scroll={{ x: 'max-content' }}
                  dataSource={handleTotalData(invoices)}
                  loading={isLoading}
                  className={styles.totalTable}
                  columns={columns}
                  pagination={false}
                  rowKey={record => record.id}
                  rowClassName={styles.row}
                  onRow={onRowClickHandle}
                />
              )}
        </div>
      </div>
      <MoreDetails
        visible={isVisibleDetails}
        setIsVisible={setIsVisibleDetails}
        data={data}
        invoices={invoices}
        permissions={permissions}
      />
    </>
  );
}

const mapStateToProps = state => ({
  invoices: state.orderReportReducer.invoices,
  isLoading: state.orderReportReducer.isLoading,
  tenant: state.tenantReducer.tenant,
  deleteProductionProductOrderLoading:
    state.loadings.deleteProductionProductOrder,
});

export default connect(
  mapStateToProps,
  {
    fetchSalesInvoiceList,
    fetchProductionProductOrder,
    deleteProductionProductOrder,
  }
)(SalesReportDetails);
