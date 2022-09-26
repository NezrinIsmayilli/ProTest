/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Link, useHistory, useLocation } from 'react-router-dom';
import {
  ExcelButton,
  IconButton,
  Can,
  DetailButton,
  ProDots,
  ProDotsItem,
  ProModal,
} from 'components/Lib';
// fetchs
import { fetchUsers } from 'store/actions/users';
import { fetchStructures } from 'store/actions/structure';
import { fetchFilteredStructures } from 'store/actions/structure';
import { fetchStocks } from 'store/actions/stock';
import { fetchAllCashboxNames, fetchFilteredCashboxes } from 'store/actions/settings/kassa';
import {
  fetchBusinessUnitList,
  deleteBusinessUnit,
} from 'store/actions/businessUnit';
import { fetchProductPriceTypes, fetchFilteredProductPriceTypes } from 'store/actions/settings/mehsul';
import {fetchSalesReports} from 'store/actions/reports/sales-report';
import { fetchFilteredStocks } from 'store/actions/stock';
import { Row, Col, Table, Tooltip } from 'antd';
import { useFilterHandle } from 'hooks/useFilterHandle';
import { permissions, accessTypes } from 'config/permissions';
import { FaCaretUp, FaCaretDown } from 'react-icons/all';
import { DeleteModal } from 'containers/SalesBuys/Production/deleteModal';
import styles from '../styles.module.scss';
import BusinessUnitSideBar from './sideBar';
import BusinessUnitDetail from './businessUnitDetail';
import { filterQueryResolver} from 'utils';
import queryString from 'query-string';


function BusinessUnitTab(props) {
  const {
    fetchBusinessUnitList,
    fetchSalesInvoiceSearch,
    fetchUsers,
    fetchStructures,
    fetchStocks,
    fetchAllCashboxNames,
    fetchProductPriceTypes,
    profile,
    fetchFilteredStocks,
    fetchFilteredStructures,
    deleteBusinessUnit,

    allCashBoxNames,
    businessUnits,

    isLoading,
    actionLoading,
    permissionsByKeyValue
  } = props;
  const [deleteModalVisibe, setDeleteModalVisibe] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const sectionRef = useRef(null);
  const history = useHistory();
  const [details, setDetails] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [filterSelectedStocks, setFilterSelectedStocks] = useState([]);
  const [filterSelectedTenantPersons,setFilterSelectedTenantPersons,] = useState([]);
  const [filterSelectedStructures,setFilterSelectedStructures] = useState([])
  const [filterSelectedCashBoxes, setFilterSelectedCashBoxes] = useState([])
  const [filterSelectedProductPriceTypes, setFilterSelectedProductPriceTypes] = useState([]);

  const { business_unit } = permissionsByKeyValue;
  const isEditDisabled = business_unit.permission === 2;

  const location = useLocation();
  const params = queryString.parse(location.search, {
    arrayFormat: 'bracket',
});
  const [filters, onFilter] = useFilterHandle(
    {
      orderBy: undefined,
      order: undefined,
      isDeleted: params.isDeleted ? params.isDeleted : 0,
      page:   params.page && !isNaN(params.page) ? parseInt(params.page) : 1,
      limit:   params.limit && !isNaN(params.limit) ? parseInt(params.limit) : 8,
      businessUnitIds:
      params.businessUnitIds ? params.businessUnitIds:
       ( businessUnits?.length === 1
          ? businessUnits[0]?.id !== null
            ? [businessUnits[0]?.id]
            : undefined
          : undefined),
      stocks: params.stocks ? params.stocks : undefined,
      tenantPersons: params.tenantPersons
      ? params.tenantPersons
      : undefined,
      structures: params.structures
      ? params.structures
      : undefined,
      cashboxes: params.cashboxes
      ? params.cashboxes
      : undefined,
      priceTypes: params.priceTypes
      ? params.priceTypes
      : undefined
      
    },
    ({ filters }) => {
      const query = filterQueryResolver( { ...filters});
      if(typeof(filters['history'])=='undefined') {
          history.push({
              search: query,
          });
      }
      fetchSalesReports(filters.type, filters);

      fetchBusinessUnitList({ filters });
    }
  );


  const handleSortTable = (orderBy, order) => {
    onFilter('order', order);
    onFilter('orderBy', orderBy);
  };
  useEffect(() => {
    fetchUsers({});
    fetchStructures();
    fetchStocks();
    fetchAllCashboxNames();
    fetchProductPriceTypes();
  }, []);
  const removeBusinessUnit = row => {
    setDeleteModalVisibe(true);
    setSelectedRow(row);
  };
  const handleDeleteOperation = (id, reason) => {
    deleteBusinessUnit(id, reason, deleteSuccess);
  };

  const deleteSuccess = () => {
    fetchBusinessUnitList({ filters });
  };
  const handleDetailsModal = row => {
    setDetails(!details);
    setSelectedRow(row);
  };

  useEffect(() => {
    fetchBusinessUnitList({
      filters: {
        isDeleted: 0,
        businessUnitIds: profile.businessUnits?.map(({ id }) => id),
      },
    });
  }, []);

  useEffect(() => {
    if (params.stocks) {
        fetchFilteredStocks({
            filters: { ids: params.stocks.map(Number) },
            onSuccessCallback: ({ data }) => {
                const appendList = [];

                if (data) {
                    data.forEach(element => {
                        appendList.push({
                            id: element.id,
                            name: element.name,
                            ...element,
                        });
                    });
                }
                setFilterSelectedStocks(appendList);
            },
        });
    }
    if (params.cashboxes) {
      fetchFilteredCashboxes({
          filters: { ids: params.cashboxes.map(Number) },
          onSuccessCallback: ({ data }) => {
              const appendList = [];

              if (data) {
                  data.forEach(element => {
                      appendList.push({
                          id: element.id,
                          name: element.name,
                          ...element,
                      });
                  });
              }
              setFilterSelectedCashBoxes(appendList);
          },
      });
  }
  if (params.priceTypes) {
    fetchFilteredProductPriceTypes({
        filters: { ids: params.priceTypes.map(Number) },
        onSuccessCallback: ({ data }) => {
            const appendList = [];

            if (data) {
                data.forEach(element => {
                    appendList.push({
                        id: element.id,
                        name: element.name,
                        ...element,
                    });
                });
            }
            setFilterSelectedProductPriceTypes(appendList);
        },
    });
}
if (params.structures) {
  fetchFilteredStructures({
      filters: { ids: params.structures.map(Number) },
      onSuccessCallback: data => {
          const appendList = [];
          if (data) {
              data.forEach(element => {
                  appendList.push({
                      id: element.id,
                      name: element.name,
                      ...element,
                  });
              });
          }
          setFilterSelectedStructures(appendList);
      },
  });
}
    if (params.tenantPersons) {
      fetchUsers({
          filters: { ids: params.tenantPersons.map(Number) },
          onSuccessCallback: data => {
              const appendList = [];
              if (data.data) {
                  data.data.forEach(element => {
                      appendList.push({
                          id: element.id,
                          name: element.name,
                          ...element,
                      });
                  });
              }
              setFilterSelectedTenantPersons(appendList);
          },
      });
  }
}, []);

  const getStatusType = isDeleted => {
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
  };
  const columns = [
    {
      title: '№',
      width: 50,
      render: (value, row, index) => index + 1,
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>Blokun adı</span>
          <div className={styles.buttonSortIcon}>
            <FaCaretUp
              color={
                filters.orderBy === 'name' && filters.order === 'asc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('name', 'asc')}
            />
            <FaCaretDown
              color={
                filters.orderBy === 'name' && filters.order === 'desc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('name', 'desc')}
            />
          </div>
        </div>
      ),
      dataIndex: 'name',
      width: 150,
      ellipsis: true,
      render: value => (
        <Tooltip placement="topLeft" title={value || ''}>
          <span>{value || '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Blokun növü',
      dataIndex: 'type',
      render: value => value || 'Bölmə',
      width: 100,
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>İstifadəçi</span>
          <div className={styles.buttonSortIcon}>
            <FaCaretUp
              color={
                filters.orderBy === 'tenantPersonsCount' &&
                filters.order === 'asc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('tenantPersonsCount', 'asc')}
            />
            <FaCaretDown
              color={
                filters.orderBy === 'tenantPersonsCount' &&
                filters.order === 'desc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('tenantPersonsCount', 'desc')}
            />
          </div>
        </div>
      ),
      dataIndex: 'tenantPersons',
      align: 'center',
      width: 190,
      ellipsis: true,
      render: (value, row) => (
        <Tooltip
          placement="topLeft"
          title={value && value.length > 0 ? value[0].name : ''}
        >
          <span>
            {value && value.length > 0 ? (
              value.length > 1 ? (
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <span className={styles.ellipsisDiv}>
                    {`${value[0].name} ${
                      value[0].surname ? value[0].surname : ''
                    }`}
                  </span>
                  <Tooltip
                    placement="right"
                    title={
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {value.map(person => (
                          <span>{`${person.name} ${
                            person.surname ? person.surname : ''
                          }`}</span>
                        ))}
                      </div>
                    }
                  >
                    <span className={styles.serialNumberCount}>
                      {row.tenantPersonsCount}
                    </span>
                  </Tooltip>
                </div>
              ) : (
                `${value[0].name} ${value[0].surname ? value[0].surname : ''}`
              )
            ) : (
              '-' || '-'
            )}
          </span>
        </Tooltip>
      ),
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>Bölmə</span>
          <div className={styles.buttonSortIcon}>
            <FaCaretUp
              color={
                filters.orderBy === 'structuresCount' && filters.order === 'asc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('structuresCount', 'asc')}
            />
            <FaCaretDown
              color={
                filters.orderBy === 'structuresCount' &&
                filters.order === 'desc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('structuresCount', 'desc')}
            />
          </div>
        </div>
      ),
      width: 150,
      align: 'center',
      dataIndex: 'structures',
      ellipsis: true,
      render: (value, row) => (
        <Tooltip
          placement="topLeft"
          title={value && value.length > 0 ? value[0].name : ''}
        >
          <span>
            {value && value.length > 0 ? (
              value.length > 1 ? (
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <span className={styles.ellipsisDiv}>{value[0].name}</span>
                  <Tooltip
                    placement="right"
                    title={
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {value.map(structure => (
                          <span>{structure.name}</span>
                        ))}
                      </div>
                    }
                  >
                    <span className={styles.serialNumberCount}>
                      {row.structuresCount}
                    </span>
                  </Tooltip>
                </div>
              ) : (
                value[0].name
              )
            ) : (
              '-' || '-'
            )}
          </span>
        </Tooltip>
      ),
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>Anbar</span>
          <div className={styles.buttonSortIcon}>
            <FaCaretUp
              color={
                filters.orderBy === 'stocksCount' && filters.order === 'asc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('stocksCount', 'asc')}
            />
            <FaCaretDown
              color={
                filters.orderBy === 'stocksCount' && filters.order === 'desc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('stocksCount', 'desc')}
            />
          </div>
        </div>
      ),
      width: 150,
      dataIndex: 'stocks',
      align: 'center',
      ellipsis: true,
      render: (value, row) => (
        <Tooltip
          placement="topLeft"
          title={value && value.length > 0 ? value[0].name : ''}
        >
          <span>
            {value && value.length > 0 ? (
              value.length > 1 ? (
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <span className={styles.ellipsisDiv}>{value[0].name}</span>
                  <Tooltip
                    placement="right"
                    title={
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {value.map(stock => (
                          <span>{stock.name}</span>
                        ))}
                      </div>
                    }
                  >
                    <span className={styles.serialNumberCount}>
                      {row.stocksCount}
                    </span>
                  </Tooltip>
                </div>
              ) : (
                value[0].name
              )
            ) : (
              '-' || '-'
            )}
          </span>
        </Tooltip>
      ),
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>Hesab</span>
          <div className={styles.buttonSortIcon}>
            <FaCaretUp
              color={
                filters.orderBy === 'cashboxesCount' && filters.order === 'asc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('cashboxesCount', 'asc')}
            />
            <FaCaretDown
              color={
                filters.orderBy === 'cashboxesCount' && filters.order === 'desc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('cashboxesCount', 'desc')}
            />
          </div>
        </div>
      ),
      width: 150,
      dataIndex: 'cashboxes',
      align: 'center',
      ellipsis: true,
      render: (value, row) => (
        <Tooltip
          placement="topLeft"
          title={value && value.length > 0 ? value[0].name : ''}
        >
          <span>
            {value && value.length > 0 ? (
              value.length > 1 ? (
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <span className={styles.ellipsisDiv}>{value[0].name}</span>
                  <Tooltip
                    placement="right"
                    title={
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {value.map(cashbox => (
                          <span>{cashbox.name}</span>
                        ))}
                      </div>
                    }
                  >
                    <span className={styles.serialNumberCount}>
                      {row.cashboxesCount}
                    </span>
                  </Tooltip>
                </div>
              ) : (
                value[0].name
              )
            ) : (
              '-' || '-'
            )}
          </span>
        </Tooltip>
      ),
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>Qiymət tipi</span>
          <div className={styles.buttonSortIcon}>
            <FaCaretUp
              color={
                filters.orderBy === 'priceTypesCount' && filters.order === 'asc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('priceTypesCount', 'asc')}
            />
            <FaCaretDown
              color={
                filters.orderBy === 'priceTypesCount' &&
                filters.order === 'desc'
                  ? '#fff'
                  : '#ccc'
              }
              onClick={() => handleSortTable('priceTypesCount', 'desc')}
            />
          </div>
        </div>
      ),
      width: 150,
      dataIndex: 'priceTypes',
      ellipsis: true,
      align: 'center',
      render: (value, row) =>
       <Tooltip
       placement='topLeft'
       title={value && value.length > 0 ? value[0].name : ''}
       >
       <span style={{display: 'inline-flex', alignItems: 'center'}}>
        <div className={styles.ellipsisDiv} style={{width: 100}}>
          {value[0].name}
        </div>
          {
             value && value.length > 0 ? (
              value.length > 1 ? (
                  <Tooltip
                    placement="right"
                    title={
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {value.map(cashbox => (
                          <span>{cashbox.name}</span>
                        ))}
                      </div>
                    }
                  >
                    <span className={styles.serialNumberCount}>
                      {row.priceTypesCount || value.length}
                    </span>
                  </Tooltip>
         
              ) : (
                value[0].name
              )
            ) : (
              '-'
            )
          }
        </span>
       </Tooltip>
    },
    {
      title: 'Status',
      dataIndex: 'isDeleted',
      align: 'center',
      width: 100,
      render: value => getStatusType(value),
    },
    {
      title: 'Seç',
      width: 90,
      dataIndex: 'id',
      align: 'center',
      render: (value, row) => (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <DetailButton
            onClick={() => handleDetailsModal(row)}
            style={
              value === null
                ? isEditDisabled
                  ? { marginRight: '17px' }
                  : {}
                : {}
            }
          />
          {value === null ? (
            ''
          ) : (
            <div
              className={
                row.isDeleted ? styles.editDisabled : styles.editActive
              }
            >
              <Can I={accessTypes.manage} a={permissions.business_unit}>
                <ProDots isDisabled={row.isDeleted}>
                  <>
                    <ProDotsItem
                      label="Düzəliş et"
                      icon="pencil"
                      onClick={() =>
                        history.push(
                          `/business_unit/business_unit/edit?id=${value}`
                        )
                      }
                    />
                    <ProDotsItem
                      label="Sil"
                      icon="trash"
                      onClick={() => removeBusinessUnit(row)}
                    />
                  </>
                </ProDots>
              </Can>
            </div>
          )}
        </div>
      ),
    },
  ];
  return (
    <section>
      <ProModal
        maskClosable
        padding
        width={900}
        isVisible={details}
        handleModal={handleDetailsModal}
      >
        <BusinessUnitDetail
          row={selectedRow}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onCancel={handleDetailsModal}
          visible={details}
          {...props}
        />
      </ProModal>
      <DeleteModal
        row={selectedRow}
        setVisible={setDeleteModalVisibe}
        visible={deleteModalVisibe}
        deleteOperation={handleDeleteOperation}
      />
      <BusinessUnitSideBar
        {...{
          filterSelectedStocks,
          filterSelectedStructures,
          allCashBoxNames,
          filters,
          onFilter,
          businessUnits,
          fetchSalesInvoiceSearch,
          profile,
          filterSelectedTenantPersons,
          filterSelectedCashBoxes,
          filterSelectedProductPriceTypes
        }}
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
                  <Can I={accessTypes.manage} a={permissions.business_unit}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <ExcelButton />
                      <Link to="/business_unit/business_unit/add">
                        <IconButton
                          buttonSize="large"
                          className={styles.newContactButton}
                          label="Yeni biznes blok"
                          icon="new"
                          style={{ marginLeft: '15px' }}
                        />
                      </Link>
                    </div>
                  </Can>
                </Col>
              </Row>
              <Table
                loading={isLoading || actionLoading}
                scroll={{ x: 'max-content' }}
                dataSource={businessUnits}
                columns={columns}
                rowKey={record => record.id}
                pagination={false}
                rowClassName={record => {
                  const className = styles.row;
                  let customClassName = '';
                  if (record.id === null) customClassName = styles.bgColor;
                  return `${className} ${customClassName}`;
                }}
                className={styles.table}
              />
            </Col>
          </Row>
        </div>
      </section>
    </section>
  );
}

const mapStateToProps = state => ({
  isLoading: state.businessUnitReducer.isLoading,
  actionLoading: state.businessUnitReducer.actionLoading,
  businessUnits: state.businessUnitReducer.businessUnits,
  allCashBoxNames: state.kassaReducer.allCashBoxNames,
  structures: state.structureReducer.structures,
  users: state.usersReducer.users,
  stocks: state.stockReducer.stocks,
  priceTypes: state.mehsulReducer.productPriceTypes,
  permissionsByKeyValue: state.permissionsReducer.permissionsByKeyValue,
  profile: state.profileReducer.profile
});

export default connect(
  mapStateToProps,
  {
    fetchAllCashboxNames,
    fetchUsers,
    fetchStructures,
    fetchStocks,
    fetchBusinessUnitList,
    fetchProductPriceTypes,
    deleteBusinessUnit,
    fetchFilteredStocks,
    fetchFilteredStructures,
    fetchFilteredCashboxes,
    fetchFilteredProductPriceTypes
  }
)(BusinessUnitTab);
